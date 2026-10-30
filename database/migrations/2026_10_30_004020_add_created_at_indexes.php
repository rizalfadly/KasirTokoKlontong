<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['sales', 'stock_movements', 'stock_opnames'] as $table) {
            // Dilewati kalau indeksnya sudah ada (mis. dari migration sebelumnya)
            if (! Schema::hasIndex($table, ['created_at'])) {
                Schema::table($table, fn (Blueprint $t) => $t->index('created_at'));
            }
        }
    }

    public function down(): void
    {
        foreach (['sales', 'stock_movements', 'stock_opnames'] as $table) {
            if (Schema::hasIndex($table, ['created_at'])) {
                Schema::table($table, fn (Blueprint $t) => $t->dropIndex(['created_at']));
            }
        }
    }
};