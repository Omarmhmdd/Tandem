import { useState } from 'react';
import { useRecipes, useRecipeMutation, useDeleteRecipe } from '../api/queries/recipes';
import type { Recipe } from '../types/meal.types';
import type { RecipeFormData } from '../types/recipe.types';
import { showToast } from '../utils/toast';

export const useRecipesPage = () => {
  const { data: recipes = [], isLoading } = useRecipes();
  const mutation = useRecipeMutation();
  const deleteMutation = useDeleteRecipe();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const filteredRecipes = recipes.filter((recipe: Recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const saveRecipe = async (formData: RecipeFormData, editingRecipe: Recipe | null) => {
    if (!formData.name || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }

    const recipeData: Recipe = {
      ...formData,
      id: editingRecipe?.id ? String(editingRecipe.id) : Date.now().toString(),
      ingredients: formData.ingredients || [],
      tags: formData.tags || [],
      instructions: formData.instructions || [],
    };

    try {
      await mutation.mutateAsync({ recipe: recipeData, isUpdate: !!editingRecipe });
      showToast(
        editingRecipe ? 'Recipe updated successfully' : 'Recipe created successfully',
        'success'
      );
      return true;
    } catch (error) {
      showToast('Failed to save recipe', 'error');
      return false;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Recipe deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete recipe', 'error');
    }
  };

  return {
    recipes,
    filteredRecipes,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedRecipe,
    setSelectedRecipe,
    saveRecipe,
    deleteRecipe,
  };
};

