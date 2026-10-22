<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('store_settings', 'logo')) {
                $table->mediumText('logo')->nullable()->after('slogan');
            }
            $table->unsignedInteger('logo_version')->nullable()->after('slogan');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['logo', 'logo_version']);
        });
    }
};