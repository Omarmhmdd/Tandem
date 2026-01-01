<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeIngredientPantryLink extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'recipe_ingredient_id',
        'pantry_item_id',
        'quantity_used',
    ];

    protected function casts(): array
    {
        return [
            'quantity_used' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function recipeIngredient()
    {
        return $this->belongsTo(RecipeIngredient::class);
    }

    public function pantryItem()
    {
        return $this->belongsTo(PantryItem::class);
    }

    public static function rules()
    {
        return [
            'recipe_ingredient_id' => 'required|exists:recipe_ingredients,id',
            'pantry_item_id' => 'required|exists:pantry_items,id',
            'quantity_used' => 'nullable|numeric|min:0',
        ];
    }
}

