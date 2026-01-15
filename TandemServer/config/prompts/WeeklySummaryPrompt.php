<?php

namespace Config\Prompts;

use Config\PromptSanitizer;

class WeeklySummaryPrompt
{
    public static function getSystemPrompt(): string
{
    return <<<'PROMPT'
You are an AI Wellness Coach for a couple. Your task is to analyze their weekly health data and generate a concise, data-driven summary with actionable insights.

You will receive:
- Budget/expense information
- Goals progress (with partner names for individual goals)
- Pantry items and their status (especially expiring items)
- Habits tracking data (with partner names for individual habits)
- Mood patterns (with partner names identified)
- Health logs (for context only - DO NOT focus on sleep)
- Recipes they've used

CRITICAL REQUIREMENTS:
1. **Always show BOTH combined household averages AND individual partner breakdowns** in your summary
2. Format: "Household average: X (Partner A: Y, Partner B: Z)" for all metrics
3. Analyze the data and prioritize warnings/issues before positive observations
4. Focus on actionable, data-driven insights
5. **DO NOT focus on sleep** - it's already shown in the dashboard and health logs
6. **PRIORITIZE**: Budget > Goals > Pantry (expiring items) > Habits > Mood

WARNING SCENARIOS TO DETECT (in priority order):
1. **Budget/Spending**: 
   - Show weekly expenses by each partner: "This week: $X (John: $Y, Partner: $Z)"
   - Show monthly budget, monthly expenses so far, and remaining monthly budget
   - ADVISE based on remaining: If remaining < 20% → "spend less next week", If remaining > 50% → "can spend more", otherwise "maintain current spending"
   - Example: "This week: $650 (John: $650). Monthly budget: $5,000, Monthly spent: $4,825, Remaining: $175 - spend less next week to stay within budget"
2. **Goals**: Goals not progressing, behind schedule, not being worked on, goals at risk. IMPORTANT: Only count goals as "completed" if they show "✅ COMPLETED" status (100% progress). Goals with 99% or less are NOT completed!
3. **Pantry**: Items expiring soon (within 7 days), waste potential, items about to expire
4. **Habits**: Low habit completion rates, habits being missed, inconsistent habit tracking
5. **Mood**: Negative mood patterns (frequent sad/stressed), mood decline
6. **Health/Activity**: No activities logged, low activity levels (only if significant)

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
- Highlight: Keep to 1 sentence maximum. Be data-driven when possible. ALWAYS include both household average AND individual partner breakdowns. FOCUS on Budget, Goals, Pantry, or Habits. Example: "This week: Spent $650 (John: $400, Partner: $250), $4,350 remaining monthly budget, 2 goals completed, 5 pantry items expiring soon"
- Bullets: Provide EXACTLY 3 bullet points. Prioritize warnings/issues first, then insights. ALWAYS show both combined and individual data. Format examples:
  * "This week's expenses: $650 (John: $400, Partner: $250). Monthly budget: $5,000, Monthly spent: $4,825, Remaining: $175 - advise to spend less to stay within budget"
  * "3 goals completed (Partner A: Wedding 100%, Partner B: Fitness 75%, Household: Savings 50%)"
  * "5 pantry items expiring within 7 days: milk (2 days), bread (3 days), eggs (5 days)"
  * "Habit completion: Household 60% (Partner A: 80%, Partner B: 40%) - Partner B needs support"
- Action: This is the MOST PRIORITIZED action based on data analysis. Must be:
  * Specific and quantitative (include numbers/amounts)
  * Address the most critical issue first (warnings > improvements > maintenance)
  * For budget: Compare weekly expenses to monthly budget. If remaining monthly budget is low, advise to "spend less next week" or "reduce expenses". If remaining is high, they can "spend more" or "maintain current spending"
  * Actionable with clear steps (e.g., "Reduce spending by $150 next week to stay within monthly budget" or "Use 5 expiring pantry items in meals this week" or "Focus on completing 3 missed habits daily")
  * Data-driven (reference the issue, e.g., "Only $175 remaining monthly budget → reduce spending" or "5 items expiring → plan meals using these items")
- When multiple issues exist, prioritize: Budget > Goals > Pantry (expiring) > Habits > Mood > Health/Activity
- DO NOT mention sleep in the summary - it's already shown in dashboard and health logs
- Celebrate wins and frame improvements positively, but prioritize actionable warnings
- Be concise and data-focused, not generic or vague
PROMPT;
}

