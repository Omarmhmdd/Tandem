import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { Calendar, Plus, Users, X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { AutoOrder } from '../components/AutoOrder';
import { useMealPlannerPage } from '../hooks/useMealPlanner';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useAuth } from '../contexts/AuthContext';
import type { MealSlot, ShoppingListItem, Recipe } from '../types/meal.types';
import { MEAL_TYPES } from '../utils/constants';
import { showToast } from '../utils/toast';

export const MealPlanner: React.FC = () => {
  const { user } = useAuth();
  const {
    weekDates,
    recipes,
    shoppingList,
    saveMeal,
    deleteMeal,
    updateShoppingList,
    handleOrderComplete,
    getMealForSlot,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  } = useMealPlannerPage();

  const modal = useModal();
  const deleteConfirm = useConfirmDialog();
  const matchMealModal = useModal();

  const [selectedSlot, setSelectedSlot] = useState<{ date: string; meal: string } | null>(null);
  const [formData, setFormData] = useState({
    recipeId: '',
    recipeName: '',
    isMatchMeal: false,
  });
  const [showAutoOrder, setShowAutoOrder] = useState(false);

  const handleSlotClick = useCallback((date: string, meal: string) => {
    setSelectedSlot({ date, meal });
    const existingMeal = getMealForSlot(date, meal);
    if (existingMeal) {
      setFormData({
        recipeId: existingMeal.recipeId || '',
        recipeName: existingMeal.recipeName || '',
        isMatchMeal: existingMeal.isMatchMeal || false,
      });
    } else {
      setFormData({ recipeId: '', recipeName: '', isMatchMeal: false });
    }
    modal.open();
  }, [getMealForSlot, modal]);

  const handleSaveMeal = useCallback(async () => {
    if (!formData.recipeId || !selectedSlot) {
      showToast('Please select a recipe', 'error');
      return;
    }

    const dayData = weekDates.find((wd) => wd.date === selectedSlot.date);
    const mealSlot: MealSlot = {
      id: Date.now().toString(),
      date: selectedSlot.date,
      day: dayData?.day || '',
      meal: selectedSlot.meal as 'breakfast' | 'lunch' | 'dinner',
      recipeId: formData.recipeId,
      recipeName: formData.recipeName,
      isMatchMeal: formData.isMatchMeal,
    };

    const result = await saveMeal(mealSlot);
    if (result.success) {
      modal.close();
      setSelectedSlot(null);
      if (formData.isMatchMeal) {
        matchMealModal.open();
      }
    }
  }, [formData, selectedSlot, weekDates, saveMeal, modal, matchMealModal]);

  const handleDelete = useCallback((id: string) => {
    deleteConfirm.open(id);
  }, [deleteConfirm]);

  const handleConfirmDelete = useCallback(() => {
    deleteConfirm.confirm((id) => {
      deleteMeal(id);
    });
  }, [deleteConfirm, deleteMeal]);

  const handleShoppingListToggle = useCallback((itemId: string) => {
    const item = shoppingList.find((item: ShoppingListItem) => item.id === itemId);
    if (item) {
      updateShoppingList([{ ...item, needed: !item.needed }]);
    }
  }, [shoppingList, updateShoppingList]);

  const handleRecipeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const recipe = recipes.find((r: Recipe) => String(r.id) === e.target.value);
    setFormData({
      ...formData,
      recipeId: e.target.value,
      recipeName: recipe?.name || '',
    });
  }, [recipes, formData]);

  const handleMatchMealChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, isMatchMeal: e.target.checked });
  }, [formData]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Meal Planner' }]} />

      <PageHeader
        title="Meal Planner"
        description="Plan your week together"
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end items-stretch sm:items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ChevronLeft}
            onClick={goToPreviousWeek}
            aria-label="Previous week"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            icon={Calendar}
            onClick={goToCurrentWeek}
            title="Click to go to current week"
            className="text-xs sm:text-sm px-2 sm:px-4 min-w-0"
          >
            <span className='truncate'>
              {new Date(weekDates[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weekDates[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={ChevronRight}
            onClick={goToNextWeek}
            aria-label="Next week"
          >
            Next
          </Button>
        </div>
        <Button variant="secondary" icon={Users} onClick={matchMealModal.open} className="w-full sm:w-auto">
          Schedule Match Meal
        </Button>
      </div>

      {/* Weekly Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Plan</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Show days as cards */}
          <div className="block lg:hidden space-y-4">
            {weekDates.map((wd) => (
              <div key={wd.date} className="border border-gray-200 rounded-lg p-3">
                <div className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>{wd.day}</span>
                  <span className="text-sm text-gray-500">{new Date(wd.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="space-y-2">
                  {MEAL_TYPES.map((meal: string) => {
                    const mealSlot = getMealForSlot(wd.date, meal);
                    let partnerName: string | undefined;
                    if (mealSlot?.isMatchMeal && user?.id) {
                      const currentUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : Number(user.id);
                      if (mealSlot.matchMealInvitedByUser?.id === currentUserId && mealSlot.matchMealInvitedToUser) {
                        partnerName = `${mealSlot.matchMealInvitedToUser.first_name} ${mealSlot.matchMealInvitedToUser.last_name}`.trim();
                      } else if (mealSlot.matchMealInvitedToUser?.id === currentUserId && mealSlot.matchMealInvitedByUser) {
                        partnerName = `${mealSlot.matchMealInvitedByUser.first_name} ${mealSlot.matchMealInvitedByUser.last_name}`.trim();
                      }
                    }
                    return (
                      <div key={meal} className="flex items-start gap-2">
                        <div className="w-20 pt-2 text-sm font-medium text-gray-700 capitalize flex-shrink-0">
                          {meal}
                        </div>
                        <div
                          onClick={() => handleSlotClick(wd.date, meal)}
                          className="flex-1 min-h-[60px] p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-colors cursor-pointer relative group"
                        >
                          {mealSlot ? (
                            <div className="space-y-1">
                              {mealSlot.isMatchMeal && (
                                <div className="flex items-center gap-1 text-xs text-brand-primary font-medium">
                                  <Users className="w-3 h-3" />
                                  Match{partnerName ? ` with ${partnerName}` : ''}
                                </div>
                              )}
                              <p className="text-sm font-medium text-gray-900 leading-tight">{mealSlot.recipeName}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(mealSlot.id);
                                }}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                                aria-label={`Remove ${mealSlot.recipeName} from meal plan`}
                              >
                                <X className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View - Grid layout */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-8 gap-2 mb-2">
                <div className="font-semibold text-gray-700 text-sm">Meal</div>
                {weekDates.map((wd) => (
                  <div key={wd.date} className="text-center">
                    <div className="font-semibold text-gray-700 text-sm">{wd.day}</div>
                    <div className="text-xs text-gray-500">{new Date(wd.date).getDate()}</div>
                  </div>
                ))}
              </div>

              {MEAL_TYPES.map((meal: string) => (
                <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                  <div className="flex items-start pt-2 font-medium text-gray-700 capitalize text-sm">
                    {meal}
                  </div>
                  {weekDates.map((wd) => {
                    const mealSlot = getMealForSlot(wd.date, meal);
                    let partnerName: string | undefined;
                    if (mealSlot?.isMatchMeal && user?.id) {
                      const currentUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : Number(user.id);
                      if (mealSlot.matchMealInvitedByUser?.id === currentUserId && mealSlot.matchMealInvitedToUser) {
                        partnerName = `${mealSlot.matchMealInvitedToUser.first_name} ${mealSlot.matchMealInvitedToUser.last_name}`.trim();
                      } else if (mealSlot.matchMealInvitedToUser?.id === currentUserId && mealSlot.matchMealInvitedByUser) {
                        partnerName = `${mealSlot.matchMealInvitedByUser.first_name} ${mealSlot.matchMealInvitedByUser.last_name}`.trim();
                      }
                    }
                    return (
                      <div
                        key={`${wd.date}-${meal}`}
                        onClick={() => handleSlotClick(wd.date, meal)}
                        className="min-h-[85px] p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-colors cursor-pointer relative group overflow-hidden"
                      >
                        {mealSlot ? (
                          <div className="space-y-1">
                            {mealSlot.isMatchMeal && (
                              <div className="flex items-center gap-1 text-xs text-brand-primary font-medium">
                                <Users className="w-3 h-3" />
                                Match{partnerName ? ` with ${partnerName}` : ''}
                              </div>
                            )}
                            <p className="text-xs font-medium text-gray-900 leading-tight line-clamp-2 break-words">{mealSlot.recipeName}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(mealSlot.id);
                              }}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                              aria-label={`Remove ${mealSlot.recipeName} from meal plan`}
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <Plus className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shopping List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-primary" />
              Shopping List
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Based on your meal plan. Items fully available in pantry are automatically excluded. Items partially in pantry are marked.
          </p>
          <div className="space-y-2">
            {shoppingList.length > 0 ? (
              shoppingList.map((item: ShoppingListItem) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${item.inPantry ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={item.needed}
                    onChange={() => handleShoppingListToggle(item.id)}
                    className="w-4 h-4 text-brand-primary rounded cursor-pointer"
                    title={item.needed ? 'Item is needed - will appear in Auto-Order' : 'Item not needed - will not appear in Auto-Order'}
                  />
                  <span className={`flex-1 ${item.inPantry ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                    {item.name}
                    {item.quantity && <span className="text-gray-500 ml-1">({item.quantity})</span>}
                  </span>
                  {item.inPantry && (
                    <span className="text-xs text-green-600 font-medium">In Pantry</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No items needed. Your pantry has everything!</p>
            )}
          </div>
          {shoppingList.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => setShowAutoOrder(true)}>
                Auto-order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Meal Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={`Add ${selectedSlot?.meal} - ${selectedSlot?.date}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button onClick={handleSaveMeal}>
              Save Meal
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Recipe
            </label>
            <select
              value={formData.recipeId}
              onChange={handleRecipeChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none"
            >
              <option value="">Select a recipe...</option>
              {Array.isArray(recipes) && recipes.map((recipe: Recipe) => (
                <option key={recipe.id} value={String(recipe.id)}>
                  {recipe.name || 'Unnamed Recipe'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="matchMeal"
              checked={formData.isMatchMeal}
              onChange={handleMatchMealChange}
              className="w-4 h-4 text-brand-primary rounded"
            />
            <label htmlFor="matchMeal" className="text-sm text-gray-700">
              This is a Match Meal (cook together remotely)
            </label>
          </div>
        </div>
      </Modal>

      {/* Match Meal Info Modal */}
      <Modal
        isOpen={matchMealModal.isOpen}
        onClose={matchMealModal.close}
        title="Match Meal Scheduled!"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Your Match Meal has been scheduled! Your partner will receive a notification.
          </p>
          <Button onClick={matchMealModal.close} className="w-full">
            Got it!
          </Button>
        </div>
      </Modal>

      {/* Auto-Order Modal */}
      {showAutoOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAutoOrder(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden z-50">
            <AutoOrder
              shoppingList={shoppingList.map((item: ShoppingListItem) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                needed: item.needed ?? true,
                inPantry: item.inPantry,
              }))}
              onClose={() => setShowAutoOrder(false)}
              onOrderComplete={(items: ShoppingListItem[]) => handleOrderComplete(items)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Remove Meal"
        message="Are you sure you want to remove this meal from your plan?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};