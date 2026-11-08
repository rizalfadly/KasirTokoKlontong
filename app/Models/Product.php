<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class Product extends Model
{
    use SoftDeletes;

    public const UNITS = ['kilo', 'liter', 'pcs', 'buah', 'unit', 'plastik', 'dus'];

    // Satuan yang boleh berpecahan (1,5 kilo). Satuan lain harus bulat.
    public const DECIMAL_UNITS = ['kilo', 'liter'];

    protected $fillable = [
        'name', 'sku', 'barcode', 'price', 'stock', 'unit', 'icon', 'cost_price',
        'wholesale_price', 'wholesale_min_qty', 'limit_qty', 'limit_orders', 'limit_period',
        'limit_orders',
     ];

    protected $hidden = ['cost_price'];
    

    protected $casts = [
        'stock'             => 'float',
        'wholesale_min_qty' => 'float',
        'limit_qty'         => 'float',
        'limit_orders'      => 'integer',
    ];

    // Alamat foto dikirim ke tampilan bersama data produk
    protected $appends = ['image_url'];

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_version
            ? "/produk/{$this->id}/gambar?v={$this->image_version}"
            : null;
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function opnameItems()
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    // SKU otomatis berikutnya: PRD-0001, PRD-0002, ...
    public static function generateSku(): string
    {
        $n = (static::withTrashed()->max('id') ?? 0) + 1;

        do {
            $sku = 'PRD-' . str_pad((string) $n, 4, '0', STR_PAD_LEFT);
            $n++;
        } while (static::withTrashed()->where('sku', $sku)->exists());

        return $sku;
    }
    
    public function priceFor(float $qty, bool $grosir): int
    {
        if ($grosir && $this->wholesale_price !== null && $qty >= (float) $this->wholesale_min_qty) {
            return (int) $this->wholesale_price;
        }
        return (int) $this->price;
    }
}