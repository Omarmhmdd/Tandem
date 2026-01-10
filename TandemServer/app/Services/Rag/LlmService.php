<?php

namespace App\Services\Rag;

use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Log;
use config\PromptSanitizer;
use Exception;
class LlmService
{
    public function generateWithContext(string $question,array $contextDocuments,array $systemPrompt = [],array $userInfo = []): array {
        try {
            // Build context from documents
            $context = $this->buildContext($contextDocuments);

            // Build full prompt
            $messages = [
                [
                    'role' => 'system',
                    'content' => $this->buildSystemPrompt($systemPrompt, $userInfo),
                ],
                [
                    'role' => 'user',
                    'content' => $this->buildUserPrompt($question, $context),
                ],
            ];

            // Call OpenAI
            $response = OpenAI::chat()->create([
                'model' => config('services.openai.model', 'gpt-3.5-turbo'),
                'messages' => $messages,
                'temperature' => 0.7,
                'response_format' => ['type' => 'json_object'], // Force JSON
            ]);

            $content = $response->choices[0]->message->content;

            // Parse JSON response
            $result = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'answer' => $content,
                    'citations' => [],
                    'actions' => [],
                ];
            }

            return [
                'answer' => $result['answer'] ?? $content,
                'citations' => $result['citations'] ?? [],
                'actions' => $result['actions'] ?? [],
            ];
        } catch (Exception $e) {
            Log::error('LLM generation failed', [
                'error' => $e->getMessage(),
            ]);
            
            // Fallback response
            return [
                'answer' => 'I apologize, but I encountered an error processing your question. Please try again.',
                'citations' => [],
                'actions' => [],
            ];
        }
    }

    private function buildSystemPrompt(array $custom = [], array $userInfo = []): string
    {
        $userName = $userInfo['name'] ?? null;
        $sanitizedName = $userName ? PromptSanitizer::sanitizeForPrompt($userName) : null;
        $userNameText = $sanitizedName ? "The user's name is {$sanitizedName}. " : '';
        
        $default = "You are an AI Wellness Coach for a couple. {$userNameText}Answer questions based on provided context from their health logs, pantry, recipes, and goals. Use their name when appropriate and personalize your responses. Return JSON with 'answer', 'citations', and 'actions' fields. Citations should reference document IDs like [doc1], [doc2].";

        return $custom['system'] ?? $default;
    }

    private function buildUserPrompt(string $question, string $context): string
    {
        $sanitizedQuestion = PromptSanitizer::sanitizeForPrompt($question);
        
        return <<<PROMPT
Context Documents:
{$context}

User Question: {$sanitizedQuestion}

Instructions:
1. Answer using ONLY information from the context above
2. If information is not in context, say so clearly
3. Include specific numbers, dates, or examples when relevant
4. Cite sources using document IDs: [doc1], [doc2], etc.
5. Suggest actionable buttons when appropriate (e.g., "View Recipe", "Add to Meal Plan")

Return JSON in this format:
{
  "answer": "Your detailed answer here",
  "citations": ["doc1", "doc2"],
  "actions": [
    {
      "label": "View Recipe",
      "type": "navigate",
      "target": "/recipes/123"
    }
  ]
}
PROMPT;
    }

    private function buildContext(array $documents): string
    {
        if (empty($documents)) {
            return "No relevant documents found.";
        }

        $context = '';
        foreach ($documents as $index => $doc) {
            $docNum = $index + 1;
            $context .= sprintf(
                "[doc%d] %s\n",
                $docNum,
                $doc['text'] ?? ''
            );
        }

        return trim($context);
    }
}

