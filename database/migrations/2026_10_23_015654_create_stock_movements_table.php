<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            // cascadeOnDelete: produk yang belum pernah terjual boleh dihapus permanen beserta catatannya
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20); // initial, sale, void, purchase, adjustment, opname
            $table->decimal('qty_change', 12, 3); // + masuk, - keluar
            $table->decimal('stock_after', 12, 3);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sale_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('opname_id')->nullable(); // dipakai di tahap opname
            $table->string('reason', 200)->nullable();
            $table->timestamps();

            $table->index(['product_id', 'created_at']);
        });

        // Stok saat ini dijadikan saldo awal tiap produk
        foreach (DB::table('products')->get(['id', 'stock']) as $p) {
            DB::table('stock_movements')->insert([
                'product_id'  => $p->id,
                'type'        => 'initial',
                'qty_change'  => $p->stock,
                'stock_after' => $p->stock,
                'reason'      => 'Saldo awal',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};