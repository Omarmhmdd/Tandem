<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('household_members', function (Blueprint $table) {
            
            $table->dropForeign(['user_id']);
            $table->dropUnique(['household_id', 'user_id']);
        });

        
        DB::statement('ALTER TABLE household_members MODIFY COLUMN user_id BIGINT UNSIGNED NULL');

        Schema::table('household_members', function (Blueprint $table) {
        
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            
            $table->unique(['household_id', 'user_id'], 'household_members_household_user_unique');
        });
    }

    public function down(): void
    {
        Schema::table('household_members', function (Blueprint $table) {

            $table->dropForeign(['user_id']);
            $table->dropUnique('household_members_household_user_unique');
        });


        DB::statement('UPDATE household_members SET user_id = 0 WHERE user_id IS NULL');
        DB::statement('ALTER TABLE household_members MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL');

        Schema::table('household_members', function (Blueprint $table) {

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('restrict')
                ->onUpdate('cascade');
            
            $table->unique(['household_id', 'user_id']);
        });
    }
};
