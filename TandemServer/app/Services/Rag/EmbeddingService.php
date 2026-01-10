<?php

namespace App\Services\Rag;

use OpenAI\Laravel\Facades\OpenAI;
use Exception;
use InvalidArgumentException;
class EmbeddingService
{
    private const MAX_RETRIES = 3;
    private const RETRY_DELAY = 1000; // milliseconds

    public function embed(string $text): array
    {
        return retry(self::MAX_RETRIES, function () use ($text) {
            try {
                $response = OpenAI::embeddings()->create([
                    'model' => config('services.openai.embedding_model', 'text-embedding-3-small'),
                    'input' => $text,
                ]);

                $embedding = $response->embeddings[0]->embedding;
                $this->validateEmbedding($embedding);
                
                return $embedding;
            } catch (Exception $e) {
                throw $e;
            }
        }, self::RETRY_DELAY);
    }

    public function embedBatch(array $texts): array
    {
        if (empty($texts)) {
            return [];
        }

        return retry(self::MAX_RETRIES, function () use ($texts) {
            try {
                $response = OpenAI::embeddings()->create([
                    'model' => config('services.openai.embedding_model', 'text-embedding-3-small'),
                    'input' => $texts,
                ]);

                $embeddings = array_map(fn($embedding) => $embedding->embedding, $response->embeddings);
                
                // Validate all embeddings
                foreach ($embeddings as $embedding) {
                    $this->validateEmbedding($embedding);
                }
                
                return $embeddings;
            } catch (Exception $e) {
                throw $e;
            }
        }, self::RETRY_DELAY);
    }

    private function validateEmbedding(array $embedding): void
    {
        $expectedDimension = config('services.openai.embedding_dimension', 1536);
        $actualDimension = count($embedding);
        
        if ($actualDimension !== $expectedDimension) {
            throw new InvalidArgumentException("Invalid embedding dimension: expected {$expectedDimension}, got {$actualDimension}");
        }
    }
}

