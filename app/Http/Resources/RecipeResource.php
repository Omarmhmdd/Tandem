<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'name' => $this->name,
            'description' => $this->description,
            'prep_time' => $this->prep_time,
            'cook_time' => $this->cook_time,
            'total_time' => $this->total_time,
            'servings' => $this->servings,
            'difficulty' => $this->difficulty,
            'rating' => $this->rating ? (float) $this->rating : null,
            'ingredients' => RecipeIngredientResource::collection($this->whenLoaded('ingredients')),
            'instructions' => RecipeInstructionResource::collection($this->whenLoaded('instructions')),
            'tags' => RecipeTagResource::collection($this->whenLoaded('tags')),
            'pantry_linked' => $this->pantry_linked,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


