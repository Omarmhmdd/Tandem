<?php

namespace App\Services\Rag;

class RagFilterService
{
    public function detectDocumentType(string $question): ?string
    {
        $lowerQuestion = strtolower($question);
        
        // Recipe queries - check first to avoid false positives
        if (preg_match('/\b(recipe|recipes|dish|dishes|meal|meals|cook|how to cook|how to make)\b/', $lowerQuestion)) {
            return DocumentType::RECIPE;
        }
        
        // Pantry queries
        if (preg_match('/\b(pantry|pantry item|pantry items|grocery|groceries|what.*in.*pantry|what.*have.*pantry)\b/', $lowerQuestion)) {
            return DocumentType::PANTRY_ITEM;
        }
        
        // Health log queries (but not if it's about recipes)
        if (preg_match('/\b(health log|health logs|what.*ate|what.*eat|what.*food|sleep|mood|activity|activities|yesterday|today)\b/', $lowerQuestion)) {
            // Only return health_log if it's not about recipes
            if (!preg_match('/\b(recipe|recipes)\b/', $lowerQuestion)) {
                return DocumentType::HEALTH_LOG;
            }
        }
        
        // Goal queries
        if (preg_match('/\b(goal|goals|target|progress|my goal|my goals)\b/', $lowerQuestion)) {
            return DocumentType::GOAL;
        }
        
        return null; // No specific type detected
    }

    public function isPersonalQuery(string $question): bool
    {
        $personalKeywords = ['i ', 'my ', 'me ', 'myself', 'i\'ve', 'i\'m', 'i\'d'];
        $lowerQuestion = strtolower($question);

        foreach ($personalKeywords as $keyword) {
            if (str_contains($lowerQuestion, $keyword)) {
                return true;
            }
        }

        return false;
    }

    public function isPersonalDataQuery(string $question): bool
    {
        $lowerQuestion = strtolower($question);
        
        // Personal data keywords
        $personalDataKeywords = [
            'health log', 'health', 'mood', 'sleep', 'ate', 'eat', 'food', 
            'activity', 'activities', 'goal', 'goals', 'my goal', 'my goals',
            'yesterday', 'today', 'last week', 'this week'
        ];
        
        // Household data keywords (recipes, pantry)
        $householdDataKeywords = [
            'recipe', 'recipes', 'pantry', 'pantry item', 'pantry items',
            'ingredient', 'ingredients', 'cook', 'cooking'
        ];
        
        // If query mentions household data, don't filter by user_id
        foreach ($householdDataKeywords as $keyword) {
            if (str_contains($lowerQuestion, $keyword)) {
                return false; // This is about household data, not personal
            }
        }
        
        // If query mentions personal data, filter by user_id
        foreach ($personalDataKeywords as $keyword) {
            if (str_contains($lowerQuestion, $keyword)) {
                return true; // This is about personal data
            }
        }
        
        // Default: if query is personal ("I", "my") but doesn't specify type,
        // assume it's about personal data (health logs, etc.)
        return true;
    }

    public function filterDocuments(array $documents, ?string $documentType, ?int $userId = null): array
    {
        if (!$documentType) {
            return $documents;
        }

        $filtered = [];
        foreach ($documents as $doc) {
            $docType = $doc['metadata']['document_type'] ?? null;
            
            if ($docType !== $documentType) {
                continue;
            }

            // Special handling for goals: filter to include household-level OR user-level goals
            if ($documentType === DocumentType::GOAL && $userId) {
                $docUserId = $doc['metadata']['user_id'] ?? null;
                if ($docUserId !== null && $docUserId != $userId) {
                    continue;
                }
            }

            $filtered[] = $doc;
        }

        return $filtered;
    }

    public function buildFilters(int $householdId, string $question, ?int $userId, ?string $documentType): array
    {
        $filters = ['household_id' => $householdId];
        
        // Add document_type filter if detected
        if ($documentType) {
            $filters['document_type'] = $documentType;
        }
        
        // Add user_id filter for personal data queries (but not for goals or household data)
        if ($this->isPersonalQuery($question) 
            && $userId 
            && $this->isPersonalDataQuery($question) 
            && $documentType !== DocumentType::GOAL) {
            $filters['user_id'] = $userId;
        }
        
        return $filters;
    }
}

