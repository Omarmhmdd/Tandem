<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('date_night_suggestions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('household_id')->constrained('households')->onDelete('cascade')->onUpdate('cascade');
            $table->date('suggested_at');
            $table->json('meal');
            $table->json('activity');
            $table->json('treat');
            $table->decimal('total_cost', 10, 2);
            $table->text('reasoning');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['household_id', 'suggested_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('date_night_suggestions');
    }
};

