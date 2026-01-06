<?php

namespace App\Constants;

class LlmConstants
{
    // Retry configuration
    public const MAX_RETRIES = 3;
    public const RETRY_DELAY_MS = 1000;

    // Default model settings
    public const DEFAULT_MODEL = 'gpt-3.5-turbo';
    public const DEFAULT_TEMPERATURE = 0.7;

    // Temperature presets for different use cases
    public const TEMPERATURE_PARSING = 0.3;
    public const TEMPERATURE_CALCULATION = 0.5;
    public const TEMPERATURE_ANALYSIS = 0.7;
    public const TEMPERATURE_CREATIVE = 0.8;
    public const TEMPERATURE_VARIETY = 1.0;
    public const MOOD_ANNOTATION_DAYS = 30;

    public const DATE_NIGHT_MIN_BUDGET = 10.0;
    public const DATE_NIGHT_DEFAULT_BUDGET = 50.0;
    public const DATE_NIGHT_FALLBACK_BUDGET = 100.0;
}