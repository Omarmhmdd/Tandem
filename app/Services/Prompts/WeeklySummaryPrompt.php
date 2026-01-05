<?php

namespace App\Services\Prompts;

class WeeklySummaryPrompt
{
   public static function getSystemPrompt(): string
{
    return <<<'PROMPT'
You are an AI Wellness Coach for a couple. Your task is to analyze their weekly health data and generate a concise, data-driven summary with actionable insights.

You will receive:
- Health logs from both partners for the week
- Pantry items and their status
- Recipes they've used
- Goals progress
- Mood patterns
- Budget/expense information

CRITICAL: Analyze the data and prioritize warnings/issues before positive observations. Focus on actionable, data-driven insights.

WARNING SCENARIOS TO DETECT (in priority order):
1. **Budget/Spending**: Overspending (expenses > budget), high spending relative to budget
2. **Sleep**: Average sleep < 7 hours, inconsistent sleep patterns, very late bedtimes
3. **Health/Activity**: No activities logged, low activity levels, no health logs recorded
4. **Mood**: Negative mood patterns (frequent sad/stressed), mood decline
5. **Goals**: Goals not progressing, behind schedule, not being worked on
6. **Pantry**: Items expiring soon, waste potential
7. **Nutrition**: Unhealthy patterns, lack of meal variety

Return your response as a JSON object:
{
  "highlight": "One concise sentence summarizing the week's main theme (data-driven if possible)",
  "bullets": [
    "Key insight 1 (data-driven, specific)",
    "Key insight 2 (data-driven, specific)",
    "Key insight 3 (data-driven, specific)"
  ],
  "action": "One prioritized, specific, quantitative action based on the most critical issue",
  "tone": "encouraging|supportive|motivational"
}

Guidelines:
- Highlight: Keep to 1 sentence maximum. Be data-driven when possible (e.g., "This week: Avg sleep 6.2h, overspent budget by $50")
- Bullets: Provide EXACTLY 3 bullet points. Prioritize warnings/issues first, then insights. Include specific numbers/data (e.g., "Avg sleep 6.2h (recommended: 7-9h)", "Spent $200 vs $150 budget")
- Action: This is the MOST PRIORITIZED action based on data analysis. Must be:
  * Specific and quantitative (include numbers/amounts)
  * Address the most critical issue first (warnings > improvements > maintenance)
  * Actionable with clear steps (e.g., "Reduce spending by $50 next week" or "Schedule 3 earlier bed nights (target: 7+ hours)")
  * Data-driven (reference the issue, e.g., "Avg sleep 6.2h → schedule 3 earlier bed nights")
- When multiple issues exist, prioritize: Budget > Sleep > Health/Activity > Mood > Goals > Pantry > Nutrition
- Celebrate wins and frame improvements positively, but prioritize actionable warnings
- Be concise and data-focused, not generic or vague
PROMPT;
}

    public static function buildUserPrompt(array $healthLogs,array $pantryItems,array $recipes,array $goals,array $moodData,array $budgetData,string $weekStart): string {
        $healthSummary = self::formatHealthLogs($healthLogs);
        $pantrySummary = self::formatPantryItems($pantryItems);
        $recipesSummary = self::formatRecipes($recipes);
        $goalsSummary = self::formatGoals($goals);
        $moodSummary = self::formatMoodData($moodData);
        $budgetSummary = self::formatBudgetData($budgetData);

        return <<<PROMPT
Generate a weekly wellness summary for the week starting {$weekStart}.

HEALTH LOGS:
{$healthSummary}

PANTRY STATUS:
{$pantrySummary}

RECIPES USED:
{$recipesSummary}

GOALS PROGRESS:
{$goalsSummary}

MOOD PATTERNS:
{$moodSummary}

BUDGET SUMMARY:
{$budgetSummary}

Create a personalized, encouraging summary that highlights achievements, identifies patterns, and provides actionable recommendations for the couple.
PROMPT;
    }

    private static function formatHealthLogs(array $logs): string
    {
        if (empty($logs)) {
            return "No health logs recorded this week.";
        }

        $formatted = [];
        foreach ($logs as $log) {
            $parts = ["Date: {$log['date']}"];
            if (!empty($log['activities'])) {
                $parts[] = "Activities: " . implode(', ', $log['activities']);
            }
            if (!empty($log['food'])) {
                $parts[] = "Food: " . implode(', ', $log['food']);
            }
            if ($log['sleep_hours']) {
                $parts[] = "Sleep: {$log['sleep_hours']} hours";
            }
            if ($log['mood']) {
                $parts[] = "Mood: {$log['mood']}";
            }
            $formatted[] = implode('. ', $parts);
        }

        return implode("\n", $formatted);
    }

    private static function formatPantryItems(array $items): string
    {
        if (empty($items)) {
            return "Pantry is empty.";
        }

        $expiring = array_filter($items, fn($i) => isset($i['expiry_date']) && $i['expiry_date']);
        $formatted = ["Total items: " . count($items)];
        
        if (!empty($expiring)) {
            $formatted[] = "Items expiring soon: " . count($expiring);
        }

        return implode('. ', $formatted);
    }

    private static function formatRecipes(array $recipes): string
    {
        if (empty($recipes)) {
            return "No recipes used this week.";
        }

        $names = array_column($recipes, 'name');
        return "Recipes: " . implode(', ', $names);
    }

    private static function formatGoals(array $goals): string
    {
        if (empty($goals)) {
            return "No goals tracked this week.";
        }

        $formatted = [];
        foreach ($goals as $goal) {
            $progress = $goal['target'] > 0 
                ? round(($goal['current'] / $goal['target']) * 100, 1)
                : 0;
            $formatted[] = "{$goal['title']}: {$goal['current']}/{$goal['target']} ({$progress}%)";
        }

        return implode("\n", $formatted);
    }

    private static function formatMoodData(array $moodData): string
    {
        if (empty($moodData)) {
            return "No mood data recorded.";
        }

        $moods = array_count_values(array_column($moodData, 'mood'));
        $mostCommon = array_search(max($moods), $moods);
        
        return "Most common mood: {$mostCommon} (appeared " . max($moods) . " times)";
    }

    private static function formatBudgetData(array $budgetData): string
    {
        if (empty($budgetData)) {
            return "No budget data available.";
        }

        $total = $budgetData['total_expenses'] ?? 0;
        $budget = $budgetData['budget'] ?? null;
        
        $formatted = ["Total expenses: \${$total}"];
        if ($budget) {
            $remaining = $budget - $total;
            $formatted[] = "Budget: \${$budget}, Remaining: \${$remaining}";
        }

        return implode('. ', $formatted);
    }
}

