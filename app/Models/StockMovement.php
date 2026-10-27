<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id', 'type', 'qty_change', 'stock_after', 'unit_cost',
        'user_id', 'sale_id', 'supplier_id', 'opname_id', 'reason',
    ];

    protected $casts = [
        'qty_change'  => 'float',
        'stock_after' => 'float',
        'unit_cost'   => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}