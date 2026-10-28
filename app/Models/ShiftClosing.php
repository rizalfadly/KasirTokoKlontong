<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShiftClosing extends Model
{
    protected $guarded = [];

    protected $casts = [
        'by_method'    => 'array',
        'period_start' => 'datetime',
        'period_end'   => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}