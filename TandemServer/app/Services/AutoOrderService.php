<?php

namespace App\Services;

use App\Models\PantryItem;
use App\Constants\AutoOrderConstants;
use App\Data\AutoOrderResponseData;
use App\Data\PartnerData;
use App\Data\PantryItemData;
use App\Http\Traits\VerifiesResourceOwnership;
use App\Http\Traits\HasDatabaseTransactions;
use Exception;
use App\Services\PantryService;
class AutoOrderService
{
    use VerifiesResourceOwnership, HasDatabaseTransactions;

    public function getPartners(): array
    {
        return PartnerData::all();
    }

    public function sendOrder(array $shoppingListItems, string $partnerId): array
    {
        $householdMember = $this->getActiveHouseholdMember();
        $user = $this->getAuthenticatedUser();

        $neededItems = $this->filterNeededItems($shoppingListItems);

        if (empty($neededItems)) {
            throw new Exception('No items to order');
        }

        $orderId = $this->generateOrderId();
        $this->addItemsToPantry($neededItems, $householdMember->household_id, $user->id);

        return AutoOrderResponseData::prepare($orderId, $partnerId, count($neededItems));
    }

    protected function filterNeededItems(array $shoppingListItems): array
    {
        return array_filter($shoppingListItems, function($item) {
            return ($item['needed'] ?? true) === true;
        });
    }

    protected function addItemsToPantry(array $items, int $householdId, int $userId): void
    {
        $this->transaction(function () use ($items, $householdId, $userId) {
            foreach ($items as $item) {
                $itemName = $this->cleanItemName($item['name'] ?? '');
                if (empty($itemName)) {
                    continue;
                }

                // Parse quantity and unit from the quantity string (e.g., "500 g" or "12 pieces")
                $quantityStr = $item['quantity'] ?? '';
                $quantity = $this->parseQuantity($quantityStr);
                $unit = $this->parseUnit($quantityStr, $item['unit'] ?? null);

                $this->findOrCreatePantryItem($itemName, $quantity, $unit, $householdId, $userId);
            }
        });
    }

  protected function findOrCreatePantryItem( string $itemName, float $quantity, string $unit, int $householdId, int $userId): void {
    // Item name is already cleaned in addItemsToPantry, but ensure it's cleaned for safety
    $cleanedName = $this->cleanItemName($itemName);
    $existingItem = $this->findPantryItemByName($cleanedName, $householdId);

    if ($existingItem) {
        // Item exists - increment quantity and update
        $existingItem->increment('quantity', $quantity);
        $existingItem->updated_by_user_id = $userId;
        
        // Update expiry date if it's null (for items that were added before default expiry was implemented)
        if ($existingItem->expiry_date === null) {
            $existingItem->expiry_date = now()->addDays(AutoOrderConstants::DEFAULT_EXPIRY_DAYS);
        }
        
        $existingItem->save();
    } else {
        // New item - create with cleaned name
        $categorization = $this->categorizeItemForPantry($cleanedName);
        
        PantryItem::create(PantryItemData::forAutoOrder($cleanedName, $quantity, $unit, $categorization, $householdId, $userId));
    }
}
    protected function findPantryItemByName(string $itemName, int $householdId): ?PantryItem
    {
        return PantryItem::where('household_id', $householdId)
            ->whereRaw('LOWER(name) = ?', [strtolower($itemName)])
            ->first();
    }

    protected function categorizeItemForPantry(string $itemName): array
    {
        try {
            return app(PantryService::class)->categorizeItem($itemName);
        } catch (Exception $e) {
            return [
                'category' => AutoOrderConstants::DEFAULT_CATEGORY,
                'location' => AutoOrderConstants::DEFAULT_LOCATION,
            ];
        }
    }

    protected function cleanItemName(string $itemName): string
    {
        // Remove "updated" prefix (case-insensitive) from the beginning of the name
        $cleaned = preg_replace('/^updated\s+/i', '', trim($itemName));
        return $cleaned ?: $itemName; // Return original if cleaned is empty
    }

    protected function parseQuantity(?string $quantityStr): float
    {
        if (empty($quantityStr)) {
            return AutoOrderConstants::DEFAULT_QUANTITY;
        }

        // Extract numeric value from strings like "500 g", "12 pieces", "1.5 kg"
        if (preg_match('/(\d+\.?\d*)/', $quantityStr, $matches)) {
            $quantity = (float) $matches[1];
            return max(AutoOrderConstants::MIN_QUANTITY, $quantity);
        }

        return AutoOrderConstants::DEFAULT_QUANTITY;
    }

    protected function parseUnit(?string $quantityStr, ?string $fallbackUnit): string
    {
        // First, try to extract unit from quantity string (e.g., "500 g" -> "g", "12 pieces" -> "pieces")
        if (!empty($quantityStr)) {
            // Match pattern: number followed by space(s) and unit (e.g., "500 g", "12 pieces", "1.5 kg")
            // The unit can be a single word or multiple words (e.g., "pieces", "fluid ounces")
            if (preg_match('/\d+\.?\d*\s+(.+)$/', trim($quantityStr), $matches)) {
                $extractedUnit = trim($matches[1]);
                // Only return if unit is not empty (avoid cases like "500 " with trailing space)
                if (!empty($extractedUnit)) {
                    return $extractedUnit;
                }
            }
        }

        // Fallback to provided unit or default
        return !empty($fallbackUnit) ? $fallbackUnit : AutoOrderConstants::DEFAULT_UNIT;
    }

    protected function generateOrderId(): string
    {
        return 'ORD-' . strtoupper(uniqid());
    }
}