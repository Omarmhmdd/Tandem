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
    nutrition: {  // ← Add this wrapper to match actual API response
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
  };
  message?: string;
}




// Household API Responses
export interface HouseholdsResponse {
  data: {
    households: any[]; // BackendHousehold[] - but using any to match pattern
  };
  message?: string;
}

export interface SingleHouseholdResponse {
  data: {
    household: any; // BackendHousehold - but using any to match pattern
    invite_code?: string;
  };
  message?: string;
}

export interface HouseholdMembersResponse {
  data: {
    members: any[]; // BackendHouseholdMember[] - but using any to match pattern
  };
  message?: string;
}
