<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DateNightSuggestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'suggested_at' => $this->suggested_at->format('Y-m-d'),
            'meal' => $this->meal,
            'activity' => $this->activity,
            'treat' => $this->treat,
            'total_cost' => (float) $this->total_cost,
            'reasoning' => $this->reasoning,
            'status' => $this->status ?? 'pending',
        ];
    }
}


