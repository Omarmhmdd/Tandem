<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\Rag\DocumentType;
use App\Jobs\EmbedDocumentJob;
use App\Services\Rag\VectorDbService;
class PantryItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'household_id',
        'name',
        'quantity',
        'unit',
        'expiry_date',
        'location',
        'category',
        'created_by_user_id',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'expiry_date' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function household()
    {
        return $this->belongsTo(Household::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function recipeIngredientLinks()
    {
        return $this->hasMany(RecipeIngredientPantryLink::class);
    }
    public function shoppingListItems()
    {
        return $this->hasMany(ShoppingListItem::class);
    }

    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) {
            return null;
        }
        return now()->diffInDays($this->expiry_date, false);
    }

    public static function rules()
    {
        return [
            'household_id' => 'required|exists:households,id',
            'name' => 'required|string|max:255|min:1',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => 'required|string|max:50',
            'expiry_date' => 'nullable|date',
            'location' => 'required|in:Fridge,Freezer,Pantry,Counter,Other',
            'category' => 'required|in:Meat,Dairy,Vegetables,Grains,Fruits,Other',
        ];
    }

    protected static function booted()
    {
        static::created(function ($item) {
            EmbedDocumentJob::dispatch(
                DocumentType::PANTRY_ITEM,
                $item->id,
                $item->household_id,
                null
            );
        });

        static::updated(function ($item) {
                EmbedDocumentJob::dispatch(
                DocumentType::PANTRY_ITEM,
                $item->id,
                $item->household_id,
                null
            );
        });

        static::deleted(function ($item) {
            $vectorDbService = app(VectorDbService::class);
            $vectorDbService->deleteByFilter([
                'document_type' =>DocumentType::PANTRY_ITEM,
                'source_id' => $item->id,
            ]);
        });
    }
}

