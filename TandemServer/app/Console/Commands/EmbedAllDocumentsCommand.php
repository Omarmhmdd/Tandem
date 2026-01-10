<?php

namespace App\Console\Commands;

use App\Models\HealthLog;
use App\Models\Recipe;
use App\Models\PantryItem;
use App\Models\Goal;
use App\Models\HouseholdMember;
use App\Jobs\EmbedDocumentJob;
use App\Services\Rag\DocumentType;
use Illuminate\Console\Command;

class EmbedAllDocumentsCommand extends Command
{
    protected $signature = 'rag:embed-all {--household-id= : Embed documents for specific household}';
    protected $description = 'Embed all existing documents into Qdrant vector database';

    public function handle()
    {
        $this->info('Starting document embedding process...');

        $householdId = $this->option('household-id');

        // Initialize Qdrant collection
        $vectorDbService = app(\App\Services\Rag\VectorDbService::class);
        $this->info('Initializing Qdrant collection...');
        $vectorDbService->initializeCollection();
        $this->info(' Collection initialized');

        $totalEmbedded = 0;

        // Embed Health Logs
        $this->info("\nEmbedding Health Logs...");
        $healthLogs = HealthLog::with('user.householdMembers')
            ->when($householdId, function ($q) use ($householdId) {
                $q->whereHas('user.householdMembers', function ($q) use ($householdId) {
                    $q->where('household_id', $householdId);
                });
            })
            ->get();

        $bar = $this->output->createProgressBar($healthLogs->count());
        $bar->start();

        foreach ($healthLogs as $log) {
            // Get household member for the specific household (if filtering by household)
            // Otherwise get the first active household member
            $householdMemberQuery = $log->user->householdMembers()->where('status', 'active');
            if ($householdId) {
                $householdMemberQuery->where('household_id', $householdId);
            }
            $householdMember = $householdMemberQuery->first();
            
            if ($householdMember) {
                EmbedDocumentJob::dispatch(
                    DocumentType::HEALTH_LOG,
                    $log->id,
                    $householdMember->household_id,
                    $log->user_id
                );
                $totalEmbedded++;
            }
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
        $this->info(" Queued {$healthLogs->count()} health logs");

        // Embed Recipes
        $this->info("\nEmbedding Recipes...");
        $recipes = Recipe::with('household')
            ->when($householdId, fn($q) => $q->where('household_id', $householdId))
            ->get();

        $bar = $this->output->createProgressBar($recipes->count());
        $bar->start();

        foreach ($recipes as $recipe) {
            EmbedDocumentJob::dispatch(
                DocumentType::RECIPE,
                $recipe->id,
                $recipe->household_id,
                null // Recipes are household-level
            );
            $totalEmbedded++;
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
        $this->info(" Queued {$recipes->count()} recipes");

        // Embed Pantry Items
        $this->info("\nEmbedding Pantry Items...");
        $pantryItems = PantryItem::with('household')
            ->when($householdId, fn($q) => $q->where('household_id', $householdId))
            ->get();

        $bar = $this->output->createProgressBar($pantryItems->count());
        $bar->start();

        foreach ($pantryItems as $item) {
            EmbedDocumentJob::dispatch(
                DocumentType::PANTRY_ITEM,
                $item->id,
                $item->household_id,
                null // Pantry items are household-level
            );
            $totalEmbedded++;
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
        $this->info(" Queued {$pantryItems->count()} pantry items");

        // Embed Goals
        $this->info("\nEmbedding Goals...");
        $goals = Goal::query()
            ->when($householdId, function ($q) use ($householdId) {
                $q->where(function ($q) use ($householdId) {
                    $q->where('household_id', $householdId)
                      ->orWhereHas('user.householdMembers', function ($q) use ($householdId) {
                          $q->where('household_id', $householdId);
                      });
                });
            })
            ->get();

        $bar = $this->output->createProgressBar($goals->count());
        $bar->start();

        foreach ($goals as $goal) {
            $householdIdForGoal = $goal->household_id;
            if (!$householdIdForGoal && $goal->user_id) {
                $householdMember = HouseholdMember::where('user_id', $goal->user_id)
                    ->where('status', 'active')
                    ->first();
                $householdIdForGoal = $householdMember?->household_id;
            }

            if ($householdIdForGoal) {
                EmbedDocumentJob::dispatch(
                    DocumentType::GOAL,
                    $goal->id,
                    $householdIdForGoal,
                    $goal->user_id // Goals can be user-specific
                );
                $totalEmbedded++;
            }
            $bar->advance();
        }
        $bar->finish();
        $this->newLine();
        $this->info(" Queued {$goals->count()} goals");

        $this->newLine();
        $this->info(" Total documents queued for embedding: {$totalEmbedded}");
        $this->info("Jobs are processing in the background. Check queue:work to see progress.");
    }
}

