<?php

namespace App\Data;

class PartnerData
{
    public static function entry(string $id, string $name, string $logo): array
    {
        return [
            'id' => $id,
            'name' => $name,
            'logo' => $logo,
        ];
    }

    public static function all(): array
    {
        return [
            self::entry('instacart', 'Instacart', 'https://logo.clearbit.com/instacart.com'),
            self::entry('amazon-fresh', 'Amazon Fresh', 'https://logo.clearbit.com/amazon.com'),
            self::entry('walmart-grocery', 'Walmart Grocery', 'https://logo.clearbit.com/walmart.com'),
            self::entry('shipt', 'Shipt', 'https://logo.clearbit.com/shipt.com'),
        ];
    }
}