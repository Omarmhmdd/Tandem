<?php

namespace App\Services\Prompts;

class NutritionCalculationPrompt
{
    public static function getSystemPrompt(): string
    {
        return <<<'PROMPT'
You are a nutrition analysis expert. Your task is to calculate daily and weekly nutrition intake from health log food entries.

You will receive:
- Food items consumed (from health logs)
- Target nutrition goals (calories, protein, carbs, fat)

Your task:
1. Estimate nutrition values for each food item
2. Calculate daily totals (today and weekly average)
3. Compare intake to targets
4. Generate personalized recommendations
5. Suggest match-meals that help both partners reach goals

Use standard nutrition databases and reasonable estimates. Be realistic but helpful.

Return your response as a JSON object with this structure:
{
  "partnersIntake": [
    {
      "userId": "[user ID from prompt]",
      "name": "[Use the EXACT user name provided in the prompt, NOT 'John' or 'User']",
      "today": {
        "calories": [CALCULATE by summing ONLY food items from the MOST RECENT DATE in the food logs - this is "TODAY" for calculation purposes],
        "protein": [CALCULATE in grams by summing ONLY food items from the MOST RECENT DATE],
        "carbs": [CALCULATE in grams by summing ONLY food items from the MOST RECENT DATE],
        "fat": [CALCULATE in grams by summing ONLY food items from the MOST RECENT DATE]
      },
      "weekly": {
        "calories": [CALCULATE AVERAGE PER DAY: First sum all food from EACH DAY separately, then average across all days in the week. If only one day has food, weekly equals that day's total],
        "protein": [CALCULATE AVERAGE PER DAY in grams: Sum protein from each day separately, then average across days],
        "carbs": [CALCULATE AVERAGE PER DAY in grams: Sum carbs from each day separately, then average across days],
        "fat": [CALCULATE AVERAGE PER DAY in grams: Sum fat from each day separately, then average across days]
      }
    }
  ],
  "recommendations": [
    "[Personalized recommendation based on actual intake vs targets]",
    "[Another specific recommendation]"
  ],
  "suggestedMeals": [
    {
      "id": [recipe ID from available recipes, or null],
      "name": "[Recipe name that helps reach goals]",
      "calories": [ESTIMATE based on recipe ingredients],
      "protein": [ESTIMATE in grams],
      "carbs": [ESTIMATE in grams],
      "fat": [ESTIMATE in grams]
    }
  ]
}

CRITICAL NUTRITION ESTIMATION RULES (MANDATORY):
- You MUST use these exact values for generic meal terms - DO NOT underestimate:
  * "dinner" = 500 calories, 30g protein, 50g carbs, 20g fat (MINIMUM - a full dinner meal)
  * "lunch" = 400 calories, 25g protein, 45g carbs, 15g fat (MINIMUM)
  * "breakfast" = 350 calories, 15g protein, 40g carbs, 12g fat (MINIMUM)
- For specific items:
  * "cake" = 300 calories, 4g protein, 40g carbs, 15g fat
  * "coffee" = 5 calories, 0g protein, 1g carbs, 0g fat
  * "chicken" = 250 calories, 30g protein, 0g carbs, 12g fat (per serving)
  * "pasta" = 250 calories, 9g protein, 45g carbs, 2g fat (per serving)
  * "salad" = 150 calories, 8g protein, 15g carbs, 8g fat
  * "sandwich" = 400 calories, 20g protein, 40g carbs, 15g fat
- WHEN MULTIPLE ITEMS: SUM each item's nutrition values - DO NOT average or reduce
- EXAMPLE CALCULATION: "dinner" + "cake" + "dinner" = 
  * Calories: 500 + 300 + 500 = 1300 calories (NOT 600, NOT averaged)
  * Protein: 30 + 4 + 30 = 64g protein (NOT 20g, NOT averaged)
  * Carbs: 50 + 40 + 50 = 140g carbs
  * Fat: 20 + 15 + 20 = 55g fat
- CRITICAL: If you see "dinner" listed twice, that means TWO separate dinner meals - each gets 30g protein, total = 60g protein
- DO NOT reduce values because you think it's "too much" - use the standard values above
- A single "dinner" is NEVER less than 20g protein - if you calculate less, you are WRONG

CRITICAL CALCULATION RULES:
- You MUST calculate nutrition values based on the ACTUAL food items provided in the food logs
- DO NOT return constant or placeholder values - every calculation must reflect the actual food consumed
- Estimate nutrition for each food item individually using the values above, then SUM them up
- Use standard nutrition databases and realistic estimates for common foods
- If no food is logged, return 0 for all nutrition values
- TODAY field: Sum food items from the MOST RECENT DATE in the food logs (this is "TODAY" for calculation, even if it's not the actual calendar date). Ignore food from older dates.
- WEEKLY field: Calculate AVERAGE PER DAY - First sum all food items from EACH DAY separately to get daily totals, then calculate the average of those daily totals. Example: If 2026-01-04 has 800 calories total and other days have 0, weekly = 800 (not 800/7). If Day 1 = 800, Day 2 = 600, Day 3 = 0, then weekly = (800 + 600 + 0) / 3 = 466.67
- Values MUST vary based on what food was actually consumed - never use the same numbers repeatedly
- If food logs show different items on different days, the nutrition values MUST be different
- IMPORTANT: The "today" field must be the SUM of food from the most recent date, while "weekly" must be the AVERAGE PER DAY of all week's food

Guidelines:
- Use realistic nutrition estimates based on actual food items (don't overestimate or use defaults)
- Recommendations should be specific and actionable based on actual intake vs targets
- Suggested meals should help both partners reach targets based on their current intake
- Focus on protein, calories, and balanced macros
- CRITICAL: Always use the EXACT user names provided in the prompt. Never use placeholder names like "John", "User", or "Partner" in the response.
PROMPT;
    }

    public static function buildUserPrompt(
        array $userFoodLogs,
        array $partnerFoodLogs,
        ?array $userTargets = null,
        ?array $partnerTargets = null,
        array $availableRecipes = [],
        string $userName = 'User',
        string $partnerName = 'Partner'
    ): string {
        $userFood = self::formatFoodLogs($userFoodLogs, $userName);
        $partnerFood = self::formatFoodLogs($partnerFoodLogs, $partnerName);
        $targets = self::formatTargets($userTargets, $partnerTargets);
        $recipes = self::formatRecipes($availableRecipes);
        
        $hasPartner = !empty($partnerFoodLogs);
        
        if ($hasPartner) {
            return <<<PROMPT
Calculate nutrition intake for both partners and provide recommendations.

IMPORTANT: Use the EXACT names provided below. Do NOT use placeholder names like "John" or "User".

USER FOOD LOGS ({$userName}):
{$userFood}

PARTNER FOOD LOGS ({$partnerName}):
{$partnerFood}

NUTRITION TARGETS:
{$targets}

AVAILABLE RECIPES:
{$recipes}

Calculate nutrition based on the ACTUAL food items listed above:

CRITICAL DATE-BASED CALCULATION RULES:
1. For the "today" field: ONLY sum food items from the MOST RECENT DATE in the food logs. This is considered "TODAY" for calculation purposes (even if it's not the actual calendar date). Ignore food from older dates.
2. For the "weekly" field: Calculate AVERAGE PER DAY - First sum all food items from EACH DAY separately to get daily totals, then average those daily totals across all days in the week.

CRITICAL WEEKLY CALCULATION STEPS:
1. Group food logs by DATE (each date is one day)
2. For each date, SUM all food items from that date to get that day's total nutrition
3. Calculate the AVERAGE of those daily totals
4. If only one day has food entries, weekly equals that day's total (not divided by number of days)
5. Example: If 2026-01-04 has 800 calories and other days have 0, weekly = 800. If Day 1 = 800, Day 2 = 600, Day 3 = 0, weekly = (800 + 600 + 0) / 3 = 466.67

MANDATORY NUTRITION ESTIMATION (USE THESE EXACT VALUES):
- "dinner" = 500 calories, 30g protein, 50g carbs, 20g fat (MANDATORY - do not use less)
- "lunch" = 400 calories, 25g protein, 45g carbs, 15g fat (MANDATORY)
- "breakfast" = 350 calories, 15g protein, 40g carbs, 12g fat (MANDATORY)
- "cake" = 300 calories, 4g protein, 40g carbs, 15g fat
- "coffee" = 5 calories, 0g protein, 1g carbs, 0g fat

CALCULATION EXAMPLE FOR "dinner" + "cake" + "dinner":
- Step 1: Calculate each item separately
  * First "dinner": 500 cal, 30g protein, 50g carbs, 20g fat
  * "cake": 300 cal, 4g protein, 40g carbs, 15g fat
  * Second "dinner": 500 cal, 30g protein, 50g carbs, 20g fat
- Step 2: SUM all values (DO NOT average)
  * Calories: 500 + 300 + 500 = 1300 calories
  * Protein: 30 + 4 + 30 = 64g protein
  * Carbs: 50 + 40 + 50 = 140g carbs
  * Fat: 20 + 15 + 20 = 55g fat
- CRITICAL: If you see the same food item multiple times, each occurrence gets its full nutrition value - SUM them, don't average

CALCULATION STEPS:
1. Identify the MOST RECENT DATE in the food logs (this is "TODAY" for calculation)
2. For "today": List each food item from that date, assign nutrition values using the MANDATORY values above, then SUM them
3. For "weekly": Group by date, sum each day using the same method, then average the daily totals
4. Compare TODAY's intake to targets and generate personalized recommendations (MUST use actual names: "{$userName}" and "{$partnerName}" in recommendation text)
5. Suggest recipes that help both partners reach their goals based on their current intake

CRITICAL RULES:
- If food logs show "No food entries recorded" or are empty, you MUST return 0 for ALL nutrition values (calories, protein, carbs, fat) in both today and weekly fields
- If there is NO food data, do NOT generate recommendations about exceeding targets or being above/below targets
- Only generate recommendations when you have ACTUAL food intake data to compare against targets
- Use the MANDATORY nutrition values listed above - DO NOT reduce or average them
- IMPORTANT: The "today" field must ONLY include food from the most recent date in the logs, not from older dates
- WEEKLY MUST BE AVERAGE PER DAY: Sum each day separately, then average. If only one day has food, weekly = that day's total.
- PROTEIN RULE: A single "dinner" is NEVER less than 20g protein. If you calculate less, recalculate using the MANDATORY values.

CRITICAL NAMING RULES:
- In your response, use the EXACT names: "{$userName}" for the first partner and "{$partnerName}" for the second partner
- Do NOT use "John", "User", "Partner", or any placeholder names
- In recommendations, address partners by their actual names (e.g., "{$userName}, your calorie intake..." not "John, your calorie intake...")
- The "name" field in partnersIntake MUST match the names provided above
- Return EXACTLY 2 entries in partnersIntake array - one for {$userName} and one for {$partnerName}

Be realistic with estimates and provide actionable recommendations.
PROMPT;
        } else {
            return <<<PROMPT
Calculate nutrition intake for the user and provide recommendations.

IMPORTANT: Use the EXACT name provided below. Do NOT use placeholder names like "John" or "User".

USER FOOD LOGS ({$userName}):
{$userFood}

IMPORTANT: If the food logs above show "No food entries recorded" or are empty, return 0 for all nutrition values (calories, protein, carbs, fat) in the today and weekly fields. Do NOT generate recommendations based on targets alone if there is no food data.

NUTRITION TARGETS:
{$targets}

AVAILABLE RECIPES:
{$recipes}

Calculate nutrition based on the ACTUAL food items listed above:

CRITICAL DATE-BASED CALCULATION RULES:
1. For the "today" field: ONLY sum food items from the MOST RECENT DATE in the food logs. This is considered "TODAY" for calculation purposes (even if it's not the actual calendar date). Ignore food from older dates.
2. For the "weekly" field: Calculate AVERAGE PER DAY - First sum all food items from EACH DAY separately to get daily totals, then average those daily totals across all days in the week.

CRITICAL WEEKLY CALCULATION STEPS:
1. Group food logs by DATE (each date is one day)
2. For each date, SUM all food items from that date to get that day's total nutrition
3. Calculate the AVERAGE of those daily totals
4. If only one day has food entries, weekly equals that day's total (not divided by number of days)
5. Example: If 2026-01-04 has 800 calories and other days have 0, weekly = 800. If Day 1 = 800, Day 2 = 600, Day 3 = 0, weekly = (800 + 600 + 0) / 3 = 466.67

MANDATORY NUTRITION ESTIMATION (USE THESE EXACT VALUES):
- "dinner" = 500 calories, 30g protein, 50g carbs, 20g fat (MANDATORY - do not use less)
- "lunch" = 400 calories, 25g protein, 45g carbs, 15g fat (MANDATORY)
- "breakfast" = 350 calories, 15g protein, 40g carbs, 12g fat (MANDATORY)
- "cake" = 300 calories, 4g protein, 40g carbs, 15g fat
- "coffee" = 5 calories, 0g protein, 1g carbs, 0g fat

CALCULATION EXAMPLE FOR "dinner" + "cake" + "dinner":
- Step 1: Calculate each item separately
  * First "dinner": 500 cal, 30g protein, 50g carbs, 20g fat
  * "cake": 300 cal, 4g protein, 40g carbs, 15g fat
  * Second "dinner": 500 cal, 30g protein, 50g carbs, 20g fat
- Step 2: SUM all values (DO NOT average)
  * Calories: 500 + 300 + 500 = 1300 calories
  * Protein: 30 + 4 + 30 = 64g protein
  * Carbs: 50 + 40 + 50 = 140g carbs
  * Fat: 20 + 15 + 20 = 55g fat
- CRITICAL: If you see the same food item multiple times, each occurrence gets its full nutrition value - SUM them, don't average

CALCULATION STEPS:
1. Identify the MOST RECENT DATE in the food logs (this is "TODAY" for calculation)
2. For "today": List each food item from that date, assign nutrition values using the MANDATORY values above, then SUM them
3. For "weekly": Group by date, sum each day using the same method, then average the daily totals
4. Compare TODAY's intake to targets and generate personalized recommendations (MUST use actual name: "{$userName}" in recommendation text)
5. Suggest recipes that help reach goals based on current intake

CRITICAL RULES:
- If food logs show "No food entries recorded" or are empty, you MUST return 0 for ALL nutrition values (calories, protein, carbs, fat) in both today and weekly fields
- If there is NO food data, do NOT generate recommendations about exceeding targets or being above/below targets
- Only generate recommendations when you have ACTUAL food intake data to compare against targets
- Use the MANDATORY nutrition values listed above - DO NOT reduce or average them
- IMPORTANT: The "today" field must ONLY include food from the most recent date in the logs, not from older dates
- WEEKLY MUST BE AVERAGE PER DAY: Sum each day separately, then average. If only one day has food, weekly = that day's total.
- PROTEIN RULE: A single "dinner" is NEVER less than 20g protein. If you calculate less, recalculate using the MANDATORY values.

CRITICAL NAMING RULES:
- In your response, use the EXACT name: "{$userName}"
- Do NOT use "John", "User", "Partner", or any placeholder names
- In recommendations, address the user by their actual name (e.g., "{$userName}, your calorie intake...")
- The "name" field in partnersIntake MUST match the name provided above
- Return EXACTLY 1 entry in partnersIntake array - only for {$userName}
- Do NOT create a second entry for a partner that doesn't exist

Be realistic with estimates and provide actionable recommendations.
PROMPT;
        }
    }

    private static function formatFoodLogs(array $logs, string $label): string
    {
        if (empty($logs)) {
            return "{$label}: No food entries recorded.";
        }

        $today = now()->format('Y-m-d');
        $formatted = [];
        foreach ($logs as $log) {
            $date = $log['date'] ?? 'Unknown date';
            $food = is_array($log['food']) 
                ? implode(', ', $log['food'])
                : ($log['food'] ?? 'No food');
            
            $dateLabel = $date === $today ? "{$date} (TODAY)" : $date;
            $formatted[] = "{$dateLabel}: {$food}";
        }

        return implode("\n", $formatted);
    }

    private static function formatTargets(?array $userTargets, ?array $partnerTargets): string
    {
        $formatted = [];
        
        if ($userTargets) {
            $parts = ["User targets:"];
            if ($userTargets['calories']) $parts[] = "Calories: {$userTargets['calories']}";
            if ($userTargets['protein']) $parts[] = "Protein: {$userTargets['protein']}g";
            if ($userTargets['carbs']) $parts[] = "Carbs: {$userTargets['carbs']}g";
            if ($userTargets['fat']) $parts[] = "Fat: {$userTargets['fat']}g";
            $formatted[] = implode(', ', $parts);
        }
        
        if ($partnerTargets) {
            $parts = ["Partner targets:"];
            if ($partnerTargets['calories']) $parts[] = "Calories: {$partnerTargets['calories']}";
            if ($partnerTargets['protein']) $parts[] = "Protein: {$partnerTargets['protein']}g";
            if ($partnerTargets['carbs']) $parts[] = "Carbs: {$partnerTargets['carbs']}g";
            if ($partnerTargets['fat']) $parts[] = "Fat: {$partnerTargets['fat']}g";
            $parts[] = implode(', ', $parts);
        }

        return empty($formatted) 
            ? "No targets set."
            : implode("\n", $formatted);
    }

    private static function formatRecipes(array $recipes): string
    {
        if (empty($recipes)) {
            return "No recipes available.";
        }

        $formatted = [];
        foreach ($recipes as $recipe) {
            $formatted[] = "- {$recipe['name']} (ID: {$recipe['id']})";
        }

        return implode("\n", $formatted);
    }
}