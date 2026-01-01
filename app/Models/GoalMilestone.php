<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoalMilestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'title',
        'completed',
        'deadline',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'completed' => 'boolean',
            'deadline' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public static function rules()
    {
        return [
            'goal_id' => 'required|exists:goals,id',
            'title' => 'required|string|max:255|min:1',
            'completed' => 'required|boolean',
            'deadline' => 'nullable|date',
            'order' => 'required|integer|min:0',
        ];
    }
}

