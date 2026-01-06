<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MealPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id',
        'date',
        'meal_type',
        'name',
        'recipe_id',
        'is_match_meal',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_match_meal' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function matchMeal()
    {
        return $this->hasOne(MatchMeal::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public static function rules()
    {
        return [
            'household_id' => 'required|exists:households,id',
            'date' => 'required|date',
            'meal_type' => 'required|in:breakfast,lunch,dinner,snack',
            'recipe_id' => 'nullable|exists:recipes,id',
            'is_match_meal' => 'required|boolean',
        ];
    }
}

