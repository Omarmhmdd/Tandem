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
                $itemName = $item['name'] ?? '';
                if (empty($itemName)) {
                    continue;
                }

                $quantity = $this->parseQuantity($item['quantity'] ?? null);
                $unit = $item['unit'] ?? AutoOrderConstants::DEFAULT_UNIT;

                $this->findOrCreatePantryItem($itemName, $quantity, $unit, $householdId, $userId);
            }
        });
    }

  protected function findOrCreatePantryItem( string $itemName, float $quantity, string $unit, int $householdId, int $userId): void {
    $existingItem = $this->findPantryItemByName($itemName, $householdId);

    if ($existingItem) {
        $existingItem->increment('quantity', $quantity);
        $existingItem->updated_by_user_id = $userId;
        $existingItem->save();
    } else {
        $categorization = $this->categorizeItemForPantry($itemName);
        
        PantryItem::create(PantryItemData::forAutoOrder($itemName,$quantity,$unit,$categorization,$householdId,$userId));
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

    protected function parseQuantity(?string $quantityStr): float
    {
        if (empty($quantityStr)) {
            return AutoOrderConstants::DEFAULT_QUANTITY;
        }

        if (preg_match('/(\d+\.?\d*)/', $quantityStr, $matches)) {
            $quantity = (float) $matches[1];
            return max(AutoOrderConstants::MIN_QUANTITY, $quantity);
        }

        return AutoOrderConstants::DEFAULT_QUANTITY;
    }

    protected function generateOrderId(): string
    {
        return 'ORD-' . strtoupper(uniqid());
    }
}