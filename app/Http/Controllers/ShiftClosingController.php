<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\ShiftClosing;
use App\Services\Notifier;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ShiftClosingController extends Controller
{
    // Daftar setoran: pengirim melihat miliknya, owner melihat semua
    public function index(Request $request)
    {
        $user = $request->user();

        $closings = ShiftClosing::with('user:id,username')
            ->when($user->role !== 'owner', fn ($q) => $q->where('user_id', $user->id))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('riwayat/setoran', [
            'closings' => $closings,
            'pending'  => $user->role === 'owner' ? ShiftClosing::where('status', 'submitted')->count() : 0,
        ]);
    }

    // Ringkasan penjualan satu periode. Dihitung di server, bukan dipercaya dari browser.
    private function summarize(int $userId, string $kind, $from, $to): array
    {
        $base = fn () => Sale::where('user_id', $userId)
            ->where('channel', $kind === 'grosir' ? '=' : '!=', 'grosir')
            ->whereBetween('created_at', [$from, $to]);

        $byMethod = $base()->whereNull('voided_at')
            ->selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as total')
            ->groupBy('payment_method')->get()
            ->mapWithKeys(fn ($r) => [$r->payment_method => ['count' => (int) $r->count, 'total' => (int) $r->total]]);

        $byCustomer = null;
        if ($kind === 'grosir') {
            $byCustomer = $base()->whereNull('voided_at')
                ->selectRaw('customer_id, COUNT(*) as count, SUM(total) as total')
                ->groupBy('customer_id')->with('customer:id,name')->get()
                ->map(fn ($r) => ['name' => $r->customer?->name ?? '-', 'count' => (int) $r->count, 'total' => (int) $r->total])
                ->sortByDesc('total')->values()->all();
        }

        $voided = $base()->whereNotNull('voided_at')
            ->selectRaw('COUNT(*) as c, COALESCE(SUM(total),0) as t')->first();

        return [
            'by_method'    => $byMethod,
            'by_customer'  => $byCustomer,
            'count'        => (int) $byMethod->sum('count'),
            'total'        => (int) $byMethod->sum('total'),
            'tunai'        => (int) ($byMethod['tunai']['total'] ?? 0),
            'voided_count' => (int) $voided->c,
            'voided_total' => (int) $voided->t,
        ];
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'kind'         => ['required', Rule::in(['toko', 'grosir'])],
            'date'         => ['required', 'date'],
            'from'         => ['required', 'date_format:H:i'],
            'to'           => ['required', 'date_format:H:i'],
            'opening_cash' => ['required', 'integer', 'min:0'],
            'counted_cash' => ['required', 'integer', 'min:0'],
            'note'         => ['nullable', 'string', 'max:200'],
        ]);

        // Hak akses per jenis
        abort_unless(
            ($data['kind'] === 'grosir' && in_array($user->role, ['admin', 'owner']))
            || ($data['kind'] === 'toko' && in_array($user->role, ['kasir', 'owner'])),
            403
        );

        $from = Carbon::parse("{$data['date']} {$data['from']}")->startOfMinute();
        $to   = Carbon::parse("{$data['date']} {$data['to']}")->endOfMinute();

        $s = $this->summarize($user->id, $data['kind'], $from, $to);

        if ($s['count'] === 0) {
            throw ValidationException::withMessages(['status' => 'Tidak ada transaksi pada periode ini.']);
        }

        // Cegah kirim dua kali untuk periode yang bertumpuk (per jenis)
        $overlap = ShiftClosing::where('user_id', $user->id)
            ->where('kind', $data['kind'])
            ->whereIn('status', ['submitted', 'approved', 'rejected'])
            ->where('period_start', '<=', $to)->where('period_end', '>=', $from)
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'status' => 'Periode ini sudah punya setoran. Buka di Setoran Shift untuk mengoreksi.',
            ]);
        }

        $expected = (int) $data['opening_cash'] + $s['tunai'];

        $closing = ShiftClosing::create([
            'user_id'       => $user->id,
            'kind'          => $data['kind'],
            'period_start'  => $from,
            'period_end'    => $to,
            'opening_cash'  => $data['opening_cash'],
            'total'         => $s['total'],
            'sales_count'   => $s['count'],
            'by_method'     => $s['by_method'],
            'by_customer'   => $s['by_customer'],
            'voided_count'  => $s['voided_count'],
            'voided_total'  => $s['voided_total'],
            'expected_cash' => $expected,
            'counted_cash'  => $data['counted_cash'],
            'difference'    => $data['counted_cash'] - $expected,
            'note'          => $data['note'] ?? null,
            'status'        => 'submitted',
        ]);

        $label = $data['kind'] === 'grosir' ? 'grosir' : 'shift';

        Notifier::toRoles(
            ['owner'],
            'shift',
            "Setoran {$label} menunggu persetujuan",
            "{$user->username} mengirim rekap {$label} ({$s['count']} transaksi).",
            "/setoran/{$closing->id}",
            $user->id,
        );

        return redirect("/setoran/{$closing->id}");
    }

    public function show(Request $request, ShiftClosing $closing)
    {
        $user = $request->user();
        abort_unless($user->role === 'owner' || $closing->user_id === $user->id, 403);

        return Inertia::render('riwayat/setoran-detail', [
            'closing' => $closing->load('user:id,username', 'reviewer:id,username'),
        ]);
    }

    public function approve(Request $request, ShiftClosing $closing)
    {
        abort_unless($request->user()->role === 'owner', 403);
        $data = $request->validate(['review_note' => ['nullable', 'string', 'max:200']]);

        $this->review($request, $closing, 'approved', $data['review_note'] ?? null, 'Setoran disetujui');

        return redirect('/setoran');
    }

    public function reject(Request $request, ShiftClosing $closing)
    {
        abort_unless($request->user()->role === 'owner', 403);
        $data = $request->validate(['review_note' => ['required', 'string', 'min:3', 'max:200']]);

        $this->review($request, $closing, 'rejected', $data['review_note'], 'Setoran dikembalikan');

        return redirect('/setoran');
    }

    private function review(Request $request, ShiftClosing $closing, string $status, ?string $note, string $title): void
    {
        if ($closing->status !== 'submitted') {
            throw ValidationException::withMessages(['status' => 'Setoran ini sudah diproses.']);
        }

        $closing->update([
            'status'      => $status,
            'review_note' => $note,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        Notifier::toUser(
            $closing->user_id,
            'shift',
            $title,
            ($note ? "Catatan: {$note}" : 'Tanpa catatan.'),
            "/setoran/{$closing->id}",
            $request->user()->id,
        );
    }

    // Pengirim memperbaiki setoran yang dikembalikan, lalu mengirim ulang
    public function resubmit(Request $request, ShiftClosing $closing)
    {
        $user = $request->user();

        abort_unless($closing->user_id === $user->id, 403);

        if ($closing->status !== 'rejected') {
            throw ValidationException::withMessages(['status' => 'Hanya setoran yang dikembalikan yang bisa dikoreksi.']);
        }

        $data = $request->validate([
            'opening_cash' => ['required', 'integer', 'min:0'],
            'counted_cash' => ['required', 'integer', 'min:0'],
            'note'         => ['nullable', 'string', 'max:200'],
        ]);

        $s = $this->summarize($user->id, $closing->kind ?? 'toko', $closing->period_start, $closing->period_end);
        $expected = (int) $data['opening_cash'] + $s['tunai'];

        $closing->update([
            'opening_cash'  => $data['opening_cash'],
            'total'         => $s['total'],
            'sales_count'   => $s['count'],
            'by_method'     => $s['by_method'],
            'by_customer'   => $s['by_customer'],
            'voided_count'  => $s['voided_count'],
            'voided_total'  => $s['voided_total'],
            'expected_cash' => $expected,
            'counted_cash'  => $data['counted_cash'],
            'difference'    => $data['counted_cash'] - $expected,
            'note'          => $data['note'] ?? null,
            'status'        => 'submitted',
            'reviewed_by'   => null,
            'reviewed_at'   => null,
        ]);

        Notifier::toRoles(
            ['owner'],
            'shift',
            'Setoran dikirim ulang',
            "{$user->username} mengoreksi dan mengirim ulang setoran #{$closing->id}.",
            "/setoran/{$closing->id}",
            $user->id,
        );

        return redirect("/setoran/{$closing->id}");
    }
}