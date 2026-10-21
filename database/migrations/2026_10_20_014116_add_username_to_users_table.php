<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->unique()->after('name');
        });

        // Akun yang sudah ada diberi username dari bagian sebelum @ pada emailnya
        $used = [];
        foreach (DB::table('users')->orderBy('id')->get() as $user) {
            $username = Str::before($user->email, '@');
            if (in_array(strtolower($username), $used, true)) {
                $username .= $user->id;
            }
            $used[] = strtolower($username);
            DB::table('users')->where('id', $user->id)->update(['username' => $username]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn('username');
        });
    }
};