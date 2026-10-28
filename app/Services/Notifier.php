<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\AppNotice;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class Notifier
{
    // Kirim ke semua pengguna aktif dengan peran tertentu (pelaku sendiri tidak dikirimi)
    public static function toRoles(
        array $roles,
        string $kind,
        string $title,
        string $body,
        ?string $url = null,
        ?int $exceptUserId = null,
    ): void {
        $users = User::whereIn('role', $roles)
            ->where('is_active', true)
            ->when($exceptUserId, fn ($q, $id) => $q->where('id', '!=', $id))
            ->get();

        self::send($users, $kind, $title, $body, $url);
    }

    // Kirim ke satu pengguna
    public static function toUser(
        ?int $userId,
        string $kind,
        string $title,
        string $body,
        ?string $url = null,
        ?int $exceptUserId = null,
    ): void {
        if (! $userId || $userId === $exceptUserId) {
            return;
        }

        $users = User::where('id', $userId)->where('is_active', true)->get();

        self::send($users, $kind, $title, $body, $url);
    }

    private static function send(Collection $users, string $kind, string $title, string $body, ?string $url): void
    {
        if ($users->isEmpty()) {
            return;
        }

        try {
            Notification::send($users, new AppNotice(compact('kind', 'title', 'body', 'url')));
        } catch (\Throwable $e) {
            Log::warning('Notifikasi gagal dikirim: ' . $e->getMessage());
        }
    }
}