<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained('goals')->onDelete('cascade')->onUpdate('cascade');
            $table->string('title', 255);
            $table->boolean('completed')->default(false);
            $table->date('deadline')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
            
            $table->index(['goal_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_milestones');
    }
};

