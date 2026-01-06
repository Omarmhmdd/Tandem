<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('household_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict')->onUpdate('cascade');
            $table->enum('role', ['primary', 'partner']);
            $table->string('invite_token', 255)->nullable()->unique();
            $table->string('invited_email', 255)->nullable();
            $table->enum('status', ['active', 'pending', 'declined'])->default('active');
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            
            $table->unique(['household_id', 'user_id']);
            $table->index('household_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('household_members');
    }
};

