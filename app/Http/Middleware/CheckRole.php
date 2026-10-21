<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Kalau peran pengguna tidak ada di daftar yang diizinkan, tolak (403)
        abort_unless(in_array($request->user()?->role, $roles, true), 403);

        return $next($request);
    }
}