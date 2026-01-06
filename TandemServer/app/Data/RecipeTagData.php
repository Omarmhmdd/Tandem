<?php

namespace App\Data;

class RecipeTagData
{

    public static function prepare(string $tag): string
    {
        return $tag;
    }


    public static function prepareMany(array $tags): array
    {
        return $tags;
    }
}