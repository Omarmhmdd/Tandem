<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HealthLog extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'date',
        'time',
        'activities',
        'food',
        'sleep_hours',
        'bedtime',
        'wake_time',
        'mood',
        'notes',
        'original_text',
        'confidence',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'activities' => 'array',
            'food' => 'array',
            'sleep_hours' => 'decimal:2',
            'confidence' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }


    public function getTimeAttribute($value)
    {
        return $value; 
    }

    public function getBedtimeAttribute($value)
    {
        return $value; 
    }

    public function getWakeTimeAttribute($value)
    {
        return $value; 
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date|before_or_equal:today',
            'time' => 'required',
            'activities' => 'required|array',
            'food' => 'required|array',
            'sleep_hours' => 'nullable|numeric|min:0|max:24',
            'mood' => 'required|in:happy,calm,tired,anxious,sad,energized,neutral',
            'confidence' => 'required|numeric|min:0|max:1',
        ];
    }
}
