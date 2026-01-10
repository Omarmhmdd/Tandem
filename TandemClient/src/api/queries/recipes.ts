import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecipesResponse, SingleRecipeResponse } from '../../types/api.types';
import type { Recipe } from '../../types/meal.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import { transformRecipes, transformRecipe, transformRecipeToBackend } from '../../utils/transforms/recipeTransforms';

export const useRecipes = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await apiClient.get<RecipesResponse>(ENDPOINTS.RECIPES);
      const recipes = response.data.recipes || [];
      return transformRecipes(recipes);
    },
    enabled: hasHousehold,
    staleTime: STALE_TIME_5_MIN,
  });
};

export const useRecipe = (id: string | number | null) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<Recipe | null>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<SingleRecipeResponse>(ENDPOINTS.RECIPE(String(id)));
      return transformRecipe(response.data.recipe);
    },
    enabled: hasHousehold && !!id,
    staleTime: STALE_TIME_5_MIN,
  });
};

export const useRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Recipe, Error, { recipe: Recipe; isUpdate: boolean }>({
    mutationFn: async ({ recipe, isUpdate }) => {
      const backendData = transformRecipeToBackend(recipe);
      
      const endpoint = isUpdate 
        ? ENDPOINTS.RECIPE_UPDATE(String(recipe.id))
        : ENDPOINTS.RECIPES;

      const response = await apiClient.post<SingleRecipeResponse>(endpoint, backendData);
      return transformRecipe(response.data.recipe);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.RECIPE_DELETE(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

