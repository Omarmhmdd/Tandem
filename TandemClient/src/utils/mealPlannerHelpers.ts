import { WEEK_DAYS } from './constants';
import type { MealSlot, ShoppingListItem, ParsedIngredient } from '../types/meal.types';
import type { PantryItem } from '../types/pantry.types';
import type { HouseholdMember } from '../types/household.type';

export const getWeekDates = (weekStart?: string) => {
  let monday: Date;
  
  if (weekStart) {
    const [year, month, day] = weekStart.split('-').map(Number);
    monday = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = monday.getUTCDay();
    if (dayOfWeek !== 1) {
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      monday.setUTCDate(monday.getUTCDate() + diff);
    }
  } else {
    const today = new Date();
    const dayOfWeek = today.getDay();
    monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  }
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    if (weekStart) {
      date.setUTCDate(monday.getUTCDate() + i);
    } else {
      date.setDate(monday.getDate() + i);
    }
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      day: WEEK_DAYS[i],
    };
  });
};

export const getWeekStartDate = (date: Date): string => {
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  return monday.toISOString().split('T')[0];
};

export const getMealForSlot = (
  meals: MealSlot[],
  date: string,
  mealType: string
): MealSlot | null => {
  return meals.find(m => {
    const mealDate = m.date.split('T')[0];
    const slotDate = date.split('T')[0];
    return mealDate === slotDate && m.meal === mealType;
  }) || null;
};


export const parseIngredient = (ingredient: string): ParsedIngredient => {
  const parts = ingredient.trim().split(/\s+/);
  let quantity = 1;
  let unit = '';
  let name = ingredient;

  if (parts.length > 1 && !isNaN(parseFloat(parts[0]))) {
    quantity = parseFloat(parts[0]);
    if (parts.length > 2 && !isNaN(parseFloat(parts[1]))) {
      quantity = parseFloat(parts[0]) + parseFloat(parts[1]);
      unit = parts[2];
      name = parts.slice(3).join(' ');
    } else {
      unit = parts[1];
      name = parts.slice(2).join(' ');
    }
  }

  return { name, quantity, unit };
};


export const aggregateIngredients = (
  recipes: Array<{ ingredients?: string[] }>
): Record<string, ParsedIngredient> => {
  const allIngredients: Record<string, ParsedIngredient> = {};

  recipes.forEach((recipe) => {
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach((ing: string) => {
        const parsed = parseIngredient(ing);
        const key = parsed.name.toLowerCase();
        
        if (!allIngredients[key]) {
          allIngredients[key] = { name: parsed.name, quantity: 0, unit: parsed.unit };
        }
        allIngredients[key].quantity += parsed.quantity;
      });
    }
  });

  return allIngredients;
};


// Helper function to normalize item names for matching (removes "updated" prefix)
const normalizeItemName = (name: string): string => {
  // Remove "updated" prefix (case-insensitive) from the beginning of the name
  return name
    .toLowerCase()
    .trim()
    .replace(/^updated\s+/i, '');
};

export const generateShoppingListFromIngredients = (
  ingredients: Record<string, ParsedIngredient>,
  pantryItems: PantryItem[]
): ShoppingListItem[] => {
  const shoppingItems: ShoppingListItem[] = [];

  Object.values(ingredients).forEach((ingredient) => {
    // Normalize ingredient name for matching (remove "updated" prefix)
    const normalizedIngredientName = normalizeItemName(ingredient.name);
    
    // Find matching pantry item by normalized name (case-insensitive, trimmed, without "updated" prefix)
    const pantryItem = pantryItems.find((p: PantryItem) => {
      const normalizedPantryName = normalizeItemName(p.name);
      return normalizedPantryName === normalizedIngredientName;
    });

    const quantityNeeded = ingredient.quantity || 0;
    let actualNeeded = quantityNeeded;
    let inPantry = false;

    if (pantryItem && pantryItem.quantity !== undefined && pantryItem.quantity !== null) {
      const pantryQuantity = Number(pantryItem.quantity) || 0;
      
      // CRITICAL: If pantry has enough or more than needed, item is fully available - skip it entirely
      // We compare quantities directly when names match (after normalization)
      // If units differ, we still compare as the same item (assuming compatible units)
      // This handles cases where pantry might have "1500 unit" and recipe needs "500 g" of the same item
      if (pantryQuantity >= quantityNeeded) {
        // Item is fully in pantry - don't add to shopping list at all
        return; // Skip this ingredient completely - no need to calculate anything
      }
      
      // Only reach here if pantry has some but NOT enough
      // Pantry has some but not enough - calculate remaining needed
      inPantry = true;
      actualNeeded = Math.max(0, quantityNeeded - pantryQuantity);
      
      // Double check: if actualNeeded is 0 or less, we shouldn't add it
      if (actualNeeded <= 0) {
        return; // Skip - pantry has enough after calculation
      }
    }

    // Only add to shopping list if we actually need something (actualNeeded > 0)
    // This check is redundant now but kept for safety
    if (actualNeeded > 0) {
      const stableId = `ingredient-${normalizedIngredientName.replace(/\s+/g, '-')}`;
      shoppingItems.push({
        id: stableId,
        name: ingredient.name, // Keep original name for display
        quantity: `${actualNeeded} ${ingredient.unit || ''}`.trim(),
        needed: true,
        inPantry: inPantry, // This will be false if not in pantry, true if partially in pantry
      });
    }
  });

  return shoppingItems;
};


export const findPartnerUser = (
  members: HouseholdMember[],
  currentUserId: number | null
): HouseholdMember | null => {
  if (!currentUserId) return null;

  return members.find((m) => {
    const memberUserId = typeof m.userId === 'string' ? parseInt(m.userId, 10) : Number(m.userId);
    return memberUserId !== currentUserId && m.status === 'active';
  }) || null;
};


export const parseShoppingListQuantity = (quantityString: string): { quantity: number; unit: string } => {
  const quantityMatch = quantityString.match(/(\d+(?:\.\d+)?)\s*(.*)/);
  const quantity = quantityMatch ? parseFloat(quantityMatch[1]) : 1;
  const unit = quantityMatch && quantityMatch[2] ? quantityMatch[2].trim() : 'pieces';
  return { quantity, unit };
};