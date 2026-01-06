<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionTarget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'calories',
        'protein',
        'carbs',
        'fat',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function rules()
    {
        return [
            'user_id' => 'required|exists:users,id|unique:nutrition_targets',
            'calories' => 'nullable|integer|min:1',
            'protein' => 'nullable|integer|min:0',
            'carbs' => 'nullable|integer|min:0',
            'fat' => 'nullable|integer|min:0',
        ];
    }
}

