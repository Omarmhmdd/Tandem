<?php

namespace App\Constants;

class AutoOrderConstants
{
    public const DEFAULT_UNIT = 'pieces';
    public const DEFAULT_CATEGORY = 'Other';
    public const DEFAULT_LOCATION = 'Pantry';
    public const DEFAULT_QUANTITY = 1.0;
    public const MIN_QUANTITY = 0.01;
    // Default expiry days: items ordered today expire in 7 days by default
    public const DEFAULT_EXPIRY_DAYS = 7;
}