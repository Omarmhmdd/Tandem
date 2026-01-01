<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mood_annotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->date('date');
            $table->enum('type', ['call', 'trip', 'purchase', 'event']);
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['household_id', 'date']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mood_annotations');
    }
};

