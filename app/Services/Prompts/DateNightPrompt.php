<?php

namespace App\Services\Prompts;

class DateNightPrompt
{
    public static function getSystemPrompt(): string
    {
        return <<<'PROMPT'
You are a romantic date night planner for couples. Your task is to suggest a perfect date night based on their budget, current mood, pantry items, and preferences.

You must suggest:
1. A meal (can use pantry ingredients or suggest ordering)
2. An activity (indoor or outdoor, based on context)
3. A treat (dessert, snack, or small indulgence)

Consider:
- Budget constraints (stay within or slightly above budget)
- Current mood (suggest activities that match or improve mood)
- Available pantry items (prefer using what they have)
- Practicality (activities should be feasible)
- Romance and connection (focus on couple bonding)

Return your response as a JSON object:
{
  "meal": {
    "name": "Meal name",
    "description": "Brief description",
    "cost": 15.00,
    "recipeId": 123 | null,
    "usesPantry": true
  },
  "activity": {
    "name": "Activity name",
    "description": "What they'll do",
    "cost": 0.00,
    "duration": "2 hours",
    "location": "home|outdoor|venue"
  },
  "treat": {
    "name": "Treat name",
    "description": "Description",
    "cost": 8.00
  },
  "total_cost": 23.00,
  "reasoning": "Why this combination works for them based on their data"
}

Guidelines:
- Total cost MUST stay within the provided budget (do not exceed it)
- - BUDGET UTILIZATION: When budget is $75+, aim to use 70-90% of it for a more premium experience
- When budget is $50-75, use 60-80% of it
- When budget is under $50, prioritize free activities and pantry ingredients (use 80-100%)
- VARIETY: Always suggest different meals, activities, and treats - rotate through available recipes, suggest new meal ideas, vary activities (indoor/outdoor, active/relaxing)
- If budget allows ($100+), consider suggesting ordering meals or paid activities
- RECIPE ID: If you suggest a meal that matches a recipe in "AVAILABLE RECIPES", use that recipe's ID. Otherwise use null.
- Meal can reference existing recipes (recipeId) OR suggest new meal ideas not in the recipe list
- - RECIPE ID RULES: If you suggest a meal that matches or is similar to a recipe in the "AVAILABLE RECIPES" list, you MUST use that recipe's ID. If suggesting a completely new meal or ordering, use null. Prioritize using existing recipes when budget is under $75.
- CRITICAL: recipeId MUST be an ID from the "AVAILABLE RECIPES" list provided, or null if suggesting a new meal/ordering. Do NOT make up recipe IDs.
- Activity should be realistic and enjoyable
- Treat should be a small indulgence
- Reasoning should be 2-3 sentences explaining the choices
- IMPORTANT: The user has specified their exact budget - respect it and plan accordingly, but use it wisely to create a memorable experience
PROMPT;
    }

    public static function buildUserPrompt(float $budget,array $moodData,array $pantryItems,array $recipes,?string $suggestedDate = null,array $recentSuggestions = []): string {
        $date = $suggestedDate ?? 'this weekend';
        $budgetGuidance = self::buildBudgetGuidance($budget);
        $moodSummary = self::formatMoodData($moodData);
        $pantrySummary = self::formatPantryItems($pantryItems);
        $recipesSummary = self::formatRecipes($recipes);
        $recentSuggestionsSummary = self::formatRecentSuggestions($recentSuggestions);

        return <<<PROMPT
Plan a romantic date night for {$date}. The user has set their budget to exactly \${$budget}.

BUDGET GUIDANCE:
{$budgetGuidance}
The total cost (meal + activity + treat) must not exceed \${$budget}.

CRITICAL VARIETY REQUIREMENT:
- Suggest a COMPLETELY DIFFERENT meal EVERY time - NEVER repeat meal names
- Rotate through ALL available recipes systematically, or suggest NEW meal ideas not in the list
- Vary activity type EVERY time - alternate between indoor/outdoor, active/relaxing, home/venue
- Choose a DIFFERENT treat EVERY time - never repeat treat names
- Each date night MUST be unique - if you suggested "Homemade Chicken Pasta" before, suggest something else like "Grilled Salmon", "Vegetable Curry", "Ordered Sushi", etc.
- If you see the same recipes/pantry items, you MUST still create different combinations and suggestions
- Be creative and think of NEW ideas each time - this is a NEW request, generate a FRESH suggestion

CURRENT MOOD:
{$moodSummary}

AVAILABLE PANTRY ITEMS:
{$pantrySummary}

AVAILABLE RECIPES:
{$recipesSummary}

RECENT SUGGESTIONS (DO NOT REPEAT THESE):
{$recentSuggestionsSummary}

Suggest a COMPLETELY NEW date night experience including:
1. A meal - MUST be different from any previous suggestion. Can use existing recipes (with recipeId) or suggest ordering/restaurant meals (recipeId: null). Budget utilization must be 60-80% for $50 budget ($30-$40 total cost).
2. An activity - MUST be different type/location than previous suggestions. Alternate between: home movie night, cooking together, outdoor walk, restaurant visit, game night, dancing, etc.
3. A treat - MUST be different name/type than previous suggestions. Rotate between: chocolate fondue, ice cream, cookies, cake, fruit platter, etc.

IMPORTANT: This is a NEW request - generate a FRESH, UNIQUE suggestion. Do NOT repeat meal names, activity types, or treat names from previous requests. Be creative and think of NEW combinations each time.

Make it personal, romantic, ensure the total cost uses the budget wisely (aim for the percentage ranges above), and ensure EVERY component is different from previous suggestions.
PROMPT;
    }

