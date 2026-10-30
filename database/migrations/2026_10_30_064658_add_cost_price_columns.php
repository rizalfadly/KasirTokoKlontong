<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('cost_price')->nullable()->after('price'); // harga beli per satuan
        });

        Schema::table('sale_items', function (Blueprint $table) {
            $table->unsignedInteger('cost_price')->nullable()->after('price'); // salinan modal saat transaksi
        });
    }

    public function down(): void
    {
        Schema::table('sale_items', fn (Blueprint $table) => $table->dropColumn('cost_price'));
        Schema::table('products', fn (Blueprint $table) => $table->dropColumn('cost_price'));
    }
};