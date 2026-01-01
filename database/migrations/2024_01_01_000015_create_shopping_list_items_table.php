<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shopping_list_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shopping_list_id')->constrained('shopping_lists')->onDelete('cascade')->onUpdate('cascade');
            $table->string('name', 255);
            $table->decimal('quantity', 10, 2);
            $table->string('unit', 50);
            $table->boolean('in_pantry')->default(false);
            $table->foreignId('pantry_item_id')->nullable()->constrained('pantry_items')->onDelete('set null')->onUpdate('cascade');
            $table->boolean('purchased')->default(false);
            $table->timestamps();
            
            $table->index('shopping_list_id');
            $table->index('pantry_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shopping_list_items');
    }
};

