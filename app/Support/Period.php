<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Http\Request;

// Membaca filter periode dari alamat (?mode=bulanan&value=2026-10)
class Period
{
    public const FORMATS = ['harian' => 'Y-m-d', 'bulanan' => 'Y-m', 'tahunan' => 'Y'];

    public function __construct(
        public string $mode,
        public string $value,
        public ?Carbon $start,
        public ?Carbon $end,
        public string $label,
    ) {
    }

    public static function fromRequest(Request $request): self
    {
        $mode = (string) $request->query('mode', 'terbaru');

        // Tanpa pilihan periode: tampilkan yang terbaru saja
        if (! isset(self::FORMATS[$mode])) {
            return new self('terbaru', '', null, null, 'Terbaru');
        }

        $format = self::FORMATS[$mode];
        $value = (string) $request->query('value', '');

        try {
            $base = Carbon::createFromFormat('!' . $format, $value);
        } catch (\Throwable $e) {
            $base = null;
        }

        // Nilai tidak valid -> pakai hari/bulan/tahun ini
        if (! $base || $base->format($format) !== $value) {
            $base = now();
        }

        [$start, $end] = match ($mode) {
            'harian'  => [$base->copy()->startOfDay(), $base->copy()->endOfDay()],
            'bulanan' => [$base->copy()->startOfMonth(), $base->copy()->endOfMonth()],
            'tahunan' => [$base->copy()->startOfYear(), $base->copy()->endOfYear()],
        };

        $label = match ($mode) {
            'harian'  => $start->copy()->locale('id')->translatedFormat('l, j F Y'),
            'bulanan' => $start->copy()->locale('id')->translatedFormat('F Y'),
            'tahunan' => 'Tahun ' . $start->format('Y'),
        };

        return new self($mode, $start->format($format), $start, $end, $label);
    }

    // Batasi query ke periode ini (tidak berbuat apa-apa untuk mode "terbaru")
    public function apply($query, string $column = 'created_at')
    {
        if ($this->start) {
            $query->whereBetween($column, [$this->start, $this->end]);
        }

        return $query;
    }

    public function toArray(): array
    {
        return ['mode' => $this->mode, 'value' => $this->value, 'label' => $this->label];
    }
}