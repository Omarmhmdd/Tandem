export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  ingredients: string[];
  tags: string[];
  instructions: string[];
}

export interface RecipeFormData {
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  ingredients: string[];
  tags: string[];
  instructions: string[];
}

// Recipes API Responses - These are now in api.types.ts
// Keeping for backward compatibility but should use api.types.ts instead
import type { BackendRecipe } from './meal.types';

export interface RecipesResponse {
  data: {
    recipes: BackendRecipe[];
  };
  message?: string;
}

export interface SingleRecipeResponse {
  data: {
    recipe: BackendRecipe;
  };
  message?: string;
}


