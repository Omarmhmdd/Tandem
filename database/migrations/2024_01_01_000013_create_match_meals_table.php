<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('match_meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meal_plan_id')->unique()->constrained('meal_plans')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('invited_by_user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->foreignId('invited_to_user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->enum('status', ['pending', 'accepted', 'declined', 'completed'])->default('pending');
            $table->timestamp('invite_sent_at')->useCurrent();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            
            $table->index('invited_by_user_id');
            $table->index('invited_to_user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_meals');
    }
};

