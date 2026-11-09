<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Kelompok => [awalan SKU, daftar produk]
        // Produk: [nama, harga per satuan (Rp), stok awal, satuan]
        // Harga hanyalah perkiraan, sesuaikan dengan harga toko Anda.
        // SKU dibuat otomatis dari awalan + nomor urut (mis. POK-001).
        // JANGAN mengubah urutan produk di dalam kelompok, karena nomor SKU mengikuti urutan.
        // Produk baru tambahkan di AKHIR kelompok.
        $groups = [
            'Bahan pokok' => ['POK', [
                ['Beras Premium', 15500, 100, 'kilo'],
                ['Beras Medium', 13500, 150, 'kilo'],
                ['Gula Pasir', 18000, 60, 'kilo'],
                ['Tepung Terigu', 12000, 40, 'kilo'],
                ['Tepung Tapioka', 14000, 25, 'kilo'],
                ['Telur Ayam Negeri', 28000, 50, 'kilo'],
                ['Telur Bebek', 3500, 120, 'buah'],
                ['Minyak Goreng Curah', 18000, 40, 'liter'],
                ['Minyak Goreng Kemasan 2 Liter', 40000, 24, 'pcs'],
                ['Garam Dapur Halus', 4000, 50, 'pcs'],
                ['Kacang Tanah', 32000, 20, 'kilo'],
                ['Kacang Hijau', 26000, 15, 'kilo'],
                ['Kedelai', 14000, 20, 'kilo'],
                ['Santan Instan 65 ml', 4500, 48, 'pcs'],
            ]],

            'Sayur dan bumbu segar' => ['SYR', [
                ['Bawang Merah', 40000, 15, 'kilo'],
                ['Bawang Putih', 38000, 12, 'kilo'],
                ['Cabai Merah Besar', 45000, 8, 'kilo'],
                ['Cabai Rawit', 60000, 6, 'kilo'],
                ['Kentang', 18000, 20, 'kilo'],
                ['Tomat', 12000, 10, 'kilo'],
                ['Wortel', 14000, 10, 'kilo'],
                ['Jahe', 25000, 5, 'kilo'],
            ]],

            'Mi dan makanan instan' => ['MIE', [
                ['Indomie Goreng', 3500, 200, 'pcs'],
                ['Indomie Soto', 3300, 120, 'pcs'],
                ['Indomie Ayam Bawang', 3300, 120, 'pcs'],
                ['Mie Sedaap Goreng', 3500, 150, 'pcs'],
                ['Mie Sedaap Soto', 3300, 100, 'pcs'],
                ['Supermi Ayam Bawang', 3000, 100, 'pcs'],
                ['Sarimi Isi 2 Ayam Kecap', 4500, 60, 'pcs'],
                ['Pop Mie Ayam', 6500, 48, 'pcs'],
                ['Bihun Jagung', 5000, 40, 'pcs'],
                ['Indomie Goreng 1 Dus', 125000, 5, 'dus'],
            ]],

            'Makanan kaleng' => ['KLG', [
                ['Sarden Kaleng 155 g', 11000, 24, 'pcs'],
                ['Kornet Sapi Kaleng', 22000, 12, 'pcs'],
                ['Susu Kental Manis Kaleng', 12000, 36, 'pcs'],
            ]],

            'Minuman' => ['MNM', [
                ['Air Mineral 600 ml', 4000, 120, 'pcs'],
                ['Air Mineral 1,5 Liter', 7000, 48, 'pcs'],
                ['Galon Isi Ulang', 20000, 20, 'pcs'],
                ['Air Mineral 600 ml 1 Dus', 85000, 6, 'dus'],
                ['Teh Pucuk Harum', 5000, 48, 'pcs'],
                ['Teh Botol Sosro', 5500, 48, 'pcs'],
                ['Coca-Cola 600 ml', 6500, 36, 'pcs'],
                ['Sprite 600 ml', 6500, 36, 'pcs'],
                ['Pocari Sweat 500 ml', 8500, 24, 'pcs'],
                ['Susu UHT Cokelat 250 ml', 6500, 48, 'pcs'],
                ['Kopi Kapal Api Sachet', 1500, 150, 'pcs'],
                ['Kopi ABC Susu Sachet', 1500, 150, 'pcs'],
                ['Good Day Cappuccino Sachet', 2000, 120, 'pcs'],
                ['Nescafe Classic Sachet', 2500, 80, 'pcs'],
                ['Teh Celup Sariwangi 25 pcs', 8500, 30, 'pcs'],
                ['Energen Cokelat Sachet', 2000, 80, 'pcs'],
                ['Milo Sachet', 2500, 60, 'pcs'],
                ['Marimas Sachet', 1000, 100, 'pcs'],
                ['Nutrisari Sachet', 1500, 80, 'pcs'],
            ]],

            'Bumbu dapur' => ['BMB', [
                ['Kecap Manis Botol 275 ml', 9500, 24, 'pcs'],
                ['Kecap Manis Sachet', 1500, 100, 'pcs'],
                ['Saus Sambal Botol 275 ml', 10000, 24, 'pcs'],
                ['Saus Tomat Botol 275 ml', 10000, 24, 'pcs'],
                ['Royco Ayam Sachet', 500, 100, 'pcs'],
                ['Masako Ayam Sachet', 500, 100, 'pcs'],
                ['Merica Bubuk Sachet', 1000, 80, 'pcs'],
                ['Ketumbar Bubuk Sachet', 1000, 80, 'pcs'],
                ['Bumbu Nasi Goreng Sachet', 2000, 60, 'pcs'],
                ['Terasi', 3000, 40, 'pcs'],
                ['Cuka Makan Botol', 6000, 15, 'pcs'],
                ['Gula Merah', 22000, 10, 'kilo'],
            ]],

            'Camilan' => ['SNK', [
                ['Chitato 68 g', 9500, 24, 'pcs'],
                ['Taro Snack', 3000, 40, 'pcs'],
                ['Qtela Singkong', 8500, 24, 'pcs'],
                ['Oreo', 8500, 36, 'pcs'],
                ['Roma Kelapa', 8000, 24, 'pcs'],
                ['Biskuit Marie Regal', 9000, 24, 'pcs'],
                ['Tango Wafer', 2000, 60, 'pcs'],
                ['Chiki Balls', 2000, 60, 'pcs'],
                ['Permen Kopiko', 500, 200, 'pcs'],
                ['Permen Relaxa', 500, 200, 'pcs'],
                ['Beng-Beng', 2500, 60, 'pcs'],
                ['Good Time Cookies', 5000, 36, 'pcs'],
                ['SilverQueen Mini', 7000, 24, 'pcs'],
                ['Kerupuk Udang 1 Plastik', 12000, 15, 'plastik'],
                ['Kerupuk Aci Mentah 1 Plastik', 10000, 15, 'plastik'],
                ['Roti Tawar', 16000, 10, 'pcs'],
                ['Kacang Garing 1 Plastik', 9000, 12, 'plastik'],
            ]],

            'Kebersihan dan perawatan' => ['KBS', [
                ['Sabun Mandi Lifebuoy', 4500, 36, 'pcs'],
                ['Sabun Mandi Lux', 4500, 36, 'pcs'],
                ['Shampo Sunsilk Sachet', 1000, 100, 'pcs'],
                ['Shampo Clear Sachet', 1000, 100, 'pcs'],
                ['Pasta Gigi Pepsodent 75 g', 9500, 24, 'pcs'],
                ['Sikat Gigi', 5000, 24, 'pcs'],
                ['Deterjen Rinso Sachet', 1500, 100, 'pcs'],
                ['Deterjen Daia 800 g', 17000, 15, 'pcs'],
                ['Sabun Cuci Piring Sunlight Sachet', 1500, 60, 'pcs'],
                ['Pewangi Downy Sachet', 1500, 60, 'pcs'],
                ['Pembersih Lantai Wipol Sachet', 1500, 60, 'pcs'],
                ['Tisu Paseo', 10000, 24, 'pcs'],
                ['Pembalut Charm 10 pcs', 9000, 24, 'pcs'],
                ['Sabun Cuci Tangan Refill', 14000, 12, 'pcs'],
            ]],

            'Lain-lain' => ['LNN', [
                ['Korek Api Gas', 2500, 60, 'pcs'],
                ['Baterai ABC AA (isi 2)', 6500, 30, 'pcs'],
                ['Gas Elpiji 3 kg', 22000, 10, 'unit'],
            ]],
        ];

        foreach ($groups as [$prefix, $items]) {
            foreach ($items as $i => [$name, $price, $stock, $unit]) {
                $sku = sprintf('%s-%03d', $prefix, $i + 1);

                // Satuan harus ada di daftar resmi aplikasi
                if (! in_array($unit, Product::UNITS, true)) {
                    throw new \RuntimeException("Satuan '{$unit}' (produk {$name}) tidak ada di Product::UNITS.");
                }

                // Lewati kalau SKU atau nama sudah ada (termasuk yang pernah dihapus/soft delete),
                // supaya produk, harga, dan stok yang sudah diubah tidak tertimpa.
                $exists = Product::withTrashed()
                    ->where(fn ($q) => $q->where('sku', $sku)->orWhere('name', $name))
                    ->exists();

                if ($exists) {
                    continue;
                }

                (new Product())->forceFill([
                    'sku'   => $sku,
                    'name'  => $name,
                    'price' => $price,
                    'stock' => $stock,
                    'unit'  => $unit,
                ])->save();
            }
        }
    }
}
