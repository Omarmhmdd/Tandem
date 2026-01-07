export interface MealSlot {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  recipeId?: string;
  recipeName?: string;
  isMatchMeal?: boolean;
  matchMealPartnerId?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  needed: boolean;
  inPantry?: boolean;
}

// Backend types (snake_case from API)
export interface BackendMealPlan {
  id: number | string;
  date: string;
  meal_type: string;
  recipe_id?: number | string;
  name?: string;
  recipe?: {
    name: string;
  };
  is_match_meal?: boolean;
  match_meal?: {
    partner_user_id: number | string;
  };
}

export interface MatchMeal {
  id: number | string;
  meal_plan_id: number;
  invited_to_user_id: number;
  status: string;
}

// API Response types
export interface MealPlansResponse {
  data: {
    plans: BackendMealPlan[];
  };
  message?: string;
}

export interface SingleMealPlanResponse {
  data: {
    plan: BackendMealPlan;
  };
  message?: string;
}

export interface ShoppingListResponse {
  data: {
    items: ShoppingListItem[];
  };
  message?: string;
}

export interface MatchMealResponse {
  data: {
    match_meal: MatchMeal;
  };
  message?: string;
}