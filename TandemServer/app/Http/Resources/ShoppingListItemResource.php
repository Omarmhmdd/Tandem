<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingListItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shopping_list_id' => $this->shopping_list_id,
            'name' => $this->name,
            'quantity' => (float) $this->quantity,
            'unit' => $this->unit,
            'in_pantry' => $this->in_pantry,
            'pantry_item_id' => $this->pantry_item_id,
            'purchased' => $this->purchased,
            'pantry_item' => new PantryItemResource($this->whenLoaded('pantryItem')),
        ];
    }
}

