<?php

namespace App\Services;

use App\Models\AiCoachConversation;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Services\Rag\RagService;
use App\Services\Rag\RagQueryContext;
use Illuminate\Support\Facades\Log;

class AiCoachService
{
    use VerifiesResourceOwnership;

    public function __construct(
        private RagService $ragService
    ) {}

    public function query(string $question): array
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();

        try {
            $context = new RagQueryContext(
                householdId: $householdMember->household_id,
                userId: $user->id,
                topK: RagQueryContext::DEFAULT_TOP_K,
                userInfo: [
                    'name' => trim($user->first_name . ' ' . $user->last_name),
                    'email' => $user->email,
                ]
            );

            $result = $this->ragService->query($question, $context);

            $conversation = AiCoachConversation::create([
                'user_id' => $user->id,
                'household_id' => $householdMember->household_id,
                'question' => $question,
                'answer' => $result['answer'],
                'citations' => $result['citations'],
                'actions' => $result['actions'],
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('RAG query failed', [
                'error' => $e->getMessage(),
                'question' => $question,
            ]);

            $answer = "I apologize, but I encountered an error processing your question. Please try again.";

            $conversation = AiCoachConversation::create([
                'user_id' => $user->id,
                'household_id' => $householdMember->household_id,
                'question' => $question,
                'answer' => $answer,
                'citations' => [],
                'actions' => [],
            ]);

            return [
                'answer' => $answer,
                'citations' => [],
                'actions' => [],
            ];
        }
    }
}