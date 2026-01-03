<?php

namespace App\Constants;

class AnalyticsConstants
{
    public const MOOD_VALUES = [
        'happy' => 5,
        'energized' => 5,
        'calm' => 4,
        'neutral' => 3,
        'tired' => 2,
        'anxious' => 2,
        'sad' => 1,
    ];

    public const DEFAULT_MOOD_VALUE = 3;

    public const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    public const MONTH_NAMES = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    public const PANTRY_WASTE_PERCENTAGE = 0.15;
    public const PANTRY_DONATED_PERCENTAGE = 0.10;
    
    // Mood Annotation
    public const MOOD_ANNOTATION_DAYS = 30;
}