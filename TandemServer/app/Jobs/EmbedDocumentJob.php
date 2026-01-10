<?php

namespace App\Jobs;

use App\Services\Rag\EmbeddingService;
use App\Services\Rag\VectorDbService;
use App\Services\Rag\DocumentFormatterService;
use App\Services\Rag\ChunkingService;
use App\Services\Rag\DocumentType;
use App\Models\HealthLog;
use App\Models\Recipe;
use App\Models\PantryItem;
use App\Models\Goal;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Exception;
class EmbedDocumentJob implements ShouldQueue
{
    use Dispatchable, Queueable, InteractsWithQueue, SerializesModels;

    public function __construct(
        private string $documentType, // 'health_log', 'recipe', 'pantry_item', 'goal'
        private int $sourceId,
        private int $householdId,
        private ?int $userId = null
    ) {}

    public function handle(EmbeddingService $embeddingService,VectorDbService $vectorDbService,DocumentFormatterService $formatter,ChunkingService $chunker ): void {
        try {
            // 1. Load document from database
            $document = $this->loadDocument();

            if (!$document) {
                return;
            }

            // 2. Format document to text
            $texts = $this->formatDocument($document, $formatter);

            if (empty($texts)) {
                return;
            }

            // 3. Chunk if needed
            $chunks = [];
            foreach ($texts as $text) {
                $chunked = $chunker->chunk($text, $this->documentType);
                $chunks = array_merge($chunks, $chunked);
            }

            if (empty($chunks)) {
                return;
            }

            // 4. Embed chunks (batch)
            $embeddings = $embeddingService->embedBatch($chunks);

            // 5. Delete old embeddings for this document (in case of update)
            $this->deleteOldEmbeddings($vectorDbService);

            // 6. Store in Qdrant
            foreach ($chunks as $index => $chunk) {
                $pointId = "{$this->documentType}_{$this->sourceId}_chunk{$index}";

                $metadata = [
                    'household_id' => $this->householdId,
                    'document_type' => $this->documentType,
                    'source_id' => $this->sourceId,
                    'chunk_index' => $index,
                ];

                // Add user_id for personal documents
                if ($this->userId) {
                    $metadata['user_id'] = $this->userId;
                }

                // Add date if available
                if (method_exists($document, 'getAttribute') && $document->getAttribute('date')) {
                    $metadata['date'] = $document->getAttribute('date');
                } elseif (method_exists($document, 'getAttribute') && $document->getAttribute('created_at')) {
                    $metadata['date'] = $document->getAttribute('created_at')->format('Y-m-d');
                }

                $vectorDbService->upsertPoint(
                    pointId: $pointId,
                    vector: $embeddings[$index],
                    metadata: $metadata,
                    text: $chunk
                );
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    private function loadDocument()
    {
        return match($this->documentType) {
            DocumentType::HEALTH_LOG => HealthLog::find($this->sourceId),
            DocumentType::RECIPE => Recipe::with(['ingredients', 'instructions'])->find($this->sourceId),
            DocumentType::PANTRY_ITEM => PantryItem::find($this->sourceId),
            DocumentType::GOAL => Goal::find($this->sourceId),
            default => null,
        };
    }


    private function formatDocument($document, DocumentFormatterService $formatter): array
    {
        return match($this->documentType) {
            DocumentType::HEALTH_LOG => [$formatter->formatHealthLog($document)],
            DocumentType::RECIPE => $formatter->formatRecipe($document),
            DocumentType::PANTRY_ITEM => [$formatter->formatPantryItem($document)],
            DocumentType::GOAL => [$formatter->formatGoal($document)],
            default => [],
        };
    }


    private function deleteOldEmbeddings(VectorDbService $vectorDbService): void
    {
        $filters = [
            'document_type' => $this->documentType, // Already validated constant
            'source_id' => $this->sourceId,
        ];

        $vectorDbService->deleteByFilter($filters);
    }
}

