import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ShoppingListItem, Recipe, UseShoppingListProps, UseShoppingListReturn } from '../types/meal.types';
import { aggregateIngredients, generateShoppingListFromIngredients } from '../utils/mealPlannerHelpers';

export const useShoppingList = ({
  meals,
  recipes,
  pantryItems,
}: UseShoppingListProps): UseShoppingListReturn => {
  const [manualUpdates, setManualUpdates] = useState<Record<string, boolean>>({});
  // Use ref to track previous IDs to avoid unnecessary state updates
  const previousIdsRef = useRef<Set<string>>(new Set());

  // Compute shopping list using useMemo (NO useEffect!)
  const computedShoppingList = useMemo(() => {
    if (meals.length === 0 || recipes.length === 0) {
      return [];
    }

    const mealRecipes = meals
      .filter((meal) => meal.recipeId)
      .map((meal) => {
        return recipes.find((r) => {
          const recipeId = typeof r.id === 'string' ? r.id : String(r.id || '');
          const mealRecipeId = typeof meal.recipeId === 'string' ? meal.recipeId : String(meal.recipeId || '');
          return recipeId === mealRecipeId;
        });
      })
      .filter((r): r is Recipe => r !== undefined);

    if (mealRecipes.length === 0) {
      return [];
    }

    const ingredients = aggregateIngredients(mealRecipes);
    return generateShoppingListFromIngredients(ingredients, pantryItems);
  }, [meals, recipes, pantryItems]);

  // Clean up manual updates when items are removed - optimized with ref to avoid unnecessary updates
  useEffect(() => {
    const currentIds = new Set<string>(computedShoppingList.map((item) => item.id));
    const previousIds = previousIdsRef.current;
    
    // Quick check: if sets are equal size and all current IDs exist in previous, no cleanup needed
    const idsChanged = 
      previousIds.size !== currentIds.size ||
      Array.from(currentIds).some(id => !previousIds.has(id)) ||
      Array.from(previousIds).some(id => !currentIds.has(id));

    // Update ref with current IDs BEFORE checking for cleanup (to track state)
    previousIdsRef.current = currentIds;

    // Only update state if IDs actually changed AND there are manual updates to clean
    if (idsChanged) {
      setManualUpdates((prev) => {
        // Check if there are any manual updates for removed items
        const hasRemovedItems = Object.keys(prev).some((id) => !currentIds.has(id));
        
        if (!hasRemovedItems) {
          return prev; // No cleanup needed, return previous state to avoid re-render
        }

        // Clean up: only keep manual updates for items that still exist AND were explicitly unchecked
        const cleaned: Record<string, boolean> = {};
        Object.keys(prev).forEach((id) => {
          if (currentIds.has(id) && prev[id] === false) {
            cleaned[id] = prev[id];
          }
        });
        return cleaned;
      });
    }
  }, [computedShoppingList]);

  // Merge computed list with manual updates - pure calculation, no side effects
  // Filter out items that are fully in pantry (items with inPantry=true but actualNeeded=0 shouldn't appear)
  const shoppingList = useMemo(() => {
    return computedShoppingList
      .map((item) => ({
        ...item,
        needed: manualUpdates[item.id] !== undefined ? manualUpdates[item.id] : true,
      }))
      // Filter out items that have no quantity needed (shouldn't happen but safety check)
      // Also filter out items marked as fully in pantry with zero quantity
      .filter((item) => {
        // Extract numeric quantity from string like "500 g" or "0 g" or "500"
        const quantityStr = item.quantity.trim();
        const quantityMatch = quantityStr.match(/^(\d+(?:\.\d+)?)/);
        const numericQuantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
        
        // If quantity is 0 or negative, don't show (item is fully available)
        if (numericQuantity <= 0) {
          return false;
        }
        
        // Item has quantity needed > 0, so show it
        return true;
      });
  }, [computedShoppingList, manualUpdates]);

  const updateShoppingList = useCallback((items: ShoppingListItem[]) => {
    const updates: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.id) {
        updates[item.id] = item.needed;
      }
    });
    setManualUpdates((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleOrderComplete = useCallback(
    (orderedItems: ShoppingListItem[]) => {
      const orderedNames = new Set(orderedItems.map((item) => item.name.toLowerCase()));
      setManualUpdates((prev) => {
        const newUpdates = { ...prev };
        // Mark all ordered items as not needed (needed: false)
        // This ensures they won't appear in the shopping list even after pantry refresh
        computedShoppingList.forEach((item) => {
          if (orderedNames.has(item.name.toLowerCase()) && item.id) {
            // Explicitly mark as not needed
            newUpdates[item.id] = false;
          }
        });
        return newUpdates;
      });
    },
    [computedShoppingList]
  );

  return {
    shoppingList,
    updateShoppingList,
    handleOrderComplete,
  };
};