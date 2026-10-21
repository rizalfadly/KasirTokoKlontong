<?php

namespace App\Models;
use App\Models\Product; 

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = ['sale_id', 'product_id', 'qty', 'price', 'subtotal'];
    protected $casts = [
    'qty' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    // Hanya item dari transaksi yang tidak dibatalkan
    public function scopeActive($query)
    {
        return $query->whereHas('sale', fn ($q) => $q->whereNull('voided_at'));
    }

}