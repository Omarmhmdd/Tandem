<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MoodAnnotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'date' => $this->date->format('Y-m-d'),
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
        ];
    }
}


