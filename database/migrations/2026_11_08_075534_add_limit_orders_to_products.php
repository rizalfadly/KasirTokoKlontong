<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            // null = tanpa batas frekuensi
            $t->unsignedSmallInteger('limit_orders')->nullable()->after('limit_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn('limit_orders');
        });
    }
};