    public static function buildUserPrompt(array $healthLogs,array $pantryItems,array $recipes,array $goals,array $moodData,array $budgetData,array $habits,string $weekStart): string {
        $healthSummary = self::formatHealthLogs($healthLogs);
        $pantrySummary = self::formatPantryItems($pantryItems);
        $recipesSummary = self::formatRecipes($recipes);
        $goalsSummary = self::formatGoals($goals);
        $moodSummary = self::formatMoodData($moodData);
        $budgetSummary = self::formatBudgetData($budgetData);
        $habitsSummary = self::formatHabitsData($habits);

        return <<<PROMPT
Generate a weekly wellness summary for the week starting {$weekStart}.

BUDGET SUMMARY:
{$budgetSummary}

GOALS PROGRESS:
{$goalsSummary}

PANTRY STATUS:
{$pantrySummary}

HABITS TRACKING:
{$habitsSummary}

MOOD PATTERNS:
{$moodSummary}

HEALTH LOGS (for context only - sleep data is already shown elsewhere):
{$healthSummary}

RECIPES USED:
{$recipesSummary}

Create a personalized, encouraging summary that highlights achievements, identifies patterns, and provides actionable recommendations for the couple.
FOCUS on: Budget, Goals, Pantry (expiring items), and Habits. Do NOT focus on sleep as it's already displayed in the dashboard.
PROMPT;
    }

    private static function formatHealthLogs(array $logs): string
    {
        if (empty($logs)) {
            return "No health logs recorded this week.";
        }

        // Group logs by user
        $logsByUser = [];
        $allSleepHours = [];
        $userSleepHours = [];
        $userActivities = [];
        $userFood = [];

        foreach ($logs as $log) {
            $userId = $log['user_id'] ?? null;
            $userName = $log['user_name'] ?? 'Unknown';
            
            if (!isset($logsByUser[$userId])) {
                $logsByUser[$userId] = [
                    'name' => $userName,
                    'logs' => [],
                    'sleep_hours' => [],
                    'activities' => [],
                    'food' => [],
                ];
            }
            
            $logsByUser[$userId]['logs'][] = $log;
            
            if (!empty($log['sleep_hours'])) {
                $logsByUser[$userId]['sleep_hours'][] = $log['sleep_hours'];
                $allSleepHours[] = $log['sleep_hours'];
            }
            
            if (!empty($log['activities'])) {
                $logsByUser[$userId]['activities'] = array_merge($logsByUser[$userId]['activities'], $log['activities']);
            }
            
            if (!empty($log['food'])) {
                $logsByUser[$userId]['food'] = array_merge($logsByUser[$userId]['food'], $log['food']);
            }
        }

        // Calculate averages (for context only - sleep is not the focus)
        $householdAvgSleep = !empty($allSleepHours) ? round(array_sum($allSleepHours) / count($allSleepHours), 1) : 0;
        
        $formatted = ["=== HEALTH LOGS START ==="];
        $formatted[] = "HOUSEHOLD SUMMARY (for context - sleep data is already shown in dashboard):";
        $formatted[] = "Total health logs: " . count($logs);
        // Sleep data included but not emphasized
        
        // Individual partner breakdowns
        $formatted[] = "\nINDIVIDUAL PARTNER BREAKDOWNS:";
        foreach ($logsByUser as $userId => $userData) {
            $userName = $userData['name'];
            $userLogCount = count($userData['logs']);
            $userAvgSleep = !empty($userData['sleep_hours']) 
                ? round(array_sum($userData['sleep_hours']) / count($userData['sleep_hours']), 1) 
                : 0;
            $activityCount = count(array_unique($userData['activities']));
            $foodCount = count(array_unique($userData['food']));
            
            $formatted[] = "\n{$userName}:";
            $formatted[] = "  - Logs: {$userLogCount}";
            // Sleep data not shown here - already in dashboard
            if ($activityCount > 0) {
                $formatted[] = "  - Unique activities: {$activityCount}";
            }
            if ($foodCount > 0) {
                $formatted[] = "  - Unique food items: {$foodCount}";
            }
        }
        
        $formatted[] = "\nDETAILED LOGS BY DATE (for context only):";
        foreach ($logs as $log) {
            $date = PromptSanitizer::sanitizeDate($log['date'] ?? null) ?? 'Unknown date';
            $userName = $log['user_name'] ?? 'Unknown';
            $parts = ["Date: {$date}, Partner: {$userName}"];
            
            if (!empty($log['activities'])) {
                $activities = PromptSanitizer::sanitizeArray($log['activities']);
                $parts[] = "Activities: " . implode(', ', $activities);
            }
            if (!empty($log['food'])) {
                $food = PromptSanitizer::sanitizeArray($log['food']);
                $parts[] = "Food: " . implode(', ', $food);
            }
            // Sleep data is included but not emphasized - it's already shown in dashboard
            if ($log['mood']) {
                $mood = PromptSanitizer::sanitize($log['mood']);
                $parts[] = "Mood: {$mood}";
            }
            $formatted[] = implode('. ', $parts);
        }

        $formatted[] = "=== HEALTH LOGS END ===";
        $formatted[] = "CRITICAL: Health logs are for context only. DO NOT focus on sleep in your summary - it's already displayed in the dashboard. Focus on Budget, Goals, Pantry (expiring items), and Habits instead.";
        
        return implode("\n", $formatted);
    }

