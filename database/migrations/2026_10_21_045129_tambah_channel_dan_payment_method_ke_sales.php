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
        Schema::table('sales', function (Blueprint $table) {
            $table->string('channel', 20)->default('offline')->after('user_id');
            $table->string('payment_method', 20)->default('tunai')->after('channel');
            $table->index(['channel', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex(['channel', 'created_at']);
            $table->dropColumn(['channel', 'payment_method']);
        });
    }
};
