<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('kasir')->after('username');
            $table->boolean('is_active')->default(true)->after('role');
        });

        // Akun pertama (yang paling lama) dijadikan owner
        $first = DB::table('users')->orderBy('id')->value('id');
        if ($first) {
            DB::table('users')->where('id', $first)->update(['role' => 'owner']);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active']);
        });
    }
};