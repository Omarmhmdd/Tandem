<?php

namespace App\Services\Prompts;

class MoodAnnotationPrompt
{
  public static function getSystemPrompt(): string
{
    return <<<'PROMPT'
You are a mood timeline analyzer. Your task is to analyze health logs, expenses, and mood entries to auto-annotate notable events on the mood timeline.

CRITICAL TYPE CLASSIFICATION RULES (follow strictly):
- "call" type: ONLY for long phone calls mentioned in health log notes (e.g., "2 hour call", "3 hour phone call", "long call")
- "trip" type: ONLY for trips or travel mentioned in health log notes (e.g., "trip to Paris", "traveled to London", "went to Dubai")
- "purchase" type: ONLY for big purchases from expenses (amount > $200, OR category is "wedding" or "big-ticket")
- "event" type: ONLY for special dates, celebrations, achievements mentioned in health logs (e.g., "anniversary", "birthday", "celebration", "achievement")

IMPORTANT: If something mentions a call → use type "call". If something mentions a trip → use type "trip". Do NOT default to "event" for calls or trips.

Instructions:
1. Match events to dates on the mood timeline
2. Generate annotations with type, title, and description
3. Only annotate when you find something meaningful

Return your response as a JSON object with an "annotations" array:
{
  "annotations": [
    {
      "date": "2024-01-15",
      "type": "call|trip|purchase|event",
      "title": "Short title (max 50 chars)",
      "description": "Full description with details"
    }
  ]
}

Type Examples:
- Call: { "type": "call", "title": "2-hour phone call", "description": "Had a 2-hour phone call with mom, feeling good after the conversation" }
- Trip: { "type": "trip", "title": "Trip to Paris", "description": "Went on a trip to Paris today, amazing experience, feeling great" }
- Purchase: { "type": "purchase", "title": "Wedding venue deposit", "description": "Made a $500 deposit for the wedding venue" }
- Event: { "type": "event", "title": "Anniversary celebration", "description": "Anniversary celebration today, had a wonderful dinner with my partner" }

Title should be short (max 50 characters), description should be detailed (1-2 sentences).

Only create annotations when you find something meaningful. Empty array if nothing notable.
PROMPT;
}

    public static function buildUserPrompt(
        array $moodEntries,
        array $healthLogs,
        array $expenses,
        ?string $startDate = null,
        ?string $endDate = null
    ): string {
        $dateRange = $startDate && $endDate 
            ? "from {$startDate} to {$endDate}"
            : "recently";

      $moodSummary = self::formatMoodEntries($moodEntries);
$healthSummary = self::formatHealthLogs($healthLogs);
$expensesSummary = self::formatExpenses($expenses);

return <<<PROMPT
Analyze mood and health data {$dateRange} and identify notable events, patterns, or correlations.

MOOD ENTRIES:
{$moodSummary}

HEALTH LOGS:
{$healthSummary}

EXPENSES:
{$expensesSummary}


Identify any notable events, patterns, or correlations that might explain mood changes. Create annotations for:
- Significant events (calls, trips, purchases, achievements)
- Patterns in activities/food/sleep that correlate with mood
- Anomalies or notable changes
- Positive achievements or milestones

Return annotations as JSON array. Only include meaningful insights.
PROMPT;
    }

    private static function formatMoodEntries(array $entries): string
    {
        if (empty($entries)) {
            return "No mood entries available.";
        }

        $formatted = [];
        foreach ($entries as $entry) {
            $parts = ["Date: {$entry['date']}, Mood: {$entry['mood']}"];
            if (!empty($entry['notes'])) {
                $parts[] = "Notes: {$entry['notes']}";
            }
            $formatted[] = implode('. ', $parts);
        }

        return implode("\n", $formatted);
    }

    private static function formatHealthLogs(array $logs): string
    {
        if (empty($logs)) {
            return "No health logs available.";
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
            if (!empty($log['notes'])) {
                $parts[] = "Notes: {$log['notes']}";
            }
            $formatted[] = implode('. ', $parts);
        }

        return implode("\n", $formatted);
    }
    private static function formatExpenses(array $expenses): string
{
    if (empty($expenses)) {
        return "No expenses available.";
    }

    $formatted = [];
    foreach ($expenses as $expense) {
        $parts = ["Date: {$expense['date']}, Amount: \${$expense['amount']}"];
        $parts[] = "Description: {$expense['description']}";
        $parts[] = "Category: {$expense['category']}";
        $formatted[] = implode('. ', $parts);
    }

    return implode("\n", $formatted);
}
}

