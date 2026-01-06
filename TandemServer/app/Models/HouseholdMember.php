<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseholdMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'household_id',
        'user_id',
        'role',
        'invite_token',
        'invited_email',
        'status',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public static function rules()
    {
        return [
            'household_id' => 'required|exists:households,id',
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:primary,partner',
            'invite_token' => 'nullable|string|max:255|unique:household_members',
            'invited_email' => 'nullable|email|max:255',
            'status' => 'required|in:active,pending,declined',
        ];
    }
}

