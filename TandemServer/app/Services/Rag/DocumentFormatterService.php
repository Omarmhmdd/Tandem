<?php

namespace App\Services\Rag;

use App\Models\HealthLog;
use App\Models\Recipe;
use App\Models\PantryItem;
use App\Models\Goal;

class DocumentFormatterService
{
    public function formatHealthLog(HealthLog $log): string
    {
        $parts = ["Health Log - {$log->date}"];

        if (!empty($log->activities)) {
            $activities = is_array($log->activities) 
                ? implode(', ', $log->activities) 
                : $log->activities;
            $parts[] = "Activities: {$activities}";
        }

        if (!empty($log->food)) {
            $food = is_array($log->food) 
                ? implode(', ', $log->food) 
                : $log->food;
            $parts[] = "Food: {$food}";
        }

        if ($log->sleep_hours) {
            $parts[] = "Sleep: {$log->sleep_hours} hours";
            if ($log->bedtime) {
                $parts[] = "Bedtime: {$log->bedtime}";
            }
            if ($log->wake_time) {
                $parts[] = "Wake time: {$log->wake_time}";
            }
        }

        if ($log->mood) {
            $parts[] = "Mood: {$log->mood}";
        }

        if ($log->notes) {
            $parts[] = "Notes: {$log->notes}";
        }

        return implode('. ', $parts);
    }

    public function formatRecipe(Recipe $recipe): array
    {
        $chunks = [];

        // Chunk 1: Name + Description + Ingredients
        $ingredients = ($recipe->ingredients ?? collect([]))
            ->map(fn($i) => "{$i->ingredient_name} ({$i->quantity} {$i->unit})")
            ->implode(', ');

        $chunk1 = "Recipe: {$recipe->name}";
        if ($recipe->description) {
            $chunk1 .= ". {$recipe->description}";
        }
        if ($ingredients) {
            $chunk1 .= ". Ingredients: {$ingredients}";
        }
        if ($recipe->prep_time || $recipe->cook_time) {
            $chunk1 .= ". Prep time: {$recipe->prep_time} min, Cook time: {$recipe->cook_time} min";
        }
        if ($recipe->servings) {
            $chunk1 .= ". Serves: {$recipe->servings}";
        }
        if ($recipe->difficulty) {
            $chunk1 .= ". Difficulty: {$recipe->difficulty}";
        }

        $chunks[] = $chunk1;

        // Chunk 2: Instructions
        $instructions = ($recipe->instructions ?? collect([]))
            ->sortBy('step_number')
            ->map(fn($i) => "Step {$i->step_number}: {$i->instruction}")
            ->implode('. ');

        if (!empty($instructions)) {
            $chunks[] = "Instructions: {$instructions}";
        }

        return $chunks;
    }

    public function formatPantryItem(PantryItem $item): string
    {
        $parts = ["Pantry Item: {$item->name}"];

        if ($item->quantity) {
            $parts[] = "Quantity: {$item->quantity} {$item->unit}";
        }

        if ($item->expiry_date) {
            $parts[] = "Expires: {$item->expiry_date}";
        }

        if ($item->category) {
            $parts[] = "Category: {$item->category}";
        }

        if ($item->location) {
            $parts[] = "Location: {$item->location}";
        }

        return implode('. ', $parts);
    }

    public function formatGoal(Goal $goal): string
    {
        $progress = $goal->target > 0 
            ? round(($goal->current / $goal->target) * 100, 1)
            : 0;

        $parts = ["Goal: {$goal->title}"];
        
        if ($goal->category) {
            $parts[] = "Category: {$goal->category}";
        }

        $parts[] = "Current: {$goal->current}/{$goal->target} {$goal->unit}";
        $parts[] = "Progress: {$progress}%";

        if ($goal->deadline) {
            $parts[] = "Deadline: {$goal->deadline}";
        }

        return implode('. ', $parts);
    }
}

