import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/shared/PageHeader';
import { Plus, Search, Clock, Users, ChefHat, Star, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useRecipesPage } from '../hooks/useRecipes';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import type { Recipe } from '../types/meal.types';
import type { RecipeFormData } from '../types/recipe.types';
import { getDifficultyColor } from '../utils/recipeHelpers';
import { RECIPE_DIFFICULTIES } from '../utils/constants';

export const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const {
    filteredRecipes,
    searchQuery,
    setSearchQuery,
    selectedRecipe,
    setSelectedRecipe,
    saveRecipe,
    deleteRecipe,
    isLoading,
  } = useRecipesPage();

  const modal = useModal();
  const deleteConfirm = useConfirmDialog();

  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.0,
    ingredients: [],
    tags: [],
    instructions: [],
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [instructionInput, setInstructionInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Recipes' }]} />
        <PageHeader
          title="Recipes"
          description="Manage your recipe collection"
        />
        <Card className="shadow-sm">
          <CardContent className="p-5 animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingRecipe(null);
    setFormData({
      name: '',
      description: '',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.0,
      ingredients: [],
      tags: [],
      instructions: [],
    });
    modal.open();
  };

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || '',
      prepTime: recipe.prepTime || 15,
      cookTime: recipe.cookTime || 20,
      servings: recipe.servings || 2,
      difficulty: recipe.difficulty || 'Easy',
      rating: recipe.rating ?? 4.0,
      ingredients: recipe.ingredients || [],
      tags: recipe.tags || [],
      instructions: recipe.instructions || [],
    });
    modal.open();
  };

  const handleSave = async () => {
    const success = await saveRecipe(formData, editingRecipe);
    if (success) {
      modal.close();
      setEditingRecipe(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteConfirm.open(id);
  };

  const handleConfirmDelete = () => {
    deleteConfirm.confirm((id) => {
      deleteRecipe(id);
      if (selectedRecipe?.id === id) setSelectedRecipe(null);
    });
  };


  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()],
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      setFormData({
        ...formData,
        instructions: [...formData.instructions, instructionInput.trim()],
      });
      setInstructionInput('');
    }
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index),
    });
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Recipes' }]} />

      <PageHeader
        title="Recipes"
        description="Manage your recipe collection"
        action={{
          label: 'Add Recipe',
          onClick: handleOpenAdd,
          icon: Plus,
        }}
      />

      {/* Search */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <Input
            icon={Search}
            placeholder="Search recipes by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecipes.map((recipe: Recipe) => (
              <Card
                key={recipe.id}
                hover
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
                        {recipe.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {recipe.description || 'No description available'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {recipe.rating?.toFixed(1) ?? 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{recipe.servings || 0} servings</span>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.difficulty || 'Easy')}`}
                    >
                      {recipe.difficulty || 'Easy'}
                    </span>
                    {(recipe.tags || []).slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100"
                      >
                        {tag}
                      </span>
                    ))}
                    {(recipe.tags || []).length > 3 && (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{(recipe.tags || []).length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1 text-sm font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(recipe);
                      }}
                      icon={Edit}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1 text-sm font-semibold text-red-600 hover:text-red-700 hover:border-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(String(recipe.id));
                      }}
                      icon={Trash2}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredRecipes.length === 0 && (
            <Card>
              <CardContent>
                <EmptyState
                  icon={ChefHat}
                  title="No recipes found"
                  description={searchQuery ? "Try adjusting your search query." : "Create your first recipe to get started."}
                  action={!searchQuery ? {
                    label: "Create Recipe",
                    onClick: handleOpenAdd,
                    icon: Plus,
                  } : undefined}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recipe Detail Sidebar */}
        <div className="lg:col-span-1">
          {selectedRecipe ? (
            <Card className="sticky top-24 shadow-lg">
              <CardHeader className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2.5 text-xl">
                    <ChefHat className="w-6 h-6 text-brand-primary" />
                    <span className="font-bold">{selectedRecipe.name}</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Description and Meta Info */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedRecipe.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-5 text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Prep: {selectedRecipe.prepTime || 0}min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Cook: {selectedRecipe.cookTime || 0}min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedRecipe.servings || 0} servings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(selectedRecipe.difficulty || 'Easy')}`}
                    >
                      {selectedRecipe.difficulty || 'Easy'}
                    </span>
                    {selectedRecipe.rating && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700">
                          {selectedRecipe.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                    <BookOpen className="w-5 h-5 text-brand-primary" />
                    Ingredients
                  </h4>
                  <ul className="space-y-2.5">
                    {(selectedRecipe.ingredients || []).length > 0 ? (
                      (selectedRecipe.ingredients || []).map((ingredient, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2.5">
                          <span className="text-brand-primary mt-1.5 font-bold">•</span>
                          <span className="leading-relaxed">{ingredient}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No ingredients listed</li>
                    )}
                  </ul>
                </div>

                {/* Instructions */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                    <ChefHat className="w-5 h-5 text-brand-primary" />
                    Instructions
                  </h4>
                  <ol className="space-y-3">
                    {(selectedRecipe.instructions || []).length > 0 ? (
                      (selectedRecipe.instructions || []).map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex gap-3">
                          <span className="flex-shrink-0 w-7 h-7 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed pt-0.5">{step}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No instructions available</li>
                    )}
                  </ol>
                </div>

                {/* Tags */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-base">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedRecipe.tags || []).length > 0 ? (
                      (selectedRecipe.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500 italic">No tags</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-4 border-t border-gray-200">
                  <Button 
                    variant="primary" 
                    size="md"
                    className="flex-1 text-sm font-semibold"
                    onClick={() => navigate('/meals')}
                  >
                    Add to Meal Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md"
                    className="flex-1 text-sm font-semibold"
                    onClick={() => navigate('/meals')}
                  >
                    Shopping List
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Select a recipe to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingRecipe ? 'Edit Recipe' : 'New Recipe'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" size="md" onClick={modal.close} className="font-semibold">
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSave} className="font-semibold">
              {editingRecipe ? 'Save Changes' : 'Create Recipe'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Recipe Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chicken Stir Fry"
            required
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Prep Time (min)"
              type="number"
              value={formData.prepTime}
              onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Cook Time (min)"
              type="number"
              value={formData.cookTime}
              onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Servings"
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              {RECIPE_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ingredients
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="e.g., Chicken breast (2 lbs)"
                className="flex-1"
              />
              <Button size="md" onClick={addIngredient} className="font-semibold whitespace-nowrap">
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-700 font-medium flex-1">{ing}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeIngredient(idx)}
                    aria-label={`Remove ingredient: ${ing}`}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Instructions
            </label>
            <div className="flex gap-2 mb-2">
              <Textarea
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addInstruction())}
                placeholder="Add step..."
                rows={2}
                className="flex-1"
              />
              <Button size="md" onClick={addInstruction} className="font-semibold whitespace-nowrap self-start">
                Add
              </Button>
            </div>
            <div className="space-y-2.5">
              {formData.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="flex-shrink-0 w-7 h-7 bg-brand-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 flex-1 leading-relaxed pt-0.5">{step}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeInstruction(idx)}
                    aria-label={`Remove instruction step ${idx + 1}`}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="e.g., Quick, Healthy"
                className="flex-1"
              />
              <Button size="md" onClick={addTag} className="font-semibold whitespace-nowrap">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold border border-purple-100"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(idx)} 
                    className="hover:text-purple-900 hover:bg-purple-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                    aria-label={`Remove tag: ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
