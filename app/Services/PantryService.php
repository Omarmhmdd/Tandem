<?php

namespace App\Services;

use App\Models\PantryItem;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\HasDatabaseTransactions;

class PantryService
{
    use VerifiesResourceOwnership, HasDatabaseTransactions;

    public function getAll(): \Illuminate\Support\Collection
    {
        $householdMember = $this->getActiveHouseholdMemberOrNull();

        if (!$householdMember) {
            return collect([]);
        }

        return PantryItem::where('household_id', $householdMember->household_id)
            ->orderBy('expiry_date', 'asc')
            ->orderBy('name', 'asc')
            ->get();
    }

    public function create(array $pantryItemData): PantryItem
    {
        return PantryItem::create($pantryItemData);
    }

    public function update(int $id, array $pantryItemData): PantryItem
    {
        $householdMember = $this->getActiveHouseholdMember();
        $pantryItem = $this->findPantryItemForHousehold($id, $householdMember->household_id);
        
        $pantryItem->update($pantryItemData);

        return $pantryItem->fresh();
    }

    public function delete(int $id): void
    {
        $householdMember = $this->getActiveHouseholdMember();
        $pantryItem = $this->findPantryItemForHousehold($id, $householdMember->household_id);
        
        $pantryItem->delete();
    }

    public function categorizeItem(string $itemName): array
    {
        $nameLower = strtolower($itemName);
        
        // Category patterns - can be moved to config/database later
        $categoryPatterns = [
            'Meat' => ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'sausage', 'bacon'],
            'Dairy' => ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'mozzarella'],
            'Vegetables' => ['tomato', 'onion', 'pepper', 'lettuce', 'carrot', 'cucumber', 'broccoli', 'spinach', 'celery', 'potato', 'garlic'],
            'Grains' => ['bread', 'pasta', 'rice', 'flour', 'cereal', 'oats', 'quinoa', 'barley', 'wheat'],
            'Fruits' => ['apple', 'banana', 'orange', 'berry', 'grape', 'strawberry', 'blueberry', 'mango', 'pineapple', 'peach'],
        ];
        
        // Detect category
        $category = 'Other';
        foreach ($categoryPatterns as $cat => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($nameLower, $keyword)) {
                    $category = $cat;
                    break 2; // Break out of both loops
                }
            }
        }
        
        // Detect location based on category
        $locationMapping = [
            'Meat' => 'Freezer',
            'Dairy' => 'Fridge',
            'Vegetables' => 'Counter',
            'Fruits' => 'Counter',
        ];
        
        $location = $locationMapping[$category] ?? 'Pantry';
        
        return [
            'category' => $category,
            'location' => $location,
        ];
    }

    protected function findPantryItemForHousehold(int $id, int $householdId): PantryItem
    {
        return PantryItem::where('id', $id)
            ->where('household_id', $householdId)
            ->firstOrFail();
    }
}