<?php

namespace App\Models;

use App\Models\StockOpnameItem;
use Illuminate\Database\Eloquent\Model;

class StockOpname extends Model
{
    protected $fillable = [
        'code', 'sku_prefix', 'note', 'status', 'created_by',
        'submitted_at', 'approved_by', 'approved_at', 'review_note',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'approved_at'  => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(StockOpnameItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}