<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HealthLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'date' => $this->date->format('Y-m-d'),
            'time' => $this->time,
            'activities' => $this->activities,
            'food' => $this->food,
            'sleep_hours' => $this->sleep_hours ? (float) $this->sleep_hours : null,
            'bedtime' => $this->bedtime,
            'wake_time' => $this->wake_time,
            'mood' => $this->mood,
            'notes' => $this->notes,
            'original_text' => $this->original_text,
            'confidence' => $this->confidence ? (float) $this->confidence : null,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


