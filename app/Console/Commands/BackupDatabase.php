<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database';

    protected $description = 'Cadangkan database ke file .sql bertanggal';

    public function handle(): int
    {
        $config = config('database.connections.' . config('database.default'));

        if (! in_array($config['driver'] ?? null, ['mysql', 'mariadb'], true)) {
            $this->error('Backup ini hanya untuk MySQL/MariaDB.');

            return self::FAILURE;
        }

        $dir = storage_path('app/backups');
        File::ensureDirectoryExists($dir);

        $file = $dir . DIRECTORY_SEPARATOR . 'kasir-' . now()->format('Y-m-d_His') . '.sql';

        // Kata sandi dikirim lewat environment, bukan di baris perintah
        $process = new Process([
            config('backup.mysqldump'),
            '--host=' . $config['host'],
            '--port=' . $config['port'],
            '--user=' . $config['username'],
            '--default-character-set=utf8mb4',
            '--single-transaction',
            '--routines',
            '--result-file=' . $file,
            $config['database'],
        ], null, ['MYSQL_PWD' => (string) ($config['password'] ?? '')]);

        $process->setTimeout(300);

        try {
            $process->run();
        } catch (\Throwable $e) {
            return $this->failed('mysqldump tidak bisa dijalankan: ' . $e->getMessage());
        }

        if (! $process->isSuccessful() || ! $this->looksComplete($file)) {
            File::delete($file);

            return $this->failed(trim($process->getErrorOutput()) ?: 'Hasil cadangan tidak lengkap.');
        }

        $size = round(filesize($file) / 1024);
        $this->info("Cadangan tersimpan: {$file} ({$size} KB)");

        // Salinan kedua di tempat lain
        $copyTo = config('backup.copy_to');
        if ($copyTo) {
            try {
                File::ensureDirectoryExists($copyTo);
                File::copy($file, rtrim($copyTo, '/\\') . DIRECTORY_SEPARATOR . basename($file));
                $this->info("Salinan kedua tersimpan di: {$copyTo}");
            } catch (\Throwable $e) {
                Log::warning('Salinan kedua backup gagal: ' . $e->getMessage());
                $this->warn('Salinan kedua GAGAL: ' . $e->getMessage());
            }
        }

        // Hapus cadangan yang sudah terlalu lama
        $this->prune($dir);
        if ($copyTo) {
            $this->prune($copyTo);
        }

        return self::SUCCESS;
    }

    private function looksComplete(string $file): bool
    {
        if (! is_file($file) || filesize($file) < 500) {
            return false;
        }

        // mysqldump menulis "Dump completed" di baris terakhir jika berhasil
        $handle = fopen($file, 'rb');
        fseek($handle, -200, SEEK_END);
        $tail = fread($handle, 200);
        fclose($handle);

        return str_contains($tail, 'Dump completed');
    }

    private function prune(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        $limit = now()->subDays(config('backup.keep_days'))->timestamp;

        foreach (File::files($dir) as $f) {
            if ($f->getExtension() === 'sql' && str_starts_with($f->getFilename(), 'kasir-') && $f->getMTime() < $limit) {
                File::delete($f->getPathname());
            }
        }
    }

    private function failed(string $message): int
    {
        Log::error('Backup database gagal: ' . $message);
        $this->error('Backup GAGAL: ' . $message);
        $this->line('Periksa MYSQLDUMP_PATH di file .env (lihat langkah 1).');

        return self::FAILURE;
    }
}