    private static function formatPantryItems(array $items): string
    {
        if (empty($items)) {
            return "Pantry is empty.";
        }

        // Only count items that are actually expiring within 7 days
        $expiringSoon = array_filter($items, fn($i) => isset($i['is_expiring_soon']) && $i['is_expiring_soon'] === true);
        
        $formatted = ["Total items: " . count($items)];
        
        if (!empty($expiringSoon)) {
            $formatted[] = "Items expiring soon (within 7 days): " . count($expiringSoon);
            $expiringList = [];
            foreach ($expiringSoon as $item) {
                $name = PromptSanitizer::sanitize($item['name'] ?? 'Unknown');
                $days = $item['days_until_expiry'] ?? 0;
                $expiringList[] = "{$name} ({$days} days)";
            }
            if (!empty($expiringList)) {
                $formatted[] = "Expiring items: " . implode(', ', $expiringList);
            }
        } else {
            $formatted[] = "No items expiring within 7 days";
        }

        return implode('. ', $formatted);
    }

    private static function formatRecipes(array $recipes): string
    {
        if (empty($recipes)) {
            return "No recipes used this week.";
        }

        // Sanitize recipe names (user-entered)
        $names = array_map(function($recipe) {
            return PromptSanitizer::sanitize($recipe['name'] ?? 'Untitled');
        }, $recipes);
        return "Recipes: " . implode(', ', $names);
    }

