<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shift_closings', function (Blueprint $table) {
            $table->string('kind', 10)->default('toko')->after('user_id'); // toko|grosir
            $table->json('by_customer')->nullable()->after('by_method');
            $table->index(['kind', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('shift_closings', function (Blueprint $table) {
            $table->dropIndex(['kind', 'status']);
            $table->dropColumn(['kind', 'by_customer']);
        });
    }
};