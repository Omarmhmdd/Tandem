<?php

namespace App\Data;

class AutoOrderResponseData
{
    public static function prepare( string $orderId, string $partnerId, int $itemsCount): array {
        return [
            'orderId' => $orderId,
            'status' => 'pending',
            'partnerId' => $partnerId,
            'itemsCount' => $itemsCount,
            'message' => 'Order submitted successfully. Items have been added to your pantry.',
        ];
    }
}