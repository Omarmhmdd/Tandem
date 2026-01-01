<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeeklySummary extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'household_id',
        'week_start',
        'highlight',
        'bullets',
        'action',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'week_start' => 'date',
            'bullets' => 'array',
            'generated_at' => 'datetime',
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
            'week_start' => 'required|date',
            'highlight' => 'required|string|max:500|min:1',
            'bullets' => 'required|array|size:3',
            'action' => 'required|string',
        ];
    }
}

