<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\Rag\DocumentType;
use App\Jobs\EmbedDocumentJob;
use App\Services\Rag\VectorDbService;
use App\Models\HouseholdMember;
class Goal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id',
        'user_id',
        'title',
        'category',
        'target',
        'current',
        'unit',
        'deadline',
        'completed_at',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'target' => 'decimal:2',
            'current' => 'decimal:2',
            'progress_percentage' => 'decimal:2',
            'deadline' => 'date',
            'completed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
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

    public function milestones()
    {
        return $this->hasMany(GoalMilestone::class)->orderBy('order');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function getProgressPercentageAttribute()
    {
        if ($this->target > 0) {
            return ($this->current / $this->target) * 100;
        }
        return 0;
    }
    public static function rules()
    {
        return [
            'household_id' => 'nullable|exists:households,id',
            'user_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255|min:1',
            'category' => 'required|in:wedding,health,financial,other',
            'target' => 'required|numeric|min:0.01',
            'current' => 'required|numeric|min:0',
            'unit' => 'required|string|max:50',
            'deadline' => 'nullable|date|after_or_equal:today',
        ];
    }

    protected static function booted()
    {
        static::created(function ($goal) {
            $householdId = $goal->household_id;
            if (!$householdId && $goal->user_id) {
                $householdMember = HouseholdMember::where('user_id', $goal->user_id)
                    ->where('status', 'active')
                    ->first();
                $householdId = $householdMember?->household_id;
            }

            if ($householdId) {
                EmbedDocumentJob::dispatch(
                    DocumentType::GOAL,
                    $goal->id,
                    $householdId,
                    $goal->user_id
                );
            }
        });

        static::updated(function ($goal) {
            $householdId = $goal->household_id;
            if (!$householdId && $goal->user_id) {
                $householdMember = HouseholdMember::where('user_id', $goal->user_id)
                    ->where('status', 'active')
                    ->first();
                $householdId = $householdMember?->household_id;
            }

            if ($householdId) {
                EmbedDocumentJob::dispatch(
                    DocumentType::GOAL,
                    $goal->id,
                    $householdId,
                    $goal->user_id
                );
            }
        });

        static::deleted(function ($goal) {
            $vectorDbService = app(VectorDbService::class);
            $vectorDbService->deleteByFilter([
                'document_type' => DocumentType::GOAL,
                'source_id' => $goal->id,
            ]);
        });
    }
}

