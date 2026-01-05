<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class NutritionCalculationValidator
{
    // Validates and sanitizes LLM response for nutrition calculation
    // Matches intake entries to correct user/partner IDs and names
    public static function validateAndSanitize(array $data, int $userId, string $userName, ?int $partnerUserId = null, ?string $partnerName = null): array
    {
        $validator = Validator::make($data, [
            'partnersIntake' => 'nullable|array',
            'partnersIntake.*.userId' => 'nullable|string',
            'partnersIntake.*.name' => 'nullable|string',
            'partnersIntake.*.today' => 'nullable|array',
            'partnersIntake.*.today.calories' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.protein' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.carbs' => 'nullable|numeric|min:0',
            'partnersIntake.*.today.fat' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly' => 'nullable|array',
            'partnersIntake.*.weekly.calories' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.protein' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.carbs' => 'nullable|numeric|min:0',
            'partnersIntake.*.weekly.fat' => 'nullable|numeric|min:0',
            'recommendations' => 'nullable|array',
            'recommendations.*' => 'string',
            'suggestedMeals' => 'nullable|array',
            'suggestedMeals.*.id' => 'nullable|integer',
            'suggestedMeals.*.name' => 'nullable|string',
            'suggestedMeals.*.calories' => 'nullable|numeric|min:0',
            'suggestedMeals.*.protein' => 'nullable|numeric|min:0',
            'suggestedMeals.*.carbs' => 'nullable|numeric|min:0',
            'suggestedMeals.*.fat' => 'nullable|numeric|min:0',
        ]);

        $validated = $validator->validated();
        $partnersIntake = self::sanitizePartnersIntake(
            $validated['partnersIntake'] ?? [], $userId, $userName, $partnerUserId,$partnerName );
        
        $recommendations = self::sanitizeRecommendations(  $validated['recommendations'] ?? [], $partnersIntake );

        return [
            'partnersIntake' => $partnersIntake,
            'recommendations' => array_values($recommendations),
            'suggestedMeals' => $validated['suggestedMeals'] ?? [],
        ];
    }

    // Sanitizes partners intake array, matches entries to correct user/partner IDs
    private static function sanitizePartnersIntake(array $partnersIntake,int $userId,string $userName,?int $partnerUserId,?string $partnerName): array {
        $seenUserIds = [];
        $uniquePartnersIntake = [];
        $userAssigned = false;
        $partnerAssigned = false;
        $userNameLower = strtolower(trim($userName));
        $partnerNameLower = $partnerName ? strtolower(trim($partnerName)) : null;
        
        foreach ($partnersIntake as $intake) {
            // Skip duplicates
            if (self::isDuplicate($intake, $seenUserIds)) {
                continue;
            }
            
            // Normalize intake data
            $normalized = self::normalizeIntakeEntry($intake);
            
            // Try to match by userId first
            $matched = self::matchByUserId($normalized,$userId,$userName,$partnerUserId,$partnerName,$seenUserIds, $userAssigned,$partnerAssigned );
            
            if ($matched) {
                $uniquePartnersIntake[] = $matched['intake'];
                $userAssigned = $matched['userAssigned'] ?? $userAssigned;
                $partnerAssigned = $matched['partnerAssigned'] ?? $partnerAssigned;
                continue;
            }
            
            // Try to match by name
            $matched = self::matchByName( $normalized,$userId,$userName,$userNameLower,$partnerUserId,$partnerName,$partnerNameLower,$userAssigned,$partnerAssigned );
            
            if ($matched) {
                $uniquePartnersIntake[] = $matched['intake'];
                $userAssigned = $matched['userAssigned'] ?? $userAssigned;
                $partnerAssigned = $matched['partnerAssigned'] ?? $partnerAssigned;
                continue;
            }
            
            // Handle unmatched entry (fallback assignment)
            $matched = self::handleUnmatchedEntry( $normalized, $userId,$userName,$partnerUserId,$partnerName,$userAssigned,$partnerAssigned);
            
            if ($matched) {
                $uniquePartnersIntake[] = $matched['intake'];
                $userAssigned = $matched['userAssigned'] ?? $userAssigned;
                $partnerAssigned = $matched['partnerAssigned'] ?? $partnerAssigned;
            }
        }
        
        return $uniquePartnersIntake;
    }

    // Normalizes intake entry, handles userId that might be a name
    private static function normalizeIntakeEntry(array $intake): array
    {
        $intakeUserId = isset($intake['userId']) ? (string) $intake['userId'] : null;
        $intakeName = isset($intake['name']) ? strtolower(trim($intake['name'])) : null;
        
        // Check if userId is actually a name (non-numeric)
        if ($intakeUserId && !is_numeric($intakeUserId)) {
            $intakeName = strtolower(trim($intakeUserId));
            $intakeUserId = null;
        }
        
        return [
            'intake' => $intake,
            'userId' => $intakeUserId,
            'name' => $intakeName,
        ];
    }

    // Checks if intake entry is a duplicate
    private static function isDuplicate(array $intake, array &$seenUserIds): bool
    {
        $intakeUserId = isset($intake['userId']) ? (string) $intake['userId'] : null;
        
        if ($intakeUserId && is_numeric($intakeUserId) && isset($seenUserIds[$intakeUserId])) {
            return true;
        }
        
        if ($intakeUserId && is_numeric($intakeUserId)) {
            $seenUserIds[$intakeUserId] = true;
        }
        
        return false;
    }

    // Matches intake entry by userId
    private static function matchByUserId(array $normalized,int $userId,string $userName,?int $partnerUserId,?string $partnerName,array &$seenUserIds,bool $userAssigned,bool $partnerAssigned): ?array {
    
            $intakeUserId = $normalized['userId'];
        
        if ($intakeUserId === (string) $userId && !$userAssigned) {
            $normalized['intake']['userId'] = (string) $userId;
            $normalized['intake']['name'] = $userName;
            return [
                'intake' => $normalized['intake'],
                'userAssigned' => true,
            ];
        }
        
        if ($partnerUserId && $intakeUserId === (string) $partnerUserId && !$partnerAssigned) {
            $normalized['intake']['userId'] = (string) $partnerUserId;
            $normalized['intake']['name'] = $partnerName ?? 'Partner';
            return [
                'intake' => $normalized['intake'],
                'partnerAssigned' => true,
            ];
        }
        
        return null;
    }

    // Matches intake entry by name
    private static function matchByName(array $normalized,int $userId,string $userName,string $userNameLower,?int $partnerUserId,?string $partnerName,?string $partnerNameLower,bool $userAssigned,bool $partnerAssigned): ?array {
        $intakeName = $normalized['name'];
        
        if ($intakeName === $userNameLower && !$userAssigned) {
            $normalized['intake']['userId'] = (string) $userId;
            $normalized['intake']['name'] = $userName;
            return [
                'intake' => $normalized['intake'],
                'userAssigned' => true,
            ];
        }
        
        if ($partnerNameLower && $intakeName === $partnerNameLower && !$partnerAssigned) {
            $normalized['intake']['userId'] = (string) $partnerUserId;
            $normalized['intake']['name'] = $partnerName ?? 'Partner';
            return [
                'intake' => $normalized['intake'],
                'partnerAssigned' => true,
            ];
        }
        
        return null;
    }

    // Handles unmatched entry by assigning to user or partner as fallback
    private static function handleUnmatchedEntry(array $normalized,int $userId,string $userName,?int $partnerUserId,?string $partnerName,bool $userAssigned,bool $partnerAssigned): ?array {
        $intakeUserId = $normalized['userId'];
        $intakeName = $normalized['name'];
        
        // If no userId and no name, assign to user if not assigned yet
        if (!$intakeUserId && !$intakeName && !$userAssigned) {
            $normalized['intake']['userId'] = (string) $userId;
            $normalized['intake']['name'] = $userName;
            return [
                'intake' => $normalized['intake'],
                'userAssigned' => true,
            ];
        }
        
        // If no userId and no name, assign to partner if user already assigned
        if (!$intakeUserId && !$intakeName && $partnerUserId && !$partnerAssigned) {
            $normalized['intake']['userId'] = (string) $partnerUserId;
            $normalized['intake']['name'] = $partnerName ?? 'Partner';
            return [
                'intake' => $normalized['intake'],
                'partnerAssigned' => true,
            ];
        }
        
        return null;
    }

    // Filters out recommendations that don't make sense when intake is 0
    private static function sanitizeRecommendations(array $recommendations, array $partnersIntake): array
    {
        $hasIntake = self::hasAnyIntake($partnersIntake);
        
        if (!$hasIntake) {
            $recommendations = array_filter($recommendations, function($rec) {
                return !self::isInvalidRecommendation($rec);
            });
        }
        
        return $recommendations;
    }

    // Checks if any partner has intake data
    private static function hasAnyIntake(array $partnersIntake): bool
    {
        foreach ($partnersIntake as $intake) {
            if (($intake['today']['calories'] ?? 0) > 0 || 
                ($intake['today']['protein'] ?? 0) > 0 || 
                ($intake['today']['carbs'] ?? 0) > 0 || 
                ($intake['today']['fat'] ?? 0) > 0) {
                return true;
            }
        }
        return false;
    }

    // Checks if recommendation is invalid (mentions targets/goals when intake is 0)
    private static function isInvalidRecommendation(string $recommendation): bool
    {
        $recLower = strtolower($recommendation);
        $invalidKeywords = ['exceeded', 'above', 'below', 'over', 'under', 'target'];
        
        foreach ($invalidKeywords as $keyword) {
            if (strpos($recLower, $keyword) !== false && 
                (strpos($recLower, 'target') !== false || strpos($recLower, 'goal') !== false)) {
                return true;
            }
        }
        
        return false;
    }
}