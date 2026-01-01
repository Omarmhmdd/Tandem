<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DateNightSuggestion extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'household_id',
        'suggested_at',
        'meal',
        'activity',
        'treat',
        'total_cost',
        'reasoning',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'suggested_at' => 'date',
            'meal' => 'array',
            'activity' => 'array',
            'treat' => 'array',
            'total_cost' => 'decimal:2',
            'status' => 'string',
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
            'suggested_at' => 'required|date|after_or_equal:today',
            'meal' => 'required|array',
            'activity' => 'required|array',
            'treat' => 'required|array',
            'total_cost' => 'required|numeric|min:0',
            'reasoning' => 'required|string',
        ];
    }
}

