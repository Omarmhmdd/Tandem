<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->nullable()->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->string('title', 255);
            $table->enum('category', ['wedding', 'health', 'financial', 'other'])->default('other');
            $table->decimal('target', 15, 2);
            $table->decimal('current', 15, 2)->default(0.00);
            $table->decimal('progress_percentage', 5, 2)->nullable();
            $table->string('unit', 50);
            $table->date('deadline')->nullable();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('household_id');
            $table->index('user_id');
            $table->index('category');
            $table->index('progress_percentage');
        });
        
        // Add generated column for progress_percentage
        DB::statement('ALTER TABLE goals MODIFY COLUMN progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((current / target) * 100) STORED');
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};

