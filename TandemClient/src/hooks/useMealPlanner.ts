import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMealPlans, useMealPlanMutation, useDeleteMeal, useCreateMatchMeal } from '../api/queries/meals';
import { usePantryItems, usePantryMutation } from '../api/queries/pantry';
import { useRecipes } from '../api/queries/recipes';
import { useHouseholdMembers } from '../api/queries/household';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import  type { MealSlot, ShoppingListItem } from '../types/meal.types';
import type { PantryItem, PantryFormData } from '../types/pantry.types';
import { getMealForSlot as getMealForSlotHelper, findPartnerUser, parseShoppingListQuantity } from '../utils/mealPlannerHelpers';
import { showToast } from '../utils/toast';
import { AUTO_ORDER_DEFAULT_EXPIRY_DAYS } from '../utils/pantryHelpers';
import { createPantryItemData, validatePantryForm } from '../utils/pantryHelpers';
import { useWeekNavigation } from './useWeekNavigation';
import { useShoppingList } from './useShoppingList';

export const useMealPlannerPage = () => {
  const { user } = useAuth();
  const { household } = useHousehold();
  const { data: members = [] } = useHouseholdMembers(household?.id || '');
  const queryClient = useQueryClient();

  // Week navigation - extracted to separate hook
  const { currentWeekStart, normalizedWeekStart, weekDates, goToPreviousWeek, goToNextWeek, goToCurrentWeek } =
    useWeekNavigation();

  // Data fetching
  const { data: meals = [], isLoading: isLoadingMeals } = useMealPlans(normalizedWeekStart);
  const { data: recipes = [] } = useRecipes();
  const { data: pantryItems = [] } = usePantryItems();
  
  // Mutations
  const mutation = useMealPlanMutation();
  const deleteMutation = useDeleteMeal();
  const matchMealMutation = useCreateMatchMeal();
  const pantryMutation = usePantryMutation();

  // Shopping list - extracted to separate hook
  const { shoppingList, updateShoppingList, handleOrderComplete } = useShoppingList({
    meals,
    recipes,
    pantryItems,
  });

  // Track last invalidated household ID to avoid unnecessary invalidations
  const lastInvalidatedHouseholdIdRef = useRef<string | number | null>(null);

  // Only ONE useEffect - for household invalidation (necessary side effect)
  // Optimized to only invalidate when household ID actually changes
  useEffect(() => {
    if (household?.id && household.id !== lastInvalidatedHouseholdIdRef.current) {
      lastInvalidatedHouseholdIdRef.current = household.id;
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
    }
  }, [household?.id, queryClient]);

  // Save meal handler
  const saveMeal = useCallback(
    async (meal: MealSlot) => {
      try {
        const savedPlan = await mutation.mutateAsync({ meal, isUpdate: false });

        // Handle match meal invitation if needed
        if (meal.isMatchMeal && savedPlan?.id) {
          const currentUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id, 10) : Number(user.id)) : null;
          const partner = findPartnerUser(members, currentUserId);

          if (partner && partner.userId) {
            // Ensure both IDs are numbers (integers)
            const partnerUserId = typeof partner.userId === 'string' 
              ? parseInt(partner.userId, 10) 
              : Number(partner.userId);
            
            const mealPlanId = typeof savedPlan.id === 'string' 
              ? parseInt(savedPlan.id, 10) 
              : Number(savedPlan.id);

            // Validate IDs are valid numbers
            if (isNaN(partnerUserId) || isNaN(mealPlanId)) {
              showToast('Invalid user or meal plan ID', 'error');
              return { success: true, plan: savedPlan };
            }

            // Ensure partner user is different from current user
            if (currentUserId && partnerUserId === currentUserId) {
              showToast('Cannot invite yourself to a match meal', 'warning');
              return { success: true, plan: savedPlan };
            }

            try {
              await matchMealMutation.mutateAsync({
                mealPlanId: Number(mealPlanId),
                invitedToUserId: Number(partnerUserId),
              });
              showToast('Match meal invitation sent!', 'success');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              showToast(`Meal saved, but failed to send match meal invitation: ${errorMessage}`, 'warning');
            }
          } else {
            showToast('Meal saved, but no partner found to invite', 'warning');
          }
        }

        return { success: true, plan: savedPlan };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save meal';
        showToast(errorMessage, 'error');
        return { success: false, plan: null };
      }
    },
    [mutation, matchMealMutation, user?.id, members]
  );

  // Delete meal handler
  const deleteMeal = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        showToast('Meal removed from plan', 'success');
      } catch (error) {
        showToast('Failed to delete meal', 'error');
      }
    },
    [deleteMutation]
  );

  // Add items to pantry handler
  const handleAddToPantry = useCallback(
    async (items: ShoppingListItem[]) => {
      try {
        for (const item of items) {
          const { quantity, unit } = parseShoppingListQuantity(item.quantity);

          // Use default categories - backend handles categorization internally via AutoOrderService
          const category = 'Other';
          const location = 'Pantry';

          const existingItem = pantryItems.find((p: PantryItem) => 
            p.name.toLowerCase() === item.name.toLowerCase()
          );

          if (existingItem) {
            // Update existing item
            const updatedItem = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            };

            const formData: PantryFormData = {
              name: updatedItem.name,
              quantity: updatedItem.quantity,
              unit: updatedItem.unit,
              expiry: updatedItem.expiry,
              location: updatedItem.location,
              category: updatedItem.category,
            };

            const validationError = validatePantryForm(formData);
            if (validationError) {
              showToast(`Invalid data for ${item.name}: ${validationError}`, 'error');
              continue;
            }

            await pantryMutation.mutateAsync({
              item: createPantryItemData(formData, existingItem.id) as PantryItem,
              isEdit: true,
            });
          } else {
            // Create new item
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + AUTO_ORDER_DEFAULT_EXPIRY_DAYS);

            const formData: PantryFormData = {
              name: item.name,
              quantity,
              unit,
              expiry: expiryDate.toISOString().split('T')[0],
              location,
              category,
            };

            const validationError = validatePantryForm(formData);
            if (validationError) {
              showToast(`Invalid data for ${item.name}: ${validationError}`, 'error');
              continue;
            }

            await pantryMutation.mutateAsync({
              item: createPantryItemData(formData) as PantryItem,
              isEdit: false,
            });
          }
        }

        showToast(`Order complete! ${items.length} item(s) added to pantry.`, 'success');
      } catch (error) {
        showToast('Failed to add items to pantry', 'error');
      }
    },
    [pantryItems, pantryMutation]
  );

  // Get meal for slot
  const getMealForSlot = useCallback(
    (date: string, meal: string): MealSlot | null => {
      return getMealForSlotHelper(meals, date, meal);
    },
    [meals]
  );

  return {
    meals,
    weekDates,
    recipes,
    shoppingList,
    saveMeal,
    deleteMeal,
    updateShoppingList,
    handleOrderComplete,
    handleAddToPantry,
    getMealForSlot,
    generateShoppingList: () => {}, // Keep for API compatibility, auto-generated now
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isLoading: isLoadingMeals,
  };
};