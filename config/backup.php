<?php

return [
    // Lokasi program mysqldump
    'mysqldump' => env('MYSQLDUMP_PATH', 'mysqldump'),

    // Folder kedua untuk salinan cadangan (flashdisk, hard disk eksternal, folder Google Drive, dll.)
    'copy_to' => env('BACKUP_COPY_PATH'),

    // Cadangan lebih tua dari ini (hari) dihapus otomatis
    'keep_days' => (int) env('BACKUP_KEEP_DAYS', 30),
];