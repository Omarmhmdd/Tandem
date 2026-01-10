<?php

namespace App\Services\Rag;

class ChunkingService
{
    private const CHUNK_SIZE = 500; // characters (not tokens - simplified approach)

    public function chunk(string $text, string $type = 'default'): array
    {
        // For health logs: usually short, keep as single chunk
        if ($type === DocumentType::HEALTH_LOG || $type === DocumentType::PANTRY_ITEM || $type === DocumentType::GOAL) {
            return [trim($text)];
        }

        // For recipes: split by sections
        if ($type === DocumentType::RECIPE) {
            return $this->chunkRecipe($text);
        }

        // Default: split by sentences
        return $this->chunkBySentences($text);
    }

    private function chunkRecipe(string $text): array
    {
        // Split by double newlines (sections)
        $parts = preg_split('/\n\s*\n/', $text);
        $chunks = [];

        foreach ($parts as $part) {
            $trimmed = trim($part);
            if (!empty($trimmed)) {
                $chunks[] = $trimmed;
            }
        }

        // If no sections found, try splitting by single newline
        if (count($chunks) === 1) {
            $lines = explode("\n", $text);
            $currentChunk = '';
            
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed)) {
                    continue;
                }

                if (strlen($currentChunk) + strlen($trimmed) > self::CHUNK_SIZE) {
                    if (!empty($currentChunk)) {
                        $chunks[] = $currentChunk;
                    }
                    $currentChunk = $trimmed;
                } else {
                    $currentChunk .= ($currentChunk ? "\n" : '') . $trimmed;
                }
            }

            if (!empty($currentChunk)) {
                $chunks[] = $currentChunk;
            }
        }

        return $chunks;
    }

    private function chunkBySentences(string $text): array
    {
        // Split by sentence endings
        $sentences = preg_split('/(?<=[.!?])\s+/', $text);
        $chunks = [];
        $currentChunk = '';

        foreach ($sentences as $sentence) {
            $trimmed = trim($sentence);
            if (empty($trimmed)) {
                continue;
            }

            // Check character count (simplified - not token-based)
            $newChunkLength = strlen($currentChunk . ' ' . $trimmed);

            if ($newChunkLength > self::CHUNK_SIZE && !empty($currentChunk)) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $trimmed;
            } else {
                $currentChunk .= ($currentChunk ? ' ' : '') . $trimmed;
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }

        return empty($chunks) ? [trim($text)] : $chunks;
    }
}

