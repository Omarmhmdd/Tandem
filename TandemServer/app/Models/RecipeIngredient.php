<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeIngredient extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'recipe_id',
        'ingredient_name',
        'quantity',
        'unit',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function pantryLinks()
    {
        return $this->hasMany(RecipeIngredientPantryLink::class);
    }

    public static function rules()
    {
        return [
            'recipe_id' => 'required|exists:recipes,id',
            'ingredient_name' => 'required|string|max:255',
            'quantity' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'order' => 'required|integer|min:0',
        ];
    }
}

