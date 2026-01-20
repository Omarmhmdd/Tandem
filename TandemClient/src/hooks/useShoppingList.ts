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

  
  useEffect(() => {
    const currentIds = new Set<string>(computedShoppingList.map((item) => item.id));
    const previousIds = previousIdsRef.current;
    
    
    const idsChanged = 
      previousIds.size !== currentIds.size ||
      Array.from(currentIds).some(id => !previousIds.has(id)) ||
      Array.from(previousIds).some(id => !currentIds.has(id));

    
    previousIdsRef.current = currentIds;

    
    if (idsChanged) {
      setManualUpdates((prev) => {
        
        const hasRemovedItems = Object.keys(prev).some((id) => !currentIds.has(id));
        
        if (!hasRemovedItems) {
          return prev; 
        }

        
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

  const shoppingList = useMemo(() => {
    return computedShoppingList
      .map((item) => ({
        ...item,
        needed: manualUpdates[item.id] !== undefined ? manualUpdates[item.id] : true,
      }))
      
      .filter((item) => {
      
        const quantityStr = item.quantity.trim();
        const quantityMatch = quantityStr.match(/^(\d+(?:\.\d+)?)/);
        const numericQuantity = quantityMatch ? parseFloat(quantityMatch[1]) : 0;
        
        
        if (numericQuantity <= 0) {
          return false;
        }
        
       
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
        computedShoppingList.forEach((item) => {
          if (orderedNames.has(item.name.toLowerCase()) && item.id) {
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