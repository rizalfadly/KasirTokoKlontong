<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\StoreSetting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
        {
            return [
                ...parent::share($request),
                'auth' => [
                    'user' => $request->user(),
                ],
                'store' => function () {
                    $s = \App\Models\StoreSetting::current();

                    return ['name' => $s->name, 'logo_url' => $s->logo_url];
                },
            ];
        }
    
}
