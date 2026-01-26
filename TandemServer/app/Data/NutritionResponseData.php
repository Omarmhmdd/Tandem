<?php

namespace App\Data;

class NutritionResponseData
{

    public static function build(array $validated, array $targets): array
    {
        return [
            'partnersIntake' => $validated['partnersIntake'] ?? [],
            'recommendations' => $validated['recommendations'] ?? [],
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
            'targets' => $targets,
        ];
    }


    public static function generateCacheKey(int $userId, ?int $partnerUserId, ?string $userLastTimestamp, ?string $partnerLastTimestamp): string
    {
        $today = now()->format('Y-m-d');
        $timestampHash = md5(($userLastTimestamp ?? 'none') . '_' . ($partnerLastTimestamp ?? 'none'));
        
        $cacheKey = "nutrition_recommendations_{$userId}_{$today}_{$timestampHash}";
        
        if ($partnerUserId) {
            $cacheKey .= "_{$partnerUserId}";
        }
        
        return $cacheKey;
    }

    
    public static function getCacheExpiration(): \Carbon\Carbon
    {
        return now()->endOfDay();
    }


    public static function fixRecommendationsWithCorrectMath(array $validated, array $targets, string $userName): array
    {
        if (empty($validated['recommendations']) || empty($validated['partnersIntake'])) {
            return $validated;
        }

        // Find user intake from partnersIntake
        $userIntake = null;
        foreach ($validated['partnersIntake'] as $intake) {
            if (isset($intake['userId']) && isset($intake['today'])) {
                $userIntake = $intake;
                break;
            }
        }

        if (!$userIntake || !isset($userIntake['today']) || !$targets['user']) {
            return $validated;
        }

        $userTarget = $targets['user'];
        $todayIntake = $userIntake['today'];

        // Calculate correct values
        $consumedCalories = round($todayIntake['calories'] ?? 0);
        $targetCalories = round($userTarget['calories'] ?? 0);
        $caloriesDiff = $targetCalories - $consumedCalories;
        $caloriesAbsDiff = abs($caloriesDiff);
        $caloriesDirection = $caloriesDiff < 0 ? 'above' : 'below';

        $consumedProtein = round($todayIntake['protein'] ?? 0);
        $targetProtein = round($userTarget['protein'] ?? 0);
        $proteinDiff = $targetProtein - $consumedProtein;
        $proteinAbsDiff = abs($proteinDiff);
        $proteinDirection = $proteinDiff < 0 ? 'above' : 'below';

        $consumedCarbs = round($todayIntake['carbs'] ?? 0);
        $targetCarbs = round($userTarget['carbs'] ?? 0);
        $carbsDiff = $targetCarbs - $consumedCarbs;
        $carbsAbsDiff = abs($carbsDiff);
        $carbsDirection = $carbsDiff < 0 ? 'above' : 'below';

        $consumedFat = round($todayIntake['fat'] ?? 0);
        $targetFat = round($userTarget['fat'] ?? 0);
        $fatDiff = $targetFat - $consumedFat;
        $fatAbsDiff = abs($fatDiff);
        $fatDirection = $fatDiff < 0 ? 'above' : 'below';

        // Fix each recommendation by replacing incorrect numbers
        $fixedRecommendations = [];
        foreach ($validated['recommendations'] as $index => $recommendation) {
            $fixed = $recommendation;

            // Fix calories recommendation - find and replace incorrect calorie difference
            if (stripos($recommendation, 'calorie') !== false || stripos($recommendation, 'kcal') !== false) {
                // Pattern 1: "X calories below/above your target" - most common pattern
                // Match: number + "calories" + "below/above" + "your target"
                if (preg_match('/(\d+)\s+calories?\s+(below|above|under|over)\s+your\s+target/i', $fixed, $matches)) {
                    $mentionedDiff = (int) $matches[1];
                    // Fix if difference is wrong (threshold: >50 calories)
                    if (abs($mentionedDiff - $caloriesAbsDiff) > 50) {
                        $fixed = preg_replace(
                            '/(\d+)\s+calories?\s+(below|above|under|over)\s+your\s+target/i',
                            "{$caloriesAbsDiff} calories {$caloriesDirection} your target",
                            $fixed,
                            1
                        );
                    }
                }
                
                // Pattern 2: "your calorie intake today is X calories below/above"
                if (preg_match('/your\s+calorie\s+intake\s+(?:today\s+)?is\s+(\d+)\s+calories?\s+(below|above|under|over)/i', $fixed, $matches)) {
                    $mentionedDiff = (int) $matches[1];
                    if (abs($mentionedDiff - $caloriesAbsDiff) > 50) {
                        $fixed = preg_replace(
                            '/your\s+calorie\s+intake\s+(?:today\s+)?is\s+(\d+)\s+calories?\s+(below|above|under|over)/i',
                            "your calorie intake today is {$caloriesAbsDiff} calories {$caloriesDirection}",
                            $fixed,
                            1
                        );
                    }
                }
                
                // Pattern 3: Just "X calories below/above" (without "your target")
                if (preg_match('/(\d+)\s+calories?\s+(below|above|under|over)(?!\s+your)/i', $fixed, $matches)) {
                    $mentionedDiff = (int) $matches[1];
                    if (abs($mentionedDiff - $caloriesAbsDiff) > 50) {
                        $fixed = preg_replace(
                            '/(\d+)\s+calories?\s+(below|above|under|over)(?!\s+your)/i',
                            "{$caloriesAbsDiff} calories {$caloriesDirection}",
                            $fixed,
                            1
                        );
                    }
                }
                
                // Pattern 4: "X calories of your Y calorie target"
                if (preg_match('/(\d+)\s+calories?\s+of\s+your\s+(\d+)\s+calorie\s+target/i', $fixed, $matches)) {
                    $mentionedConsumed = (int) $matches[1];
                    $mentionedTarget = (int) $matches[2];
                    if (abs($mentionedConsumed - $consumedCalories) > 50 || abs($mentionedTarget - $targetCalories) > 50) {
                        $fixed = preg_replace(
                            '/(\d+)\s+calories?\s+of\s+your\s+(\d+)\s+calorie\s+target/i',
                            "{$consumedCalories} calories of your {$targetCalories} calorie target",
                            $fixed,
                            1
                        );
                    }
                }
            }

            // Fix protein recommendation - only if numbers are clearly wrong
            if (stripos($recommendation, 'protein') !== false && stripos($recommendation, 'calorie') === false) {
                if (preg_match('/(\d+)\s*g\s*protein/i', $fixed, $matches)) {
                    $mentionedProtein = (int) $matches[1];
                    // If the number is significantly wrong (>10g difference), fix it
                    if (abs($mentionedProtein - $consumedProtein) > 10) {
                        $fixed = preg_replace(
                            '/(\d+)\s*g\s*protein/i',
                            "{$consumedProtein}g protein",
                            $fixed,
                            1
                        );
                    }
                }
            }

            // Fix carbs recommendation - only if numbers are clearly wrong
            if (stripos($recommendation, 'carb') !== false && stripos($recommendation, 'calorie') === false && stripos($recommendation, 'protein') === false) {
                if (preg_match('/(\d+)\s*g\s*carb/i', $fixed, $matches)) {
                    $mentionedCarbs = (int) $matches[1];
                    // If the number is significantly wrong (>10g difference), fix it
                    if (abs($mentionedCarbs - $consumedCarbs) > 10) {
                        $fixed = preg_replace(
                            '/(\d+)\s*g\s*carb/i',
                            "{$consumedCarbs}g carbs",
                            $fixed,
                            1
                        );
                    }
                }
                  // Fix direction word (below/above)
                if (preg_match('/(below|above|under|over)(\s+your\s+\d+\s*g\s+target)/i', $fixed, $matches)) {
                    $currentDirection = strtolower($matches[1]);
                    // If direction is wrong, replace it
                    if (($currentDirection === 'below' && $carbsDirection === 'above') ||
                        ($currentDirection === 'above' && $carbsDirection === 'below')) {
                        $fixed = preg_replace(
                            '/(below|above|under|over)(\s+your\s+\d+\s*g\s+target)/i',
                            $carbsDirection . '$2',
                            $fixed,
                            1
                        );
                    }
                }
            }

            // Fix fat recommendation - only if numbers are clearly wrong
            if (stripos($recommendation, 'fat') !== false && stripos($recommendation, 'calorie') === false && stripos($recommendation, 'protein') === false && stripos($recommendation, 'carb') === false) {
                if (preg_match('/(\d+)\s*g\s*fat/i', $fixed, $matches)) {
                    $mentionedFat = (int) $matches[1];
                    // If the number is significantly wrong (>5g difference), fix it
                    if (abs($mentionedFat - $consumedFat) > 5) {
                        $fixed = preg_replace(
                            '/(\d+)\s*g\s*fat/i',
                            "{$consumedFat}g fat",
                            $fixed,
                            1
                        );
                    }
                }
            }

            $fixedRecommendations[] = $fixed;
        }

        $validated['recommendations'] = $fixedRecommendations;
        return $validated;
    }
}

