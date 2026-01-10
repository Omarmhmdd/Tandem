<?php

namespace App\Services\Rag;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\Response;

class VectorDbService
{
    private string $url;
    private ?string $apiKey;
    private string $collection;
    private QdrantClient $client;

    public function __construct()
    {
        $this->url = rtrim(config('services.qdrant.url', 'http://localhost:6333'), '/');
        $this->apiKey = config('services.qdrant.api_key');
        $this->collection = config('services.qdrant.collection', 'wellness_documents');
        $this->client = new QdrantClient($this->getHeaders());
    }

    public function initializeCollection(): void
    {
        try {
            $checkResponse = $this->client->get("{$this->url}/collections/{$this->collection}");

            if ($checkResponse->successful()) {
                $this->createIndexes();
                return;
            }

            $embeddingDimension = config('services.openai.embedding_dimension', 1536);
            $createResponse = $this->client->put("{$this->url}/collections/{$this->collection}", [
                'vectors' => [
                    'size' => $embeddingDimension,
                    'distance' => 'Cosine',
                ],
            ]);

            if (!$createResponse->successful()) {
                $errorBody = $createResponse->body();
                throw new \Exception("Failed to create collection: " . $errorBody);
            }
            
            $this->createIndexes();
        } catch (\Exception $e) {
            Log::error('Failed to initialize Qdrant collection', [
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function createIndexes(): void
    {
        $indexes = [
            'household_id' => 'integer',
            'user_id' => 'integer',
            'document_type' => 'keyword',
            'source_id' => 'integer',
        ];

        foreach ($indexes as $fieldName => $fieldType) {
            $this->createIndex($fieldName, $fieldType);
        }
    }

    private function createIndex(string $fieldName, string $fieldType): void
    {
        try {
            $response = $this->client->put("{$this->url}/collections/{$this->collection}/index", [
                'field_name' => $fieldName,
                'field_schema' => [
                    'type' => $fieldType,
                ],
            ]);

            if (!$response->successful()) {
                $body = $response->body();
                if (!str_contains($body, 'already exists') && !str_contains($body, 'duplicate')) {
                    // Index creation failed for non-duplicate reason - silently continue
                }
            }
        } catch (\Exception $e) {
            // Silently continue on index creation errors
        }
    }

    public function upsertPoint(string $pointId,array $vector,array $metadata,string $text): void {
        try {
            $numericId = $this->stringToIntId($pointId);
            
            $payload = array_merge($metadata, [
                'text' => $text,
                'original_id' => $pointId,
            ]);

            $response = $this->client->put("{$this->url}/collections/{$this->collection}/points", [
                'points' => [
                    [
                        'id' => $numericId,
                        'vector' => $vector,
                        'payload' => $payload,
                    ],
                ],
            ]);

            if (!$response->successful()) {
                throw new \Exception("Failed to upsert point: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Failed to upsert point to Qdrant', [
                'point_id' => $pointId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function stringToIntId(string $stringId): int
    {
        // Use SHA-256 hash for better collision resistance
        // Take first 8 bytes and convert to integer
        $hash = hash('sha256', $stringId, true);
        $intValue = unpack('N', substr($hash, 0, 4))[1];
        // Convert to positive integer (Qdrant requires unsigned)
        return abs($intValue) % PHP_INT_MAX;
    }

    public function search(array $queryVector,int $topK = 5,array $filters = []): array {
        try {
            $requestBody = $this->buildSearchRequestBody($queryVector, $topK, $filters);
            $response = $this->client->post("{$this->url}/collections/{$this->collection}/points/search", $requestBody);

            if (!$response->successful()) {
                $response = $this->handleSearchError($response, $requestBody, $filters);
            }

            return $this->formatSearchResults($response->json());
        } catch (\Exception $e) {
            Log::error('Failed to search Qdrant', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    private function buildSearchRequestBody(array $queryVector, int $topK, array $filters): array
    {
        $requestBody = [
            'vector' => $queryVector,
            'limit' => $topK,
            'with_payload' => true,
            'with_vector' => false,
        ];

        if (!empty($filters)) {
            $requestBody['filter'] = [
                'must' => $this->buildFilterMust($filters),
            ];
        }

        return $requestBody;
    }

    private function buildFilterMust(array $filters): array
    {
        $must = [];
        foreach ($filters as $key => $value) {
            $must[] = [
                'key' => $key,
                'match' => ['value' => $value],
            ];
        }
        return $must;
    }

    private function handleSearchError(Response $response, array $requestBody, array $filters): Response
    {
        $errorBody = $response->body();
        $isIndexError = str_contains($errorBody, 'Index required but not found');
        
        if ($isIndexError && isset($filters['document_type'])) {
            $retryFilters = $filters;
            unset($retryFilters['document_type']);
            
            if (!empty($retryFilters)) {
                $requestBody['filter'] = ['must' => $this->buildFilterMust($retryFilters)];
            } else {
                unset($requestBody['filter']);
            }
            
            $response = $this->client->post("{$this->url}/collections/{$this->collection}/points/search", $requestBody);
            
            if (!$response->successful()) {
                throw new \Exception("Failed to search Qdrant: " . $response->body());
            }
        } else {
            throw new \Exception("Failed to search Qdrant: " . $errorBody);
        }

        return $response;
    }

    private function formatSearchResults(array $results): array
    {
        return array_map(function ($result) {
            $payload = $result['payload'] ?? [];
            $text = $payload['text'] ?? '';
            unset($payload['text']);

            return [
                'id' => $result['id'],
                'score' => $result['score'] ?? 0.0,
                'text' => $text,
                'metadata' => $payload,
            ];
        }, $results['result'] ?? []);
    }

    public function deletePoint(string $pointId): void
    {
        try {
            $numericId = $this->stringToIntId($pointId);
            
            $response = $this->client->post("{$this->url}/collections/{$this->collection}/points/delete", [
                'points' => [$numericId],
            ]);

            // Silently fail on delete - not critical
        } catch (\Exception $e) {
            // Silently fail on delete errors
        }
    }

    public function deleteByFilter(array $filters): void
    {
        try {
            $must = [];
            foreach ($filters as $key => $value) {
                $must[] = [
                    'key' => $key,
                    'match' => ['value' => $value],
                ];
            }

            $response = $this->client->post("{$this->url}/collections/{$this->collection}/points/delete", [
                'filter' => [
                    'must' => $must,
                ],
            ]);

            // Silently fail on delete - not critical
        } catch (\Exception $e) {
            // Silently fail on delete errors
        }
    }

    private function getHeaders(): array
    {
        $headers = [
            'Content-Type' => 'application/json',
        ];

        if ($this->apiKey) {
            $headers['api-key'] = $this->apiKey;
        }

        return $headers;
    }
}

