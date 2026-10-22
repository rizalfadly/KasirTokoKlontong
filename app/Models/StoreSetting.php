<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = ['name', 'address', 'phone', 'slogan', 'footer'];

    // Isi gambar tidak ikut terkirim ke halaman (berat); yang dikirim hanya alamatnya
    protected $hidden = ['logo'];

    protected $appends = ['logo_url'];

    // Toko hanya punya satu baris pengaturan
    public static function current(): self
    {
        return static::first() ?? static::create(['name' => 'Kasir Telur']);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_version ? "/logo-toko?v={$this->logo_version}" : null;
    }
}