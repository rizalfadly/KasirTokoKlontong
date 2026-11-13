<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Event;
use App\Services\Audit;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Event::listen(Failed::class, function ($e) {
            Audit::log('login.failed', 'Login gagal untuk username: ' . ($e->credentials['username'] ?? '-'));
        });

        Event::listen(Login::class, function ($e) {
            Audit::log('login.success', "Login berhasil: {$e->user->username}", $e->user);
        });

        Event::listen(Logout::class, function ($e) {
            if ($e->user) {
                Audit::log('logout', "Logout: {$e->user->username}", $e->user);
            }
        });
    }
}
