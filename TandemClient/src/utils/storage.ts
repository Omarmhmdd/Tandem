// Simple localStorage wrapper for data persistence
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};

// Storage keys
export const STORAGE_KEYS = {
  PANTRY_ITEMS: 'tandem_pantry_items',
  RECIPES: 'tandem_recipes',
  GOALS: 'tandem_goals',
  MEAL_PLAN: 'tandem_meal_plan',
  HEALTH_LOGS: 'tandem_health_logs',
  HABITS: 'tandem_habits',
};

