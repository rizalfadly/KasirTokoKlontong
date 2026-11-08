<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProdukKelontongSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Makanan & Mi' => [
                'prefix' => 'MKN',
                'items' => [
                    ['nama' => 'Indomie Goreng Original 85g', 'harga' => 3100, 'stok' => 120, 'satuan' => 'bungkus'],
                    ['nama' => 'Indomie Kuah Ayam Bawang 75g', 'harga' => 3000, 'stok' => 100, 'satuan' => 'bungkus'],
                    ['nama' => 'Mie Sedaap Goreng 90g', 'harga' => 3100, 'stok' => 80, 'satuan' => 'bungkus'],
                    ['nama' => 'Pop Mie Rasa Ayam 75g', 'harga' => 5500, 'stok' => 45, 'satuan' => 'cup'],
                    ['nama' => 'Biskuit Khong Guan Red Assorted 650g', 'harga' => 55000, 'stok' => 15, 'satuan' => 'kaleng'],
                    ['nama' => 'Roma Kelapa Biskuit 300g', 'harga' => 10500, 'stok' => 40, 'satuan' => 'bungkus'],
                ],
            ],
            'Minuman' => [
                'prefix' => 'MNM',
                'items' => [
                    ['nama' => 'Teh Botol Sosro 450ml', 'harga' => 5000, 'stok' => 60, 'satuan' => 'botol'],
                    ['nama' => 'Aqua Air Mineral 600ml', 'harga' => 3500, 'stok' => 150, 'satuan' => 'botol'],
                    ['nama' => 'Le Minerale 1500ml', 'harga' => 6500, 'stok' => 80, 'satuan' => 'botol'],
                    ['nama' => 'Kopi Kapal Api Mantap 165g', 'harga' => 14500, 'stok' => 35, 'satuan' => 'bungkus'],
                    ['nama' => 'Teh Celup SariWangi Isi 25', 'harga' => 6500, 'stok' => 50, 'satuan' => 'box'],
                    ['nama' => 'Susu Kental Manis Frisian Flag Cokelat 370g', 'harga' => 12500, 'stok' => 30, 'satuan' => 'kaleng'],
                ],
            ],
            'Sembako & Bumbu' => [
                'prefix' => 'SBK',
                'items' => [
                    ['nama' => 'Beras Pandan Wangi 5kg', 'harga' => 75000, 'stok' => 20, 'satuan' => 'karung'],
                    ['nama' => 'Minyak Goreng Bimoli 2 Liter', 'harga' => 36000, 'stok' => 40, 'satuan' => 'pouch'],
                    ['nama' => 'Gula Pasir Gulaku 1kg', 'harga' => 17500, 'stok' => 50, 'satuan' => 'kg'],
                    ['nama' => 'Garam Dapur Cap Kapal 250g', 'harga' => 2500, 'stok' => 60, 'satuan' => 'bungkus'],
                    ['nama' => 'Royco Rasa Ayam 230g', 'harga' => 10000, 'stok' => 45, 'satuan' => 'pouch'],
                    ['nama' => 'Kecap Manis Bango 520ml', 'harga' => 24000, 'stok' => 25, 'satuan' => 'pouch'],
                ],
            ],
            'Kebutuhan Mandi & Cuci' => [
                'prefix' => 'KMC',
                'items' => [
                    ['nama' => 'Sabun Mandi Lifebuoy Red 110g', 'harga' => 4500, 'stok' => 70, 'satuan' => 'pcs'],
                    ['nama' => 'Shampoo Pantene Anti Dandruff 160ml', 'harga' => 26500, 'stok' => 20, 'satuan' => 'botol'],
                    ['nama' => 'Pasta Gigi Pepsodent 190g', 'harga' => 12500, 'stok' => 40, 'satuan' => 'pcs'],
                    ['nama' => 'Detergen Rinso Anti Noda 770g', 'harga' => 21000, 'stok' => 30, 'satuan' => 'pouch'],
                    ['nama' => 'Pembersih Lantai Super Pell Apple 770ml', 'harga' => 13500, 'stok' => 25, 'satuan' => 'pouch'],
                ],
            ],
        ];

        $products = [];
        $now = now();

        foreach ($categories as $categoryName => $data) {
            $prefix = $data['prefix'];
            $index = 1;

            foreach ($data['items'] as $item) {
                // Generate SKU: [PREFIX]-[3 HURUF PERTAMA PRODUK]-[NOMOR URUT 3 DIGIT]
                // Contoh: MKN-IND-001
                $subPrefix = strtoupper(substr(Str::slug($item['nama']), 0, 3));
                $sku = sprintf('%s-%s-%03d', $prefix, $subPrefix, $index);

                $products[] = [
                    'sku' => $sku,
                    'nama_produk' => $item['nama'],
                    'kategori' => $categoryName,
                    'harga' => $item['harga'],
                    'stok' => $item['stok'],
                    'satuan' => $item['satuan'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $index++;
            }
        }

        // Jalankan Bulk Insert agar performa seeder cepat
        DB::table('products')->insert($products);
    }
}