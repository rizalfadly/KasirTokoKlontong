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
        Schema::create('activity_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->string('action', 40);            // product.update, sale.void, login.failed ...
            $t->string('subject_type', 40)->nullable();  // product, sale, user ...
            $t->unsignedBigInteger('subject_id')->nullable();
            $t->string('summary', 255);          // kalimat siap tampil
            $t->json('changes')->nullable();     // {"price":{"from":23000,"to":20000}}
            $t->string('ip', 45)->nullable();
            $t->timestamp('created_at')->useCurrent();
            $t->index(['created_at']);
            $t->index(['action', 'created_at']);
            $t->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
