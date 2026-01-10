import type { Recipe, BackendRecipe, BackendRecipeIngredient,  } from '../../types/meal.types';
import { parseIngredient } from '../mealPlannerHelpers';


export const transformIngredientToString = (ingredient: BackendRecipeIngredient): string => {
  const parts: string[] = [];
  
  if (ingredient.quantity !== null && ingredient.quantity !== undefined) {
    parts.push(String(ingredient.quantity));
  }
  
  if (ingredient.unit) {
    parts.push(ingredient.unit);
  }
  
  parts.push(ingredient.ingredient_name);
  
  return parts.filter(Boolean).join(' ');
};

export const transformRecipe = (backendRecipe: BackendRecipe): Recipe => {
  // Transform ingredients from structured format to string array
  const ingredients = backendRecipe.ingredients
    ? backendRecipe.ingredients
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(transformIngredientToString)
    : [];

  // Transform instructions from structured format to string array
  const instructions = backendRecipe.instructions
    ? backendRecipe.instructions
        .sort((a, b) => a.step_number - b.step_number)
        .map(inst => inst.instruction)
    : [];

  // Transform tags from structured format to string array
  const tags = backendRecipe.tags
    ? backendRecipe.tags.map(tag => tag.tag)
    : [];

  return {
    id: String(backendRecipe.id),
    name: backendRecipe.name || 'Unnamed Recipe',
    description: backendRecipe.description || undefined,
    prepTime: backendRecipe.prep_time,
    cookTime: backendRecipe.cook_time,
    totalTime: backendRecipe.total_time || (backendRecipe.prep_time + backendRecipe.cook_time),
    servings: backendRecipe.servings,
    difficulty: backendRecipe.difficulty,
    rating: backendRecipe.rating !== null && backendRecipe.rating !== undefined 
      ? Number(backendRecipe.rating) 
      : null,
    ingredients,
    instructions,
    tags,
    pantryLinked: backendRecipe.pantry_linked || false,
    createdAt: backendRecipe.created_at,
    updatedAt: backendRecipe.updated_at,
  };
};


export const transformRecipeToBackend = (recipe: Recipe): {
  name: string;
  description?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating?: number | null;
  ingredients: Array<{
    ingredient_name: string;
    quantity: number | null;
    unit: string | null;
  }>;
  instructions: Array<{
    step_number: number;
    instruction: string;
  }>;
  tags: string[];
} => {
  // Parse ingredient strings to structured format
  // Note: We need to detect if quantity was actually in the string (not defaulted)
  const ingredients = recipe.ingredients.map((ing) => {
    const trimmed = ing.trim();
    const parts = trimmed.split(/\s+/);
    
    // Check if first part is a number (indicates quantity was specified)
    const firstPartIsNumber = parts.length > 0 && !isNaN(parseFloat(parts[0]));
    
    if (firstPartIsNumber && parts.length > 1) {
      let quantity: number | null = parseFloat(parts[0]);
      let unit: string | null = null;
      let ingredient_name = trimmed;
      
      // Check if second part is also a number (e.g., "2 1/2 cups")
      if (parts.length > 2 && !isNaN(parseFloat(parts[1]))) {
        quantity = parseFloat(parts[0]) + parseFloat(parts[1]);
        unit = parts[2];
        ingredient_name = parts.slice(3).join(' ');
      } else if (parts.length > 1) {
        // Second part is unit
        unit = parts[1];
        ingredient_name = parts.slice(2).join(' ');
      }
      
      return {
        ingredient_name: ingredient_name || trimmed,
        quantity,
        unit,
      };
    }
    
    // No quantity specified, use helper to get name
    const parsed = parseIngredient(ing);
    return {
      ingredient_name: parsed.name,
      quantity: null,
      unit: null,
    };
  });

  // Transform instructions to structured format
  const instructions = recipe.instructions.map((instruction, index) => ({
    step_number: index + 1,
    instruction,
  }));

  return {
    name: recipe.name,
    description: recipe.description || undefined,
    prep_time: recipe.prepTime || 0,
    cook_time: recipe.cookTime || 0,
    servings: recipe.servings || 1,
    difficulty: recipe.difficulty || 'Easy',
    rating: recipe.rating !== undefined ? recipe.rating : null,
    ingredients,
    instructions,
    tags: recipe.tags || [],
  };
};


export const transformRecipes = (backendRecipes: BackendRecipe[]): Recipe[] => {
  return backendRecipes.map(transformRecipe);
};

