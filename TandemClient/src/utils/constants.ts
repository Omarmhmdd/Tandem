export const STALE_TIME_2_MIN = 1000 * 60 * 2;   // Used in: meals (shopping list)
export const STALE_TIME_5_MIN = 1000 * 60 * 5;   // Used in: pantry, goals, health, meals, household
export const STALE_TIME_10_MIN = 1000 * 60 * 10; // Used in: weeklySummary

// Dashboard constants
export const EXPIRY_WARNING_DAYS = 3;
export const GOAL_COMPLETION_THRESHOLD = 100;
export const RECENT_LOGS_COUNT = 3;

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Monday to Sunday for meal planner


//Pantry 
export const PANTRY_CATEGORIES = ['all', 'Meat', 'Dairy', 'Vegetables', 'Grains', 'Fruits', 'Other'];

export const PANTRY_LOCATIONS = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Other'];

//Recipe
export const RECIPE_DIFFICULTIES: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];

// Nutrition target validation constants
export const VALIDATION_LIMITS = {
  calories: { min: 1, max: 10000 },
  protein: { min: 0, max: 1000 },
  carbs: { min: 0, max: 1000 },
  fat: { min: 0, max: 1000 },
} as const;

// Meal types for meal planner
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

// Goal quick add suggestions
export const QUICK_ADD_AMOUNTS = {
  dollar: [10, 25, 50, 100, 500, 1000] as const,
  steps: [1000, 2000, 5000, 10000] as const,
  defaultPercentages: [0.1, 0.25, 0.5] as const,
} as const;