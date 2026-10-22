<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('sku', 40)->nullable()->after('name');
            $table->string('barcode', 64)->nullable()->after('sku');
        });

        // Produk yang sudah ada diberi SKU otomatis berdasarkan nomornya
        foreach (DB::table('products')->orderBy('id')->get(['id']) as $p) {
            DB::table('products')
                ->where('id', $p->id)
                ->update(['sku' => 'PRD-' . str_pad((string) $p->id, 4, '0', STR_PAD_LEFT)]);
        }

        // Setelah semua terisi, baru dibuat unik
        Schema::table('products', function (Blueprint $table) {
            $table->unique('sku');
            $table->unique('barcode');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique(['sku']);
            $table->dropUnique(['barcode']);
            $table->dropColumn(['sku', 'barcode']);
        });
    }
};