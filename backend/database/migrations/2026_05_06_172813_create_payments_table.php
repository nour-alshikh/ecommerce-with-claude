<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('provider', 50)->default('stripe');
            $table->string('provider_id');
            $table->enum('status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending');
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('USD');
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index('order_id');
            $table->unique('provider_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
