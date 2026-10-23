<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('sku_prefix', 40)->nullable(); // kosong = semua produk
            $table->string('note', 200)->nullable();
            $table->string('status', 12)->default('draft'); // draft, submitted, approved
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->string('review_note', 200)->nullable();
            $table->timestamps();
        });

        Schema::create('stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->decimal('system_qty', 12, 3);  // stok menurut sistem saat dihitung
            $table->decimal('counted_qty', 12, 3); // hasil hitung fisik
            $table->decimal('difference', 12, 3);  // hitung - sistem
            $table->unsignedInteger('price');      // harga jual saat itu, untuk nilai selisih
            $table->timestamps();

            $table->unique(['stock_opname_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_opname_items');
        Schema::dropIfExists('stock_opnames');
    }
};