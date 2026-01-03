<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pantry_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->string('name', 255);
            $table->decimal('quantity', 10, 2)->default(1.00);
            $table->string('unit', 50)->default('pieces');
            $table->date('expiry_date')->nullable();
            $table->enum('location', ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'])->default('Pantry');
            $table->enum('category', ['Meat', 'Dairy', 'Vegetables', 'Grains', 'Fruits', 'Other'])->default('Other');
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('household_id');
            $table->index(['household_id', 'expiry_date']);
            $table->index(['household_id', 'category', 'expiry_date']);
            $table->index('expiry_date');
            $table->index('category');
            $table->index('location');
            $table->fullText('name');
        });
        
    
    }

    public function down(): void
    {
        Schema::dropIfExists('pantry_items');
    }
};

