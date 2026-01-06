<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeeklySummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'week_start' => $this->week_start->format('Y-m-d'),
            'highlight' => $this->highlight,
            'bullets' => $this->bullets,
            'action' => $this->action,
            'generated_at' => $this->generated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


