<?php

namespace App\Services\Rag;

class RagQueryContext
{
    public const DEFAULT_TOP_K = 15;

    public function __construct(public readonly int $householdId,public readonly ?int $userId = null,public readonly int $topK = self::DEFAULT_TOP_K,public readonly array $userInfo = [] ){}

    public function getUserName(): ?string
    {
        return $this->userInfo['name'] ?? null;
    }

    public function getUserEmail(): ?string
    {
        return $this->userInfo['email'] ?? null;
    }
}

