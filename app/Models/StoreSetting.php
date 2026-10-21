<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = ['name', 'address', 'phone', 'slogan', 'footer'];

    // Toko hanya punya satu baris pengaturan
    public static function current(): self
    {
        return static::first() ?? static::create(['name' => 'Kasir Telur']);
    }
}