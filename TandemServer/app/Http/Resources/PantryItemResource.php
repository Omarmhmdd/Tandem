<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PantryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'name' => $this->name,
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'expiry_date' => $this->expiry_date?->format('Y-m-d'),
            'location' => $this->location,
            'category' => $this->category,
            'days_until_expiry' => $this->days_until_expiry,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


