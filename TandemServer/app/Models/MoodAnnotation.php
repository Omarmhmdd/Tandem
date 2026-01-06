<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoodAnnotation extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'household_id',
        'date',
        'type',
        'title',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public static function rules()
    {
        return [
            'household_id' => 'required|exists:households,id',
            'date' => 'required|date',
            'type' => 'required|in:call,trip,purchase,event,pattern,anomaly,achievement',
            'title' => 'required|string|max:255|min:1',
        ];
    }
}

