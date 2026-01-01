<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('habit_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_id')->constrained('habits')->onDelete('cascade')->onUpdate('cascade');
            $table->date('date');
            $table->boolean('completed')->default(false);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['habit_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('habit_completions');
    }
};

