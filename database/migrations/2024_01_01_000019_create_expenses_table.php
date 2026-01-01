<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->date('date');
            $table->decimal('amount', 10, 2);
            $table->string('description', 500);
            $table->enum('category', ['groceries', 'dining', 'wedding', 'health', 'big-ticket', 'other'])->default('other');
            $table->boolean('auto_tagged')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->foreignId('updated_by_user_id')->nullable()->constrained('users')->onDelete('set null')->onUpdate('cascade');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['household_id', 'date']);
            $table->index('user_id');
            $table->index('category');
            $table->index('date');
            $table->fullText('description');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

