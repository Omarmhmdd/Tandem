<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipe_ingredient_pantry_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_ingredient_id')->constrained('recipe_ingredients')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('pantry_item_id')->constrained('pantry_items')->onDelete('cascade')->onUpdate('cascade');
            $table->decimal('quantity_used', 10, 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['recipe_ingredient_id', 'pantry_item_id'], 'recipe_pantry_link_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredient_pantry_links');
    }
};