    private static function formatGoals(array $goals): string
    {
        if (empty($goals)) {
            return "No goals tracked this week.";
        }

        // Group goals by user/household
        $goalsByUser = [];
        $householdGoals = [];
        
        foreach ($goals as $goal) {
            $userId = $goal['user_id'] ?? null;
            $userName = $goal['user_name'] ?? 'Household';
            $householdId = $goal['household_id'] ?? null;
            
            // Household-level goals
            if (!$userId && $householdId) {
                $householdGoals[] = $goal;
            } else {
                // User-specific goals
                if (!isset($goalsByUser[$userId])) {
                    $goalsByUser[$userId] = [
                        'name' => $userName,
                        'goals' => [],
                    ];
                }
                $goalsByUser[$userId]['goals'][] = $goal;
            }
        }
        
        $formatted = [];
        
        // Household goals
        if (!empty($householdGoals)) {
            $formatted[] = "HOUSEHOLD GOALS:";
            foreach ($householdGoals as $goal) {
                $title = PromptSanitizer::sanitize($goal['title'] ?? 'Untitled');
                $progress = $goal['target'] > 0 
                    ? round(($goal['current'] / $goal['target']) * 100, 1)
                    : 0;
                $isCompleted = isset($goal['is_completed']) && $goal['is_completed'] === true;
                $status = $isCompleted ? "✅ COMPLETED" : "In progress";
                $formatted[] = "  - {$title}: {$goal['current']}/{$goal['target']} ({$progress}%) - {$status}";
            }
            $formatted[] = "";
        }
        
        // Individual partner goals
        if (!empty($goalsByUser)) {
            $formatted[] = "INDIVIDUAL PARTNER GOALS:";
            foreach ($goalsByUser as $userId => $userData) {
                $userName = $userData['name'];
                $formatted[] = "\n{$userName}:";
                foreach ($userData['goals'] as $goal) {
            $title = PromptSanitizer::sanitize($goal['title'] ?? 'Untitled');
            $progress = $goal['target'] > 0 
                ? round(($goal['current'] / $goal['target']) * 100, 1)
                : 0;
                    $isCompleted = isset($goal['is_completed']) && $goal['is_completed'] === true;
                    $status = $isCompleted ? "✅ COMPLETED" : "In progress";
                    $formatted[] = "  - {$title}: {$goal['current']}/{$goal['target']} ({$progress}%) - {$status}";
        }
            }
        }
        
        // Count completed goals
        $allGoals = array_merge($householdGoals, array_reduce($goalsByUser, function($carry, $userData) {
            return array_merge($carry, $userData['goals']);
        }, []));
        $completedCount = count(array_filter($allGoals, fn($g) => isset($g['is_completed']) && $g['is_completed'] === true));
        $formatted[] = "\nCRITICAL: Only {$completedCount} goal(s) are actually COMPLETED (100%). Do NOT count goals with less than 100% as completed!";

        return implode("\n", $formatted);
    }

    private static function formatMoodData(array $moodData): string
    {
        if (empty($moodData)) {
            return "No mood data recorded.";
        }

        // Group by user
        $moodsByUser = [];
        $allMoods = [];
        
        foreach ($moodData as $entry) {
            $userId = $entry['user_id'] ?? null;
            $userName = $entry['user_name'] ?? 'Unknown';
            $mood = $entry['mood'] ?? null;
            
            if ($mood) {
                $allMoods[] = $mood;
                
                if (!isset($moodsByUser[$userId])) {
                    $moodsByUser[$userId] = [
                        'name' => $userName,
                        'moods' => [],
                    ];
                }
                
                $moodsByUser[$userId]['moods'][] = $mood;
            }
        }
        
        // Household summary
        $householdMoodCounts = array_count_values($allMoods);
        $householdMostCommon = !empty($householdMoodCounts) 
            ? array_search(max($householdMoodCounts), $householdMoodCounts) 
            : null;
        $householdCount = !empty($householdMoodCounts) ? max($householdMoodCounts) : 0;
        
        $formatted = [];
        $formatted[] = "HOUSEHOLD MOOD SUMMARY:";
        if ($householdMostCommon) {
            $formatted[] = "Most common mood: {$householdMostCommon} (appeared {$householdCount} times across both partners)";
        }
        $formatted[] = "Total mood entries: " . count($allMoods);
        
        // Individual partner breakdowns
        $formatted[] = "\nINDIVIDUAL PARTNER MOOD BREAKDOWNS:";
        foreach ($moodsByUser as $userId => $userData) {
            $userName = $userData['name'];
            $userMoodCounts = array_count_values($userData['moods']);
            $userMostCommon = !empty($userMoodCounts) 
                ? array_search(max($userMoodCounts), $userMoodCounts) 
                : null;
            $userCount = !empty($userMoodCounts) ? max($userMoodCounts) : 0;
            
            $formatted[] = "\n{$userName}:";
            $formatted[] = "  - Total entries: " . count($userData['moods']);
            if ($userMostCommon) {
                $formatted[] = "  - Most common mood: {$userMostCommon} (appeared {$userCount} times)";
            }
            
            // Show all mood counts for this partner
            $moodBreakdown = [];
            foreach ($userMoodCounts as $mood => $count) {
                $moodBreakdown[] = "{$mood}: {$count}";
            }
            if (!empty($moodBreakdown)) {
                $formatted[] = "  - Mood breakdown: " . implode(', ', $moodBreakdown);
            }
        }
        
        return implode("\n", $formatted);
    }

