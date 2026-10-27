<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;

class StockService
{
    // Catat saldo awal produk baru (stok sudah terisi di produknya)
    public static function initial(Product $product, ?int $userId): StockMovement
    {
        return StockMovement::create([
            'product_id'  => $product->id,
            'type'        => 'initial',
            'qty_change'  => $product->stock,
            'stock_after' => $product->stock,
            'user_id'     => $userId,
            'reason'      => 'Saldo awal',
        ]);
    }

    // Ubah stok lalu catat di buku stok. Panggil di dalam DB::transaction().
    public static function move(
        Product $product,
        float $delta,
        string $type,
        ?int $userId,
        ?string $reason = null,
        ?int $saleId = null,
        ?int $opnameId = null,
        ?int $supplierId = null,
        ?int $unitCost = null,
    ): StockMovement {
        $delta = round($delta, 3);
        $query = Product::withTrashed()->whereKey($product->id);

        if ($delta >= 0) {
            $query->increment('stock', $delta);
        } else {
            $query->decrement('stock', abs($delta));
        }

        $after = (float) Product::withTrashed()->whereKey($product->id)->value('stock');

        return StockMovement::create([
            'product_id'  => $product->id,
            'type'        => $type,
            'qty_change'  => $delta,
            'stock_after' => $after,
            'unit_cost'   => $unitCost,
            'user_id'     => $userId,
            'sale_id'     => $saleId,
            'supplier_id' => $supplierId,
            'opname_id'   => $opnameId,
            'reason'      => $reason,
        ]);
    }
}