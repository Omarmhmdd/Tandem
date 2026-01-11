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
    recipes: import('./meal.types').BackendRecipe[];
  };
  message?: string;
}

export interface SingleRecipeResponse {
  data: {
    recipe: import('./meal.types').BackendRecipe;
  };
  message?: string;
}

// Auto-Order API Responses
export interface GroceryPartnersResponse {
  data: {
    partners: import('./meal.types').BackendGroceryPartner[];
  };
  message?: string;
}

export interface AutoOrderResponse {
  data: {
    orderId: string;
    status: string;
    partnerId: string;
    itemsCount: number;
    message?: string;
  };
  message?: string;
}



// Budget API Responses
// Backend expense structure (snake_case)
export interface BackendExpense {
  id: number | string;
  household_id?: number;
  user_id?: number | string;
  date: string;
  amount: number | string;
  description: string;
  category: 'groceries' | 'dining' | 'wedding' | 'health' | 'big-ticket' | 'other';
  auto_tagged?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExpensesResponse {
  data: {
    expenses: BackendExpense[];
  };
  message?: string;
}

export interface SingleExpenseResponse {
  data: {
    expense: BackendExpense;
  };
  message?: string;
}

export interface BackendBudget {
  id?: number | string;
  household_id?: number;
  year?: number;
  month?: number;
  monthly_budget: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSummaryResponse {
  data: {
    budget: BackendBudget | null;
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
    nutrition: {  
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
