<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class WeeklySummaryValidator
{
    public static function validateAndSanitize(array $data): array
    {
        $validator = Validator::make($data, [
            'highlight' => 'nullable|string|max:500',
            'bullets' => 'nullable|array',
            'bullets.*' => 'string|max:255',
            'action' => 'nullable|string|max:255',
            'tone' => 'nullable|string|in:encouraging,supportive,motivational',
        ]);

        $validated = $validator->validated();

        $bullets = $validated['bullets'] ?? [];
        if (!is_array($bullets)) {
            $bullets = [];
        }

        return [
            'highlight' => isset($validated['highlight']) ? trim($validated['highlight']) : null,
            'bullets' => array_map('trim', array_filter($bullets, fn($b) => !empty(trim($b)))),
            'action' => isset($validated['action']) ? trim($validated['action']) : null,
        ];
    }
}