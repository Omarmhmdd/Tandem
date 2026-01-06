<?php

namespace App\Data;

class RecipeInstructionData
{

    public static function prepare(array $instruction): array
    {
        return [
            'step_number' => $instruction['step_number'],
            'instruction' => $instruction['instruction'],
        ];
    }

    public static function prepareMany(array $instructions): array
    {
        return array_map([self::class, 'prepare'], $instructions);
    }
}