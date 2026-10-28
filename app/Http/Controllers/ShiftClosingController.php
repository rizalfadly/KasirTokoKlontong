<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\ShiftClosing;
use App\Services\Notifier;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ShiftClosingController extends Controller
{
    // Daftar setoran: kasir melihat miliknya, owner melihat semua
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

    // Kasir mengirim rekap. Angka DIHITUNG ULANG di server, bukan dipercaya dari browser.
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'date'         => ['required', 'date'],
            'from'         => ['required', 'date_format:H:i'],
            'to'           => ['required', 'date_format:H:i'],
            'opening_cash' => ['required', 'integer', 'min:0'],
            'counted_cash' => ['required', 'integer', 'min:0'],
            'note'         => ['nullable', 'string', 'max:200'],
        ]);

        $from = Carbon::parse("{$data['date']} {$data['from']}")->startOfMinute();
        $to   = Carbon::parse("{$data['date']} {$data['to']}")->endOfMinute();

        $base = fn () => Sale::where('user_id', $user->id)->whereBetween('created_at', [$from, $to]);

        $byMethod = $base()->whereNull('voided_at')
            ->selectRaw('payment_method, COUNT(*) as count, COALESCE(SUM(total),0) as total')
            ->groupBy('payment_method')->get()
            ->mapWithKeys(fn ($r) => [$r->payment_method => ['count' => (int) $r->count, 'total' => (int) $r->total]]);

        $count = (int) $byMethod->sum('count');

        if ($count === 0) {
            throw ValidationException::withMessages(['status' => 'Tidak ada transaksi pada periode ini.']);
        }

        // Cegah kirim dua kali untuk periode yang bertumpuk
        $overlap = ShiftClosing::where('user_id', $user->id)
            ->whereIn('status', ['submitted', 'approved'])
            ->where('period_start', '<=', $to)->where('period_end', '>=', $from)
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'status' => 'Periode ini bertumpuk dengan setoran yang sudah dikirim atau disetujui.',
            ]);
        }

        $voided   = $base()->whereNotNull('voided_at')->selectRaw('COUNT(*) as c, COALESCE(SUM(total),0) as t')->first();
        $tunai    = (int) ($byMethod['tunai']['total'] ?? 0);
        $expected = (int) $data['opening_cash'] + $tunai;

        $closing = ShiftClosing::create([
            'user_id'       => $user->id,
            'period_start'  => $from,
            'period_end'    => $to,
            'opening_cash'  => $data['opening_cash'],
            'total'         => (int) $byMethod->sum('total'),
            'sales_count'   => $count,
            'by_method'     => $byMethod,
            'voided_count'  => (int) $voided->c,
            'voided_total'  => (int) $voided->t,
            'expected_cash' => $expected,
            'counted_cash'  => $data['counted_cash'],
            'difference'    => $data['counted_cash'] - $expected,
            'note'          => $data['note'] ?? null,
            'status'        => 'submitted',
        ]);

        Notifier::toRoles(
            ['owner'],
            'shift',
            'Setoran shift menunggu persetujuan',
            "{$user->username} mengirim rekap shift ({$count} transaksi).",
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

        $this->review($request, $closing, 'approved', $data['review_note'] ?? null, 'Setoran shift disetujui');

        return redirect('/setoran');
    }

    public function reject(Request $request, ShiftClosing $closing)
    {
        abort_unless($request->user()->role === 'owner', 403);
        $data = $request->validate(['review_note' => ['required', 'string', 'min:3', 'max:200']]);

        $this->review($request, $closing, 'rejected', $data['review_note'], 'Setoran shift dikembalikan');

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
}