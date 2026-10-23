<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockOpnameItem extends Model
{
    protected $fillable = ['stock_opname_id', 'product_id', 'system_qty', 'counted_qty', 'difference', 'price'];

    protected $casts = [
        'system_qty'  => 'float',
        'counted_qty' => 'float',
        'difference'  => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}