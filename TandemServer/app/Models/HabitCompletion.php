<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HabitCompletion extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'habit_id',
        'date',
        'completed',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'completed' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function habit()
    {
        return $this->belongsTo(Habit::class);
    }

    public static function rules()
    {
        return [
            'habit_id' => 'required|exists:habits,id',
            'date' => 'required|date',
            'completed' => 'required|boolean',
        ];
    }
}

