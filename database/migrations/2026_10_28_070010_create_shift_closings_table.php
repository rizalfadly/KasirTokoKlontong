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
        Schema::create('shift_closings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();            // kasir
            $table->dateTime('period_start');
            $table->dateTime('period_end');
            $table->unsignedBigInteger('opening_cash')->default(0);  // modal awal
            $table->unsignedBigInteger('total')->default(0);
            $table->unsignedInteger('sales_count')->default(0);
            $table->json('by_method');                               // {"tunai":{"count":..,"total":..}, ...}
            $table->unsignedInteger('voided_count')->default(0);
            $table->unsignedBigInteger('voided_total')->default(0);
            $table->bigInteger('expected_cash');                     // modal + tunai
            $table->unsignedBigInteger('counted_cash');              // hitungan fisik
            $table->bigInteger('difference');                        // counted - expected
            $table->string('note', 200)->nullable();                 // catatan kasir
            $table->string('status', 20)->default('submitted');      // submitted|approved|rejected
            $table->text('review_note')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shift_closings');
    }
};
