<?php

namespace App\Validators;

use Illuminate\Support\Facades\Validator;

class HealthLogParsedDataValidator
{
    private const VALID_MOODS = ['happy', 'calm', 'tired', 'anxious', 'sad', 'energized', 'neutral'];
    private const DEFAULT_COMPLEMENT = 'Thanks for logging your day! Keep tracking to see your progress.';

    public static function validateAndSanitize(array $data): array
    {
        $validator = Validator::make($data, [
            'activities' => 'nullable|array',
            'activities.*' => 'string|max:255',
            'food' => 'nullable|array',
            'food.*' => 'string|max:255',
            'sleep_hours' => 'nullable|numeric|min:0|max:24',
            'bedtime' => 'nullable|regex:/^\d{2}:\d{2}$/',
            'wake_time' => 'nullable|regex:/^\d{2}:\d{2}$/',
            'mood' => 'nullable|in:' . implode(',', self::VALID_MOODS),
            'notes' => 'nullable|string',
            'confidence' => 'nullable|numeric|min:0|max:1',
            'complement' => 'nullable|string',
        ]);

        $validated = $validator->validated();

        $notes = self::filterGibberish($validated['notes'] ?? '');

        return [
            'activities' => self::sanitizeArray($validated['activities'] ?? []),
            'food' => self::sanitizeArray($validated['food'] ?? []),
            'sleep_hours' => isset($validated['sleep_hours']) 
                ? max(0, min(24, (float) $validated['sleep_hours']))
                : null,
            'bedtime' => $validated['bedtime'] ?? null,
            'wake_time' => $validated['wake_time'] ?? null,
            'mood' => $validated['mood'] ?? 'neutral',
            'notes' => $notes,
            'confidence' => isset($validated['confidence'])
                ? max(0.0, min(1.0, (float) $validated['confidence']))
                : 0.5,
            'complement' => trim($validated['complement'] ?? self::DEFAULT_COMPLEMENT),
        ];
    }


    public static function filterGibberish(string $text): string
    {
        if (empty($text)) {
            return '';
        }

        $text = trim($text);
        
        if (self::isGibberish($text)) {
            return '';
        }

        $parts = preg_split('/[\s,;.]+/', $text);
        $meaningfulParts = [];

        foreach ($parts as $part) {
            $part = trim($part);
            if (!empty($part) && !self::isGibberish($part)) {
                $meaningfulParts[] = $part;
            }
        }

        return implode(' ', $meaningfulParts);
    }
    private static function isGibberish(string $text): bool
    {
        if (empty($text) || strlen($text) < 3) {
            return false;
        }

        $keyboardPatterns = [
            '/^[qwertyuiop]+$/i',
            '/^[asdfghjkl]+$/i',
            '/^[zxcvbnm]+$/i',
            '/^[qwerty]+$/i',
            '/^[asdf]+$/i',
        ];

        foreach ($keyboardPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }


        $charCounts = count_chars(strtolower($text), 1);
        $maxCharCount = max($charCounts);
        $textLength = strlen($text);
        
        if ($maxCharCount / $textLength > 0.4 && $textLength > 5) {
            return true;
        }

        if (strlen($text) > 15 && !preg_match('/\s/', $text)) {
            // Check if it contains mostly consonants or random patterns
            $consonantRatio = preg_match_all('/[bcdfghjklmnpqrstvwxyz]/i', $text) / strlen($text);
            if ($consonantRatio > 0.7) {
                return true;
            }
        }


        $vowelCount = preg_match_all('/[aeiou]/i', $text);
        $textLength = strlen($text);
        if ($textLength > 20 && $vowelCount / $textLength < 0.15) {
            return true;
        }

        return false;
    }

    private static function sanitizeArray(?array $items): array
    {
        if (!is_array($items)) {
            return [];
        }

        return array_values(
            array_filter(
                array_map('trim', $items),
                fn($item) => is_string($item) && !empty($item)
            )
        );
    }
}