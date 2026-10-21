<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\SaleItem;

class Sale extends Model
{
    protected $fillable = [
        'invoice', 'user_id', 'total', 'paid', 'change_amount',
        'voided_at', 'voided_by', 'void_reason',
    ];

    protected $casts = [
        'voided_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Siapa yang membatalkan
    public function voider()
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    // Hanya transaksi yang tidak dibatalkan
    public function scopeActive($query)
    {
        return $query->whereNull('voided_at');
    }
}