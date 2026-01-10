<?php

namespace App\Services\Rag;

class DocumentType
{
    public const RECIPE = 'recipe';
    public const HEALTH_LOG = 'health_log';
    public const PANTRY_ITEM = 'pantry_item';
    public const GOAL = 'goal';

    public static function all(): array
    {
        return [
            self::RECIPE,
            self::HEALTH_LOG,
            self::PANTRY_ITEM,
            self::GOAL,
        ];
    }

    public static function isValid(string $type): bool
    {
        return in_array($type, self::all(), true);
    }
}

