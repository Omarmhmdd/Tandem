<?php

namespace App\Services\Rag;

class RagService
{
    public function __construct(
        private EmbeddingService $embeddingService,
        private VectorDbService $vectorDbService,
        private LlmService $llmService,
        private RagFilterService $filterService
    ) {}

    public function query(
        string $question,
        RagQueryContext $context
    ): array {
        // 1. Embed the question
        $questionEmbedding = $this->embeddingService->embed($question);

        // 2. Detect document type and build filters
        $documentType = $this->filterService->detectDocumentType($question);
        $filters = $this->filterService->buildFilters($context->householdId, $question, $context->userId, $documentType);

        // 3. Search vector DB
        $documents = $this->vectorDbService->search(
            queryVector: $questionEmbedding,
            topK: $context->topK,
            filters: $filters
        );

        // 4. Filter documents by type (safety check)
        if ($documentType) {
            $documents = $this->filterService->filterDocuments($documents, $documentType, $context->userId);
        }

        // 5. Fallback: If no documents found, check if they exist in DB
        if (empty($documents) && $documentType) {
            $documents = $this->handleEmptyResults($questionEmbedding, $documentType, $context->householdId, $context->userId, $context->topK, $filters);
        }

        // 6. Final validation: Ensure no wrong document types
        if ($documentType && !empty($documents)) {
            $documents = $this->validateDocumentTypes($documents, $documentType, $context->userId);
        }

        // 7. Generate answer with LLM
        $result = $this->llmService->generateWithContext(
            question: $question,
            contextDocuments: $documents,
            userInfo: $context->userInfo
        );

        // 8. Map citations back to source IDs
        $result['citations'] = $this->mapCitations($result['citations'], $documents);

        return $result;
    }

    private function handleEmptyResults(
        array $questionEmbedding,
        string $documentType,
        int $householdId,
        ?int $userId,
        int $topK,
        array $originalFilters
    ): array {
        $documentsExist = $this->checkDocumentsExistInDb($documentType, $householdId, $userId);
        
        if ($documentsExist) {
            return []; // Return empty - documents need to be embedded
        }
        
        // Build fallback filters without document_type
        $fallbackFilters = ['household_id' => $householdId];
        // Note: We don't add user_id in fallback to get broader results
        
        $documents = $this->vectorDbService->search(
            queryVector: $questionEmbedding,
            topK: $topK,
            filters: $fallbackFilters
        );
        
        // Filter by document type even in fallback
        return $this->filterService->filterDocuments($documents, $documentType, $userId);
    }

    private function validateDocumentTypes(array $documents, string $documentType, ?int $userId): array
    {
        $validated = [];
        $wrongTypes = [];
        
        foreach ($documents as $doc) {
            $docType = $doc['metadata']['document_type'] ?? null;
            
            if ($docType !== $documentType) {
                $wrongTypes[] = $docType;
                continue;
            }
            
            // Special handling for goals
            if ($documentType === DocumentType::GOAL && $userId) {
                $docUserId = $doc['metadata']['user_id'] ?? null;
                if ($docUserId !== null && $docUserId != $userId) {
                    continue; // Skip goals belonging to other users
                }
            }
            
            $validated[] = $doc;
        }
        
        if (!empty($wrongTypes)) {
            return []; // Better to return empty than wrong results
        }
        
        return $validated;
    }

    private function checkDocumentsExistInDb(string $documentType, int $householdId, ?int $userId): bool
    {
        try {
            return match($documentType) {
                DocumentType::RECIPE => \App\Models\Recipe::where('household_id', $householdId)->exists(),
                DocumentType::PANTRY_ITEM => \App\Models\PantryItem::where('household_id', $householdId)->exists(),
                DocumentType::HEALTH_LOG => $userId 
                    ? \App\Models\HealthLog::where('user_id', $userId)->exists()
                    : \App\Models\HealthLog::whereHas('user.householdMembers', function($q) use ($householdId) {
                        $q->where('household_id', $householdId);
                    })->exists(),
                DocumentType::GOAL => \App\Models\Goal::where(function($q) use ($householdId, $userId) {
                    $q->where('household_id', $householdId);
                    if ($userId) {
                        $q->orWhere('user_id', $userId);
                    }
                })->exists(),
                default => false,
            };
        } catch (\Exception $e) {
            return false;
        }
    }

    private function mapCitations(array $citationIds, array $documents): array
    {
        $mapped = [];

        foreach ($citationIds as $citation) {
            // Extract number from "doc1", "doc2", etc.
            if (preg_match('/doc(\d+)/i', $citation, $matches)) {
                $index = (int)$matches[1] - 1;
                
                if (isset($documents[$index])) {
                    $doc = $documents[$index];
                    $mapped[] = [
                        'document_id' => $doc['id'],
                        'source_id' => $doc['metadata']['source_id'] ?? null,
                        'source_type' => $doc['metadata']['document_type'] ?? null,
                        'score' => $doc['score'] ?? 0.0,
                    ];
                }
            }
        }

        return $mapped;
    }
}
