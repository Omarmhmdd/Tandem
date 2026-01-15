import type { MealSlot, BackendMealPlan } from '../../types/meal.types';

const getDayName = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
  } catch {
    return '';
  }
};

export const transformMealPlan = (plan: BackendMealPlan): MealSlot => {
  if (!plan.id) {
    throw new Error('Meal plan must have an ID');
  }

  // Extract match meal info - store both users, component will determine which to show
  let matchMealInvitedByUser: { id: number; first_name: string; last_name: string } | undefined;
  let matchMealInvitedToUser: { id: number; first_name: string; last_name: string } | undefined;
  
  if (plan.match_meal) {
    if (plan.match_meal.invited_by) {
      matchMealInvitedByUser = {
        id: plan.match_meal.invited_by.id,
        first_name: plan.match_meal.invited_by.first_name,
        last_name: plan.match_meal.invited_by.last_name,
      };
    }
    if (plan.match_meal.invited_to) {
      matchMealInvitedToUser = {
        id: plan.match_meal.invited_to.id,
        first_name: plan.match_meal.invited_to.first_name,
        last_name: plan.match_meal.invited_to.last_name,
      };
    }
  }

  return {
    id: String(plan.id),
    date: plan.date,
    day: getDayName(plan.date),
    meal: plan.meal_type as 'breakfast' | 'lunch' | 'dinner',
    recipeId: plan.recipe_id ? String(plan.recipe_id) : undefined,
    recipeName: plan.name || plan.recipe?.name || '',
    isMatchMeal: plan.is_match_meal || false,
    matchMealInvitedBy: plan.match_meal?.invited_by_user_id ? String(plan.match_meal.invited_by_user_id) : undefined,
    matchMealInvitedByUser,
    matchMealInvitedToUser,
  };
};


export const transformMealPlanToBackend = (meal: MealSlot): {
  date: string;
  meal_type: string;
  recipe_id: number | null;
  is_match_meal: boolean;
} => {
  return {
    date: meal.date,
    meal_type: meal.meal,
    recipe_id: meal.recipeId ? parseInt(meal.recipeId, 10) : null,
    is_match_meal: meal.isMatchMeal || false,
  };
};


export const transformMealPlans = (plans: BackendMealPlan[]): MealSlot[] => {
  return plans.map(transformMealPlan);
};

export const buildWeekStartQuery = (weekStart?: string): string => {
  return weekStart ? `?week_start=${weekStart}` : '';
};