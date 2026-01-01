<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->unsignedInteger('prep_time')->default(0);
            $table->unsignedInteger('cook_time')->default(0);
            $table->unsignedInteger('servings')->default(1);
            $table->enum('difficulty', ['Easy', 'Medium', 'Hard'])->default('Easy');
            $table->decimal('rating', 3, 2)->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('household_id');
            $table->index('difficulty');
            $table->index('rating');
            $table->fullText(['name', 'description']);
        });
        
        // Add generated column for total_time
        DB::statement('ALTER TABLE recipes ADD COLUMN total_time INT UNSIGNED GENERATED ALWAYS AS (prep_time + cook_time) STORED');
        DB::statement('ALTER TABLE recipes ADD INDEX idx_recipes_total_time (total_time)');
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};

