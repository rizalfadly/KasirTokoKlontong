<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
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
            'name'    => ['required', 'string', 'max:60'],
            'address' => ['nullable', 'string', 'max:200'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'slogan'  => ['nullable', 'string', 'max:100'],
            'footer'  => ['nullable', 'string', 'max:200'],
        ]);

        StoreSetting::current()->update($data);

        return back();
    }
}