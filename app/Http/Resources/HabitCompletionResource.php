<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HabitCompletionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'habit_id' => $this->habit_id,
            'date' => $this->date->format('Y-m-d'),
            'completed' => $this->completed,
            'notes' => $this->notes,
        ];
    }
}


