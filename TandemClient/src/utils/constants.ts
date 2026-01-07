export const STALE_TIME_2_MIN = 1000 * 60 * 2;   // Used in: meals (shopping list)
export const STALE_TIME_5_MIN = 1000 * 60 * 5;   // Used in: pantry, goals, health, meals, household
export const STALE_TIME_10_MIN = 1000 * 60 * 10; // Used in: weeklySummary

// Dashboard constants
export const EXPIRY_WARNING_DAYS = 3;
export const GOAL_COMPLETION_THRESHOLD = 100;
export const RECENT_LOGS_COUNT = 3;

// Nutrition target validation constants
export const VALIDATION_LIMITS = {
  calories: { min: 1, max: 10000 },
  protein: { min: 0, max: 1000 },
  carbs: { min: 0, max: 1000 },
  fat: { min: 0, max: 1000 },
} as const;