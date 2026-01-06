<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mood_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->date('date');
            $table->time('time');
            $table->enum('mood', ['happy', 'calm', 'tired', 'anxious', 'sad', 'energized', 'neutral']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'date', 'mood']);
            $table->index('date');
            $table->index('mood');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mood_entries');
    }
};

