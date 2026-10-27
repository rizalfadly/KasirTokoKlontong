<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupplierPrice extends Model
{
    protected $fillable = ['supplier_id', 'product_id', 'price', 'previous_price', 'note'];

    protected $casts = [
        'price'          => 'integer',
        'previous_price' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}