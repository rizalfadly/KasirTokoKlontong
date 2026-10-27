<?php

namespace App\Models;

use App\Models\SupplierPrice;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name', 'type', 'contact_person', 'phone', 'whatsapp', 'address',
        'payment_terms', 'bank_account', 'lead_time_days', 'min_order', 'notes', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['card_url'];

    public function prices()
    {
        return $this->hasMany(SupplierPrice::class);
    }

    public function getCardUrlAttribute(): ?string
    {
        return $this->card_version ? "/supplier/{$this->id}/kartu?v={$this->card_version}" : null;
    }
}