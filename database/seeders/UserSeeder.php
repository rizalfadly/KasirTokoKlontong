<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // GANTI password di bawah sebelum dijalankan, dan jangan commit password asli ke Git.
        $users = [
            ['name' => 'Pemilik Toko', 'username' => 'owner',  'role' => 'owner', 'password' => 'owner12345'],
            ['name' => 'Admin Toko',   'username' => 'admin',  'role' => 'admin', 'password' => 'Admin12345'],
            ['name' => 'Kasir 1',      'username' => 'kasir1', 'role' => 'kasir', 'password' => 'Kasir12345'],
            ['name' => 'Kasir 2',      'username' => 'kasir2', 'role' => 'kasir', 'password' => 'Kasir12345'],
        ];

        foreach ($users as $u) {
            // Hanya membuat akun yang belum ada. Akun yang sudah ada TIDAK ditimpa,
            // jadi password yang sudah diganti lewat aplikasi tidak ter-reset.
            if (User::where('username', $u['username'])->exists()) {
                continue;
            }

            (new User())->forceFill([
                'name'      => $u['name'],
                'username'  => $u['username'],
                'email'     => $u['username'] . '@kasir.local', // kolom wajib & unik, tidak dipakai login
                'role'      => $u['role'],
                'is_active' => true,
                'password'  => Hash::make($u['password']),
            ])->save();
        }
    }
}