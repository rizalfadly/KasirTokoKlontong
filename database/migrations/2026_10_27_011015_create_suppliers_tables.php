<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('type', 12)->default('supplier'); // supplier, distributor, peternak
            $table->string('contact_person', 100)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('whatsapp', 30)->nullable();
            $table->string('address', 250)->nullable();
            $table->string('payment_terms', 12)->default('tunai'); // tunai, tempo7, tempo14, tempo30
            $table->string('bank_account', 150)->nullable();
            $table->unsignedSmallInteger('lead_time_days')->nullable();
            $table->string('min_order', 100)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('card_version')->nullable();
            $table->timestamps();
        });

        Schema::create('supplier_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->unique()->constrained()->cascadeOnDelete();
            $table->mediumText('data'); // gambar kartu nama (base64)
            $table->timestamps();
        });

        Schema::create('supplier_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('price');                    // harga beli per satuan produk
            $table->unsignedInteger('previous_price')->nullable(); // harga sebelum diubah terakhir
            $table->string('note', 100)->nullable();
            $table->timestamps();

            $table->unique(['supplier_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supplier_prices');
        Schema::dropIfExists('supplier_cards');
        Schema::dropIfExists('suppliers');
    }
};