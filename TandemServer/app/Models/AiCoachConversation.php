<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiCoachConversation extends Model
{
    use HasFactory;

    public $timestamps = false;
    protected $fillable = [
        'user_id',
        'household_id',
        'question',
        'answer',
        'citations',
        'actions',
    ];

    protected function casts(): array
    {
        return [
            'citations' => 'array',
            'actions' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public static function rules()
    {
        return [
            'user_id' => 'required|exists:users,id',
            'household_id' => 'required|exists:households,id',
            'question' => 'required|string|min:1',
            'answer' => 'required|string|min:1',
            'citations' => 'nullable|array',
            'actions' => 'nullable|array',
        ];
    }
}

