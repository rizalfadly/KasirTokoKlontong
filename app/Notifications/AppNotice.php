<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class AppNotice extends Notification
{
    public function __construct(private array $payload)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->payload;
    }
}