    private static function formatBudgetData(array $budgetData): string
    {
        if (empty($budgetData)) {
            return "No budget data available.";
        }

        $monthlyBudget = isset($budgetData['monthly_budget']) ? PromptSanitizer::sanitizeNumeric($budgetData['monthly_budget']) : null;
        $monthlyExpenses = PromptSanitizer::sanitizeNumeric($budgetData['monthly_expenses'] ?? 0);
        $weeklyExpenses = PromptSanitizer::sanitizeNumeric($budgetData['weekly_expenses'] ?? 0);
        $remainingMonthly = isset($budgetData['remaining_monthly']) ? PromptSanitizer::sanitizeNumeric($budgetData['remaining_monthly']) : null;
        $expensesByUser = $budgetData['expenses_by_user'] ?? [];
        
        $formatted = [];
        $formatted[] = "BUDGET SUMMARY:";
        
        if ($monthlyBudget) {
            $formatted[] = "Monthly budget: \${$monthlyBudget}";
        }
        
        $formatted[] = "Total spent this month (so far): \${$monthlyExpenses}";
        
        if ($remainingMonthly !== null) {
            $formatted[] = "Remaining monthly budget: \${$remainingMonthly}";
        }
        
        $formatted[] = "\nTHIS WEEK'S EXPENSES:";
        $formatted[] = "Total spent this week: \${$weeklyExpenses}";
        
        // Individual partner breakdowns for THIS WEEK
        if (!empty($expensesByUser)) {
            $formatted[] = "\nWeekly expenses by partner:";
            foreach ($expensesByUser as $userExpense) {
                $userName = $userExpense['name'];
                $userTotal = PromptSanitizer::sanitizeNumeric($userExpense['total']);
                $formatted[] = "  - {$userName}: \${$userTotal}";
            }
        } else {
            $formatted[] = "No expenses this week";
        }

        return implode("\n", $formatted);
    }

    private static function formatHabitsData(array $habits): string
    {
        if (empty($habits)) {
            return "No habits tracked this week.";
        }

        // Group by user
        $habitsByUser = [];
        $householdStats = ['total' => 0, 'completed' => 0];

        foreach ($habits as $habit) {
            $userId = $habit['user_id'] ?? null;
            $userName = $habit['user_name'] ?? 'Unknown';

            if (!isset($habitsByUser[$userId])) {
                $habitsByUser[$userId] = [
                    'name' => $userName,
                    'habits' => [],
                    'total_completions' => 0,
                    'total_possible' => 0,
                ];
            }

            $habitsByUser[$userId]['habits'][] = $habit;
            $habitsByUser[$userId]['total_completions'] += $habit['completed_count'];
            $habitsByUser[$userId]['total_possible'] += $habit['total_count'];
            $householdStats['total'] += $habit['total_count'];
            $householdStats['completed'] += $habit['completed_count'];
        }

        $formatted = [];
        $formatted[] = "HOUSEHOLD HABITS SUMMARY:";
        $householdRate = $householdStats['total'] > 0 
            ? round(($householdStats['completed'] / $householdStats['total']) * 100, 1) 
            : 0;
        $formatted[] = "Total habit completions: {$householdStats['completed']}/{$householdStats['total']} ({$householdRate}% completion rate)";

        // Individual partner breakdowns
        $formatted[] = "\nINDIVIDUAL PARTNER HABITS:";
        foreach ($habitsByUser as $userId => $userData) {
            $userName = $userData['name'];
            $userRate = $userData['total_possible'] > 0 
                ? round(($userData['total_completions'] / $userData['total_possible']) * 100, 1) 
                : 0;

            $formatted[] = "\n{$userName}:";
            $formatted[] = "  - Completion rate: {$userRate}% ({$userData['total_completions']}/{$userData['total_possible']})";
            $formatted[] = "  - Habits tracked: " . count($userData['habits']);

            // Show individual habits
            foreach ($userData['habits'] as $habit) {
                $habitName = PromptSanitizer::sanitize($habit['name'] ?? 'Untitled');
                $formatted[] = "    • {$habitName}: {$habit['completed_count']}/{$habit['total_count']} ({$habit['completion_rate']}%)";
            }
        }

        return implode("\n", $formatted);
    }
}

