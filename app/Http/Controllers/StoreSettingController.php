<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;

class StoreSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('pengaturan/pengaturan', [
            'store' => StoreSetting::current(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:60'],
            'address'     => ['nullable', 'string', 'max:200'],
            'phone'       => ['nullable', 'string', 'max:30'],
            'slogan'      => ['nullable', 'string', 'max:100'],
            'footer'      => ['nullable', 'string', 'max:200'],
            'remove_logo' => ['nullable', 'boolean'],
            'logo'        => [
                'nullable', 'string', 'max:300000',
                function ($attribute, $value, $fail) {
                    if (! preg_match('#^data:image/(jpeg|png|webp);base64,#', $value)) {
                        $fail('Format logo harus JPG, PNG, atau WebP.');

                        return;
                    }

                    $binary = base64_decode(substr($value, strpos($value, ',') + 1), true);

                    if ($binary === false || @getimagesizefromstring($binary) === false) {
                        $fail('File logo tidak valid.');
                    }
                },
            ],
        ]);

        $setting = StoreSetting::current();
        $setting->update(Arr::only($data, ['name', 'address', 'phone', 'slogan', 'footer']));

        if (! empty($data['remove_logo'])) {
            $setting->forceFill(['logo' => null, 'logo_version' => null])->save();
        } elseif (! empty($data['logo'])) {
            $setting->forceFill(['logo' => $data['logo'], 'logo_version' => time()])->save();
        }

        return back();
    }

    // Menampilkan logo (dipakai oleh <img src="/logo-toko">)
    public function logo()
    {
        $setting = StoreSetting::current();
        abort_unless($setting->logo, 404);

        [$meta, $base64] = explode(',', $setting->logo, 2);
        preg_match('#^data:(image/[a-z+]+);base64$#', $meta, $m);

        return response(base64_decode($base64), 200, [
            'Content-Type'           => $m[1] ?? 'image/png',
            'Cache-Control'          => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}