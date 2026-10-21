<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

// Terbuka untuk semua orang (tamu melihat versi terbatas)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/produk/{product}/gambar', [ProductController::class, 'image'])->whereNumber('product');

// Semua yang sudah login: kasir, admin, owner
Route::middleware('auth')->group(function () {
    Route::get('/kasir', [SaleController::class, 'create']);
    Route::post('/kasir', [SaleController::class, 'store']);

    Route::get('/riwayat', [SaleController::class, 'index']);
    Route::get('/riwayat/terakhir', [SaleController::class, 'terakhir']);
    Route::get('/riwayat/{sale}', [SaleController::class, 'show'])->whereNumber('sale');
    Route::post('/riwayat/{sale}/batal', [SaleController::class, 'void'])->whereNumber('sale');
});

// Hanya owner dan admin
Route::middleware(['auth', CheckRole::class . ':owner,admin'])->group(function () {
    Route::resource('produk', ProductController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['produk' => 'product']);

    Route::get('/laporan', [ReportController::class, 'index']);
    Route::get('/laporan/export', [ReportController::class, 'export']);
   // Route::post('/riwayat/{sale}/batal', [SaleController::class, 'void'])->whereNumber('sale');
});

// Hanya owner
Route::middleware(['auth', CheckRole::class . ':owner'])->group(function () {
    Route::get('/pengguna', [UserController::class, 'index']);
    Route::post('/pengguna', [UserController::class, 'store']);
    Route::put('/pengguna/{user}', [UserController::class, 'update']);
    
    Route::get('/pengaturan', [StoreSettingController::class, 'index']);
    Route::put('/pengaturan', [StoreSettingController::class, 'update']);
    Route::delete('/pengguna/{user}', [UserController::class, 'destroy']);
});

require __DIR__ . '/auth.php';