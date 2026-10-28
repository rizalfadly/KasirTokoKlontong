<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;

class StockService
{
    // Batas stok menipis (sama dengan yang dipakai di dashboard)
    private const LOW_STOCK = 10;

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

        $movement = StockMovement::create([
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

        self::warnIfLow($product, $type, round($after - $delta, 3), $after);

        return $movement;
    }

    // Beri tahu owner dan admin hanya saat penjualan membuat stok melewati batas
    private static function warnIfLow(Product $product, string $type, float $before, float $after): void
    {
        if ($type !== 'sale' || $after >= $before) {
            return;
        }

        if ($after <= 0 && $before > 0) {
            Notifier::toRoles(
                ['owner', 'admin'],
                'stock_out',
                'Stok habis',
                "{$product->name} ({$product->sku}) sudah habis.",
                '/produk',
            );
        } elseif ($after <= self::LOW_STOCK && $before > self::LOW_STOCK) {
            $left = rtrim(rtrim(number_format($after, 3, ',', ''), '0'), ',');

            Notifier::toRoles(
                ['owner', 'admin'],
                'stock_low',
                'Stok menipis',
                "{$product->name} ({$product->sku}) tinggal {$left} {$product->unit}.",
                '/produk',
            );
        }
    }
}