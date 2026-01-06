<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->date('date');
            $table->time('time');
            $table->json('activities');
            $table->json('food');
            $table->decimal('sleep_hours', 4, 2)->nullable();
            $table->time('bedtime')->nullable();
            $table->time('wake_time')->nullable();
            $table->enum('mood', ['happy', 'calm', 'tired', 'anxious', 'sad', 'energized', 'neutral']);
            $table->text('notes')->nullable();
            $table->text('original_text')->nullable();
            $table->decimal('confidence', 3, 2)->default(1.00);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'date', 'mood']);
            $table->index('date');
            $table->index('mood');
            $table->fullText('notes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_logs');
    }
};

