<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->unsignedInteger('unit_cost')->nullable()->after('stock_after'); // harga beli per satuan
            $table->foreignId('supplier_id')->nullable()->after('sale_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn('unit_cost');
        });
    }
};