<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MealPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'date' => $this->date->format('Y-m-d'),
            'meal_type' => $this->meal_type,
            'name' => $this->name,
            'recipe_id' => $this->recipe_id,
            'is_match_meal' => $this->is_match_meal,
            'recipe' => new RecipeResource($this->whenLoaded('recipe')),
            'match_meal' => new MatchMealResource($this->whenLoaded('matchMeal')),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}


