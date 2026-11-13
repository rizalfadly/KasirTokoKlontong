<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    // kategori => awalan kolom action
    private const CATEGORIES = ['product', 'sale', 'opname', 'shift', 'user', 'log'];

    public function index(Request $request)
    {
        abort_unless($request->user()->role === 'owner', 403);

        $q = trim((string) $request->query('q', ''));
        $cat = (string) $request->query('cat', '');
        $cat = in_array($cat, self::CATEGORIES, true) ? $cat : '';

        $logs = ActivityLog::with('user:id,username')
            ->when($q !== '', fn ($w) => $w->where('summary', 'like', "%{$q}%"))
            ->when($cat !== '', fn ($w) => $w->where('action', 'like', $cat . '%'))
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('log/log', [
            'logs'    => $logs,
            'filters' => ['q' => $q, 'cat' => $cat],
        ]);
    }
}