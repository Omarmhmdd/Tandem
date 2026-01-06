<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchMeal extends Model
{
    use HasFactory;

    protected $fillable = [
        'meal_plan_id',
        'invited_by_user_id',
        'invited_to_user_id',
        'status',
        'invite_sent_at',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'invite_sent_at' => 'datetime',
            'responded_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function mealPlan()
    {
        return $this->belongsTo(MealPlan::class);
    }

    public function invitedBy()
    {
        return $this->belongsTo(User::class, 'invited_by_user_id');
    }

    public function invitedTo()
    {
        return $this->belongsTo(User::class, 'invited_to_user_id');
    }
    public static function rules()
    {
        return [
            'meal_plan_id' => 'required|exists:meal_plans,id',
            'invited_by_user_id' => 'required|exists:users,id',
            'invited_to_user_id' => 'required|exists:users,id|different:invited_by_user_id',
            'status' => 'required|in:pending,accepted,declined,completed',
        ];
    }
}

