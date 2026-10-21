<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('icon', 16)->nullable()->after('unit');
            $table->unsignedInteger('image_version')->nullable()->after('icon');
        });

        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->unique()->constrained()->cascadeOnDelete();
            $table->mediumText('data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');

        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['icon', 'image_version']);
        });
    }
};
