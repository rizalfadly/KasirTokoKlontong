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
                Schema::create('customers', function (Blueprint $t) {
            $t->id();
            $t->string('name', 100);
            $t->string('phone', 30)->nullable();
            $t->string('address', 200)->nullable();
            $t->boolean('is_active')->default(true);
            $t->timestamps();
            $t->index('name');
        });

        Schema::table('products', function (Blueprint $t) {
            $t->unsignedBigInteger('wholesale_price')->nullable()->after('price');
            $t->decimal('wholesale_min_qty', 10, 3)->default(10)->after('wholesale_price');
            $t->decimal('limit_qty', 10, 2)->nullable()->after('wholesale_min_qty');
            $t->string('limit_period', 10)->default('harian')->after('limit_qty');
        });

        Schema::table('sales', function (Blueprint $t) {
            $t->foreignId('customer_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $t->index(['customer_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $t) {
            $t->dropConstrainedForeignId('customer_id');
        });
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn(['wholesale_price', 'wholesale_min_qty', 'limit_qty', 'limit_period']);
        });
        Schema::dropIfExists('customers');
    }
};
