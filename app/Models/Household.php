<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Household extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'invite_code',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }


    public function members()
    {
        return $this->hasMany(HouseholdMember::class);
    }

    public function primaryMember()
    {
        return $this->hasOne(HouseholdMember::class)->where('role', 'primary');
    }

    public function partner()
    {
        return $this->hasOne(HouseholdMember::class)->where('role', 'partner');
    }
    public function pantryItems()
    {
        return $this->hasMany(PantryItem::class);
    }

    public function recipes()
    {
        return $this->hasMany(Recipe::class);
    }

    public function mealPlans()
    {
        return $this->hasMany(MealPlan::class);
    }

    public function shoppingLists()
    {
        return $this->hasMany(ShoppingList::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function moodAnnotations()
    {
        return $this->hasMany(MoodAnnotation::class);
    }

    public function weeklySummaries()
    {
        return $this->hasMany(WeeklySummary::class);
    }

    public function aiCoachConversations()
    {
        return $this->hasMany(AiCoachConversation::class);
    }

    public function dateNightSuggestions()
    {
        return $this->hasMany(DateNightSuggestion::class);
    }
}





