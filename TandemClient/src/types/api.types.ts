// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Standard API Response Wrapper
export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Goals API Responses - Backend returns { message?, data }
export interface GoalsResponse {
  data: {
    goals: any[];
  };
  message?: string;
}

export interface SingleGoalResponse {
  data: {
    goal: any;
  };
  message?: string;
}

// Recipes API Responses
export interface RecipesResponse {
  data: {
    recipes: any[];
  };
  message?: string;
}

export interface SingleRecipeResponse {
  data: {
    recipe: any;
  };
  message?: string;
}

// Pantry API Responses
export interface PantryResponse {
  data: {
    items: any[];
  };
  message?: string;
}

export interface SinglePantryResponse {
  data: {
    item: any;
  };
  message?: string;
}

// Budget API Responses
export interface ExpensesResponse {
  data: {
    expenses: any[];
  };
  message?: string;
}

export interface SingleExpenseResponse {
  data: {
    expense: any;
  };
  message?: string;
}

export interface BudgetSummaryResponse {
  data: {
    budget: any;
    total_expenses: number;
    remaining: number | null;
  };
  message?: string;
}

// Health Logs API Responses
export interface HealthLogsResponse {
  data: {
    logs: any[];
  };
  message?: string;
}

export interface SingleHealthLogResponse {
  data: {
    log: any;
  };
  message?: string;
}

export interface ParseHealthLogResponse {
  data: {
    parsed: {
      activities: string[];
      food: string[];
      sleep_hours: number | null;
      bedtime: string | null;
      wake_time: string | null;
      mood: string;
      notes: string;
      confidence: number;
      complement: string;
    };
  };
  message?: string;
}

// Habits API Responses
export interface HabitsResponse {
  data: {
    habits: any[];
  };
  message?: string;
}

export interface SingleHabitResponse {
  data: {
    habit: any;
  };
  message?: string;
}

// Meal Plans API Responses
export interface MealPlansResponse {
  data: {
    plans: any[];
  };
  message?: string;
}

export interface SingleMealPlanResponse {
  data: {
    plan: any;
  };
  message?: string;
}

export interface ShoppingListResponse {
  data: {
    items: any[];
  };
  message?: string;
}

// Mood API Responses
export interface MoodTimelineResponse {
  data: {
    entries: any[];
  };
  message?: string;
}

export interface MoodComparisonResponse {
  data: {
    user: any[];
    partner: any[];
  };
  message?: string;
}

export interface MoodEntryResponse {
  data: {
    entry: any;
  };
  message?: string;
}

export interface MoodAnnotationsResponse {
  data: {
    annotations: any[];
  };
  message?: string;
}

// Date Night API Responses
export interface DateNightSuggestionsResponse {
  data: {
    suggestions: any[];
  };
  message?: string;
}

export interface SingleDateNightResponse {
  data: {
    suggestion: any;
  };
  message?: string;
}

// AI Coach API Responses
export interface AiCoachQueryResponse {
  data: {
    answer: string;
    citations: any[];
    actions: any[];
  };
  message?: string;
}

export interface NutritionResponse {
  data: {
    partnersIntake: any[];
    recommendations: string[];
    suggestedMeals: any[];
    targets?: {
      user: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      } | null;
      partner: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      } | null;
    };
  };
  message?: string;
}

// Weekly Summary API Responses
export interface WeeklySummariesResponse {
  data: {
    summaries: any[];
  };
  message?: string;
}

export interface SingleWeeklySummaryResponse {
  data: {
    summary: any;
  };
  message?: string;
}
