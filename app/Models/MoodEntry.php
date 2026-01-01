<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoodEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'time',
        'mood',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getTimeAttribute($value)
    {
        return $value;
    }


    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public static function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date|before_or_equal:today',
            'time' => 'required',
            'mood' => 'required|in:happy,calm,tired,anxious,sad,energized,neutral',
        ];
    }
}

