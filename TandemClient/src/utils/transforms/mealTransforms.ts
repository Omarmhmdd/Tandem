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

  return {
    id: String(plan.id),
    date: plan.date,
    day: getDayName(plan.date),
    meal: plan.meal_type as 'breakfast' | 'lunch' | 'dinner',
    recipeId: plan.recipe_id ? String(plan.recipe_id) : undefined,
    recipeName: plan.name || plan.recipe?.name || '',
    isMatchMeal: plan.is_match_meal || false,
    matchMealPartnerId: plan.match_meal?.partner_user_id
      ? String(plan.match_meal.partner_user_id)
      : undefined,
  };
};

export const buildWeekStartQuery = (weekStart?: string): string => {
  return weekStart ? `?week_start=${weekStart}` : '';
};