    private static function buildBudgetGuidance(float $budget): string
{
    if ($budget >= 100) {
        $targetMin = round($budget * 0.7);
        $targetMax = round($budget * 0.9);
        return "With a budget of \${$budget}, you MUST use 70-90% of the budget (\${$targetMin}-\${$targetMax}). This is REQUIRED, not optional. Suggest premium meals (order from restaurants, $30+), paid activities (concert tickets, spa, classes), or premium treats ($15-25) to reach this target range. Do NOT suggest a $50 date night when the budget is $100.";
    }

    if ($budget >= 75) {
        $targetMin = round($budget * 0.7);
        $targetMax = round($budget * 0.85);
        return "With a budget of \${$budget}, aim to use 70-85% of it (\${$targetMin}-\${$targetMax}). Mix pantry ingredients with some ordering or paid activities.";
    }

    if ($budget >= 50) {
        $targetMin = round($budget * 0.6);
        $targetMax = round($budget * 0.8);
        return "With a budget of \${$budget}, aim to use 60-80% of it (\${$targetMin}-\${$targetMax}). Prioritize pantry ingredients but can suggest some ordering.";
    }

    return "With a tight budget of \${$budget}, prioritize free activities and pantry ingredients. Use 80-100% of the budget for the best value.";
}

    private static function formatMoodData(array $moodData): string
    {
        if (empty($moodData)) {
            return "No recent mood data available.";
        }

        $recentMoods = array_slice($moodData, -5);
        $moods = array_column($recentMoods, 'mood');
        $moodCounts = array_count_values($moods);
        $mostCommon = array_search(max($moodCounts), $moodCounts);
        
        return "Recent mood pattern: Mostly {$mostCommon}";
    }

    private static function formatPantryItems(array $items): string
    {
        if (empty($items)) {
            return "Pantry is empty - suggest ordering or shopping.";
        }

        $names = array_slice(array_column($items, 'name'), 0, 10);
        return "Available: " . implode(', ', $names) . (count($items) > 10 ? '...' : '');
    }

    private static function formatRecipes(array $recipes): string
{
    if (empty($recipes)) {
        return "No recipes available - suggest ordering a meal or creating a new recipe idea.";
    }

    $formatted = [];
    foreach ($recipes as $recipe) {
        $formatted[] = "{$recipe['name']} (ID: {$recipe['id']})";
    }
    
    return "Available Recipes (rotate through these, don't repeat the same one): " . implode(', ', $formatted) . ". You can also suggest ordering meals or new recipe ideas not in this list.";
}

    private static function formatRecentSuggestions(array $recentSuggestions): string
    {
        if (empty($recentSuggestions)) {
            return "No recent suggestions - this is the first one. Be creative!";
        }

        $formatted = [];
        foreach ($recentSuggestions as $index => $suggestion) {
            $parts = [];
            if (!empty($suggestion['meal'])) {
                $parts[] = "Meal: {$suggestion['meal']}";
            }
            if (!empty($suggestion['activity'])) {
                $parts[] = "Activity: {$suggestion['activity']}";
            }
            if (!empty($suggestion['treat'])) {
                $parts[] = "Treat: {$suggestion['treat']}";
            }
            if (!empty($parts)) {
                $formatted[] = "Suggestion " . ($index + 1) . ": " . implode(', ', $parts);
            }
        }

        if (empty($formatted)) {
            return "No recent suggestions to avoid.";
        }

        return "Previous suggestions (DO NOT repeat any of these meal names, activity types, or treat names):\n" . implode("\n", $formatted) . "\n\nYou MUST suggest completely different meal names, activity types, and treat names than any of the above.";
    }
}