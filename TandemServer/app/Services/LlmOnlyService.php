<?php

namespace App\Services;

use App\Constants\LlmConstants;
use OpenAI\Laravel\Facades\OpenAI;
use Exception;
class LlmOnlyService
{
    public function generate(string $systemPrompt,string $userPrompt,array $options = []): array {
        return retry(LlmConstants::MAX_RETRIES, function () use ($systemPrompt, $userPrompt, $options) {

            $requestOptions = $this->buildRequestOptions($systemPrompt, $userPrompt, $options);
            $response = OpenAI::chat()->create($requestOptions);


            if (!isset($response->choices[0]->message->content)) {
                throw new Exception('Invalid OpenAI response structure');
            }

            return [
                'content' => $response->choices[0]->message->content,
                'usage' => [
                    'prompt_tokens' => $response->usage->promptTokens ?? 0,
                    'completion_tokens' => $response->usage->completionTokens ?? 0,
                    'total_tokens' => $response->usage->totalTokens ?? 0,
                ],
            ];
        }, LlmConstants::RETRY_DELAY_MS);
    }

    public function generateJson(string $systemPrompt,string $userPrompt,array $options = []): array {
    
        $jsonOptions = array_merge($options, [
            'response_format' => ['type' => 'json_object'],
        ]);

        $result = $this->generate($systemPrompt, $userPrompt, $jsonOptions);
        $json = json_decode($result['content'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('LLM returned invalid JSON: ' . json_last_error_msg());
        }

        return $json;
    }

    private function buildRequestOptions(string $systemPrompt, string $userPrompt, array $options): array
    {
        // Protect critical keys from being overridden by user options
        $protectedKeys = ['messages'];
        $userOptions = array_diff_key($options, array_flip($protectedKeys));

        return array_merge([
            'model' => $options['model'] ?? config('services.openai.model', LlmConstants::DEFAULT_MODEL),
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'temperature' => $options['temperature'] ?? LlmConstants::DEFAULT_TEMPERATURE,
        ], $userOptions);
    }
}