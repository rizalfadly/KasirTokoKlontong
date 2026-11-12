<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    private const ROLES = ['owner', 'admin', 'kasir'];

    public function index()
    {
        return Inertia::render('pengguna/pengguna', [
            'users' => User::withCount('sales')
                ->orderBy('name')
                ->get(['id', 'name', 'username', 'role', 'is_active']),
            'roles' => self::ROLES,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100'],
            'username' => [
                'required', 'string', 'min:3', 'max:30', 'regex:/^[A-Za-z0-9_.-]+$/',
                function ($attribute, $value, $fail) {
                    if (User::whereRaw('LOWER(username) = ?', [Str::lower($value)])->exists()) {
                        $fail('Username sudah dipakai.');
                    }
                },
            ],
            'role'     => ['required', Rule::in(self::ROLES)],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name'      => $data['name'],
            'username'  => $data['username'],
            'role'      => $data['role'],
            'is_active' => true,
            // Email tidak dipakai untuk login, tapi kolomnya wajib dan unik
            'email'     => Str::lower($data['username']) . '@kasir.local',
            'password'  => Hash::make($data['password']),
        ]);

        return back();
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:100'],
            'role'      => ['required', Rule::in(self::ROLES)],
            'is_active' => ['required', 'boolean'],
            'password'  => ['nullable', 'string', 'min:8'],
        ]);

        // Cegah owner mengunci dirinya sendiri
        if ($user->id === $request->user()->id && ($data['role'] !== 'owner' || ! $data['is_active'])) {
            return back()->withErrors([
                'role' => 'Kamu tidak bisa menurunkan peran atau menonaktifkan akunmu sendiri.',
            ]);
        }

        $user->fill([
            'name'      => $data['name'],
            'role'      => $data['role'],
            'is_active' => $data['is_active'],
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return back();
    }

    public function destroy(Request $request, User $user)
    {
        // Tidak boleh menghapus akun sendiri
        abort_if($user->id === $request->user()->id, 403);

        // Akun yang punya jejak apa pun tidak dihapus, supaya riwayat tetap bisa ditelusuri
        $hasHistory = $user->sales()->exists()
            || Sale::where('voided_by', $user->id)->exists()
            || StockOpname::where('created_by', $user->id)->orWhere('approved_by', $user->id)->exists()
            || StockMovement::where('user_id', $user->id)->exists();

        if ($hasHistory) {
            return back()->withErrors([
                'delete' => 'Akun ini sudah punya riwayat (transaksi, stok, atau opname), jadi tidak bisa dihapus. Nonaktifkan saja lewat Edit.',
            ]);
        }

        DB::transaction(function () use ($user) {
            $user->notifications()->delete();
            $user->delete();
        });

        return back();
    }
}