<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
        // Error 403 (akses ditolak) tampil sebagai halaman buatan kita
        if ($response->getStatusCode() === 403 && ! $request->expectsJson()) {
            return Inertia::render('Forbidden')
                ->toResponse($request)
                ->setStatusCode(403);
        }
        return $response;
    });

    //  ->withExceptions(function (Exceptions $exceptions) {
    //     $exceptions->respond(function (Response $response, Throwable $e, Request $request) {
    //     $status = $response->getStatusCode();

    //     // Saat pengembangan (local), biarkan halaman debug Laravel tampil
    //     if (app()->environment(['local', 'testing'])) {
    //         return $response;
    //     }

    //     if (in_array($status, [404, 500, 503], true)) {
    //         try {
    //             return Inertia::render('error/error', ['status' => $status])
    //                 ->toResponse($request)
    //                 ->setStatusCode($status);
    //         } catch (Throwable) {
    //             // Kalau Inertia sendiri gagal (mis. database mati), pakai halaman HTML cadangan
    //             return $response;
    //         }
    //     }

    //     return $response;
    //     });
    })->create();