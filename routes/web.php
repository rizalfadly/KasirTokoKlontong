<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OpnameController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StoreSettingController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\CheckRole;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard');

// Terbuka untuk semua orang (tamu melihat versi terbatas)
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/produk/{product}/gambar', [ProductController::class, 'image'])->whereNumber('product');
Route::get('/logo-toko', [StoreSettingController::class, 'logo']);

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
    Route::post('/produk/{product}/stok', [StockController::class, 'adjust'])->whereNumber('product');
    Route::get('/buku-stok', [StockController::class, 'index']);
    Route::get('/opname', [OpnameController::class, 'index']);
    Route::post('/opname', [OpnameController::class, 'store']);
    Route::get('/opname/{opname}', [OpnameController::class, 'show'])->whereNumber('opname');
    Route::post('/opname/{opname}/hitung', [OpnameController::class, 'count'])->whereNumber('opname');
    Route::post('/opname/{opname}/kirim', [OpnameController::class, 'submit'])->whereNumber('opname');
    Route::delete('/opname/{opname}', [OpnameController::class, 'destroy'])->whereNumber('opname');
    Route::get('/opname/{opname}/export', [OpnameController::class, 'export'])->whereNumber('opname');
  
});

// Hanya owner
Route::middleware(['auth', CheckRole::class . ':owner'])->group(function () {
    Route::get('/pengguna', [UserController::class, 'index']);
    Route::post('/pengguna', [UserController::class, 'store']);
    Route::put('/pengguna/{user}', [UserController::class, 'update']);
    
    Route::get('/pengaturan', [StoreSettingController::class, 'index']);
    Route::put('/pengaturan', [StoreSettingController::class, 'update']);
    Route::delete('/pengguna/{user}', [UserController::class, 'destroy']);
    Route::post('/opname/{opname}/setujui', [OpnameController::class, 'approve'])->whereNumber('opname');
    Route::post('/opname/{opname}/kembalikan', [OpnameController::class, 'reject'])->whereNumber('opname');
});

require __DIR__ . '/auth.php';