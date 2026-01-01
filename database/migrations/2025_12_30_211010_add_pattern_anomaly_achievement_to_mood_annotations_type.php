<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    
        DB::statement("ALTER TABLE mood_annotations MODIFY COLUMN type ENUM('call', 'trip', 'purchase', 'event', 'pattern', 'anomaly', 'achievement') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    
        DB::statement("ALTER TABLE mood_annotations MODIFY COLUMN type ENUM('call', 'trip', 'purchase', 'event') NOT NULL");
    }
};
