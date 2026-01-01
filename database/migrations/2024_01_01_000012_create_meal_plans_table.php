<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meal_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->date('date');
            $table->enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']);
            $table->foreignId('recipe_id')->nullable()->constrained('recipes')->onDelete('set null')->onUpdate('cascade');
            $table->boolean('is_match_meal')->default(false);
            $table->foreignId('created_by_user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['household_id', 'date', 'meal_type']);
            $table->index(['household_id', 'date', 'meal_type']);
            $table->index('recipe_id');
            $table->index('is_match_meal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meal_plans');
    }
};

