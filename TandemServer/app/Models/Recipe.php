<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\RecipeIngredientPantryLink;

class Recipe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id',
        'name',
        'description',
        'prep_time',
        'cook_time',
        'servings',
        'difficulty',
        'rating',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function ingredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function instructions()
    {
        return $this->hasMany(RecipeInstruction::class)->orderBy('step_number');
    }

    public function tags()
    {
        return $this->hasMany(RecipeTag::class);
    }
    public function mealPlans()
    {
        return $this->hasMany(MealPlan::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }


    public function getTotalTimeAttribute()
    {
        return $this->prep_time + $this->cook_time;
    }


    public function getPantryLinkedAttribute(): bool
    {

        return RecipeIngredientPantryLink::whereHas('recipeIngredient', function ($query) {
            $query->where('recipe_id', $this->id);
        })->exists();
    }

    public static function rules()
    {
        return [
            'household_id' => 'required|exists:households,id',
            'name' => 'required|string|max:255|min:1',
            'prep_time' => 'required|integer|min:0|max:1440',
            'cook_time' => 'required|integer|min:0|max:1440',
            'servings' => 'required|integer|min:1',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'rating' => 'nullable|numeric|min:0|max:5',
        ];
    }
}
