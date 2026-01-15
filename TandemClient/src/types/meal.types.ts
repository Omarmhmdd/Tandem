import type { PantryItem } from './pantry.types';

// Recipe type for meal planner 
export interface Recipe {
  id: string | number;
  name: string;
  description?: string;
  prepTime?: number; 
  cookTime?: number; 
  totalTime?: number; 
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number | null; 
  ingredients: string[]; 
  instructions: string[]; 
  tags: string[]; 
  createdAt?: string;
  updatedAt?: string;
}

// Backend Recipe types 
export interface BackendRecipeIngredient {
  id?: number | string;
  recipe_id?: number | string;
  ingredient_name: string;
  quantity?: number | null;
  unit?: string | null;
  order?: number;
}

export interface BackendRecipeInstruction {
  id?: number | string;
  recipe_id?: number | string;
  step_number: number;
  instruction: string;
}

export interface BackendRecipeTag {
  id?: number | string;
  recipe_id?: number | string;
  tag: string;
}

export interface BackendRecipe {
  id: number | string;
  household_id?: number | string;
  name: string;
  description?: string | null;
  prep_time: number;
  cook_time: number;
  total_time?: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating?: number | null;
  ingredients?: BackendRecipeIngredient[];
  instructions?: BackendRecipeInstruction[];
  tags?: BackendRecipeTag[];
  created_at?: string;
  updated_at?: string;
}

// Week date structure
export interface WeekDate {
  date: string; // YYYY-MM-DD
  day: string; // Day name (Mon, Tue, etc.)
}

export interface MealSlot {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  recipeId?: string;
  recipeName?: string;
  isMatchMeal?: boolean;
  matchMealPartnerName?: string;
  matchMealInvitedBy?: string; // User ID who created the match meal
  matchMealInvitedByUser?: { id: number; first_name: string; last_name: string }; // User who created the match meal
  matchMealInvitedToUser?: { id: number; first_name: string; last_name: string }; // User who was invited
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
    id: number | string;
    meal_plan_id: number;
    invited_by_user_id: number;
    invited_to_user_id: number;
    status: string;
    invited_by?: {
      id: number;
      first_name: string;
      last_name: string;
    };
    invited_to?: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
}

export interface MatchMeal {
  id: number | string;
  meal_plan_id: number;
  invited_by_user_id: number;
  invited_to_user_id: number;
  status: string;
  invited_by?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  invited_to?: {
    id: number;
    first_name: string;
    last_name: string;
  };
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

// Parsed ingredient from recipe strings
export interface ParsedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

// useShoppingList hook types
export interface UseShoppingListProps {
  meals: MealSlot[];
  recipes: Recipe[];
  pantryItems: PantryItem[];
}

export interface UseShoppingListReturn {
  shoppingList: ShoppingListItem[];
  updateShoppingList: (items: ShoppingListItem[]) => void;
  handleOrderComplete: (orderedItems: ShoppingListItem[]) => void;
}

// useWeekNavigation hook types
export interface UseWeekNavigationProps {
  initialWeekStart?: string;
}

export interface UseWeekNavigationReturn {
  currentWeekStart: string;
  normalizedWeekStart: string;
  weekDates: WeekDate[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;
}

// Grocery partner for auto-order (frontend)
export interface GroceryPartner {
  id: string;
  name: string;
  logo?: string;
  deliveryFee?: number;
  minOrder?: number;
  estimatedDelivery?: string;
}

// Backend grocery partner (snake_case from API)
export interface BackendGroceryPartner {
  id: string;
  name: string;
  logo?: string;
  delivery_fee?: number;
  min_order?: number;
  estimated_delivery?: string;
}

// AutoOrder component props
export interface AutoOrderProps {
  shoppingList: ShoppingListItem[];
  onClose?: () => void;
  onOrderComplete?: (orderedItems: ShoppingListItem[]) => void;
  onAddToPantry?: (items: ShoppingListItem[]) => void;
}