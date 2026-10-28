<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Ringkasan untuk lonceng (dibaca otomatis tiap beberapa detik)
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'unread' => $user->unreadNotifications()->count(),
            'items'  => $user->notifications()->latest()->limit(15)->get()->map(fn ($n) => [
                'id'    => $n->id,
                'kind'  => $n->data['kind'] ?? 'info',
                'title' => $n->data['title'] ?? '',
                'body'  => $n->data['body'] ?? '',
                'url'   => $n->data['url'] ?? null,
                'read'  => $n->read_at !== null,
                'time'  => $n->created_at->toIso8601String(),
            ])->values(),
        ]);
    }

    public function read(Request $request, string $id)
    {
        // Hanya notifikasi milik pengguna ini
        $request->user()->notifications()->whereKey($id)->update(['read_at' => now()]);

        return response()->noContent();
    }

    public function readAll(Request $request)
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->noContent();
    }
}