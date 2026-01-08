<?php

namespace Config;

class PromptSanitizer
{

    public static function sanitize(string $input): string
    {
        if (empty($input)) {
            return '';
        }

        // Remove common prompt injection patterns
        $patterns = [
            // Instruction override attempts (more comprehensive)
            '/ignore\s+(all\s+)?previous\s+instructions?/i',
            '/forget\s+(all\s+)?previous\s+instructions?/i',
            '/disregard\s+(all\s+)?previous\s+instructions?/i',
            '/override\s+(all\s+)?previous\s+instructions?/i',
            '/forget\s+everything\s+above/i',
            '/ignore\s+everything\s+above/i',
            '/forget\s+all\s+rules/i',
            '/ignore\s+all\s+rules/i',
            '/disregard\s+all\s+rules/i',
            
            // Verb forms with "previous instructions"
            '/ignores\s+(all\s+)?previous\s+instructions?/i',
            '/forgets\s+(all\s+)?previous\s+instructions?/i',
            '/disregards\s+(all\s+)?previous\s+instructions?/i',
            
            // Standalone dangerous words in context (when they appear with "previous", "instructions", "rules")
            '/(?<=\s|^)(ignore|forget|disregard|override)\s+(previous|all|everything)/i',
            
            // Role manipulation (more comprehensive)
            '/you\s+are\s+now\s+/i',
            '/act\s+as\s+/i',
            '/pretend\s+you\s+are/i',
            '/you\s+are\s+a\s+different/i',
            '/system\s*:/i',
            '/assistant\s*:/i',
            '/user\s*:/i',
            
            // Special tokens and delimiters
            '/\[INST\]/i',
            '/\[\/INST\]/i',
            '/<\|.*?\|>/',
            '/```/',
            '/---/',
            
            // JSON manipulation attempts
            '/return\s+this\s+json/i',
            '/output\s+this\s+json/i',
            '/respond\s+with\s+this/i',
            
            // XSS attempts
            '/<script[^>]*>.*?<\/script>/is',
            '/<iframe[^>]*>.*?<\/iframe>/is',
            '/javascript:/i',
            '/on\w+\s*=/i', // onclick=, onerror=, etc.
        ];
        
        $sanitized = preg_replace($patterns, '', $input);
        
        // Remove any remaining HTML tags
        $sanitized = strip_tags($sanitized);
        
        // Escape quotes that could break JSON structure
        $sanitized = str_replace(['"', "'"], ['\\"', "\\'"], $sanitized);
        
        // Normalize newlines (replace with space to prevent injection)
        $sanitized = preg_replace('/[\r\n]+/', ' ', $sanitized);
        
        // Remove excessive whitespace
        $sanitized = preg_replace('/\s+/', ' ', $sanitized);
        
        // Limit length to prevent token exhaustion attacks
        $sanitized = mb_substr($sanitized, 0, 2000);
        
        // Trim whitespace
        $sanitized = trim($sanitized);
        
        return $sanitized;
    }

    public static function sanitizeArray(array $items): array
    {
        return array_map([self::class, 'sanitize'], $items);
    }
    

    public static function sanitizeForPrompt(string $value): string
    {
        $sanitized = self::sanitize($value);
        
        // Additional protection: wrap in clear delimiters
        // This helps the LLM distinguish user input from instructions
        return $sanitized;
    }
    

    public static function sanitizeNumeric($value): float
    {
        return (float) filter_var($value, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
    

    public static function sanitizeDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }
        
        // Validate date format
        $timestamp = strtotime($date);
        if ($timestamp === false) {
            return null;
        }
        
        return date('Y-m-d', $timestamp);
    }
}

