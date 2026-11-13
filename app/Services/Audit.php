<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class Audit
{
    // Audit::log('sale.void', 'Transaksi INV-1 dibatalkan', $sale, ['reason' => [null, 'salah input']]);
    public static function log(string $action, string $summary, ?Model $subject = null, ?array $changes = null): void
    {
        try {
            ActivityLog::create([
                'user_id'      => auth()->id(),
                'action'       => $action,
                'subject_type' => $subject ? strtolower(class_basename($subject)) : null,
                'subject_id'   => $subject?->getKey(),
                'summary'      => mb_substr($summary, 0, 255),
                'changes'      => $changes,
                'ip'           => request()?->ip(),
            ]);
        } catch (\Throwable $e) {
            // Gagal mencatat log tidak boleh menggagalkan transaksi
            report($e);
        }
    }

    // Bandingkan nilai lama dan baru, hanya yang berubah
    public static function diff(array $old, array $new, array $fields): array
    {
        $out = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $new) && (string) ($old[$f] ?? '') !== (string) ($new[$f] ?? '')) {
                $out[$f] = ['from' => $old[$f] ?? null, 'to' => $new[$f] ?? null];
            }
        }
        return $out;
    }
}