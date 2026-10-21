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

    protected $fillable = ['name', 'price', 'stock', 'unit', 'icon'];

    protected $casts = [
        'stock' => 'float',
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
}