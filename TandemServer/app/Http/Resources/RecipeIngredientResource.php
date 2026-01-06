<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecipeIngredientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'recipe_id' => $this->recipe_id,
            'ingredient_name' => $this->ingredient_name,
            'quantity' => $this->quantity ? (float) $this->quantity : null,
            'unit' => $this->unit,
            'order' => $this->order,
        ];
    }
}

