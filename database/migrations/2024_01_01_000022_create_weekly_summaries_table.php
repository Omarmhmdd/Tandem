<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->date('week_start');
            $table->string('highlight', 500);
            $table->json('bullets');
            $table->text('action');
            $table->timestamp('generated_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();
            
            $table->unique(['household_id', 'week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_summaries');
    }
};

