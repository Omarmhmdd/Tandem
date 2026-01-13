import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple, Target, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { useNutritionData } from '../hooks/useNutritionData';
import { useNutritionTargetForm } from '../hooks/useNutritionTargetForm';
import { useNutritionCalculations } from '../hooks/useNutritionCalculations';
import {
  MACROS,
  ROUTES,
  DEFAULT_TARGETS,
  getMacroUnit,
  calculateProgress,
  getProgressColor,
} from '../utils/nutritionHelpers';
import { showToast } from '../utils/toast';

/**
 * AI Nutrition Coach Component
 * Displays nutrition tracking, recommendations, and suggested meals
 */
export const AINutritionCoach: React.FC = () => {
  const navigate = useNavigate();
  const { household } = useHousehold();
  const { user } = useAuth();
  const currentUserId = user?.id || null;
  const [hasRequestedData, setHasRequestedData] = useState(false);
  const lastUserIdRef = useRef<string | null>(null);
  
  // Reset hasRequestedData when user changes
  useEffect(() => {
    if (currentUserId && currentUserId !== lastUserIdRef.current) {
      lastUserIdRef.current = currentUserId;
      setHasRequestedData(false);
    }
  }, [currentUserId]);

  const {
    partnersIntake,
    recommendations,
    suggestedMeals,
    targets,
    isLoading,
    loadNutritionData,
    setTargets, // Make sure this is exported from useNutritionData
  } = useNutritionData();

  const {
    targetForm,
    setTargetForm,
    targetLoading,
    targetModal,
    handleSaveTargets: originalHandleSaveTargets,
    isSaving,
  } = useNutritionTargetForm(() => {
    setHasRequestedData(true);
    loadNutritionData();
  });

    const { uniquePartnersIntake } = useNutritionCalculations(partnersIntake);

  // Get current user's intake and target (not combined with partner)
  const currentUserIntake = useMemo(() => {
    if (!currentUserId || uniquePartnersIntake.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    const currentUserIdStr = String(currentUserId);
    const currentUser = uniquePartnersIntake.find(p => String(p.userId) === currentUserIdStr);
    return currentUser?.today || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }, [uniquePartnersIntake, currentUserId]);

  const currentUserTarget = useMemo(() => {
    return targets.user || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }, [targets.user]);

  // Filter recommendations to show only current user's recommendations
  // Backend should return user-specific recommendations, but filter to be safe
  // IMPORTANT: Show ALL recommendations that are relevant to the current user (not just ones that mention their name)
  const userRecommendations = useMemo(() => {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }
    
    // If no user info, return all recommendations
    if (!currentUserId || !user?.firstName) {
      return recommendations;
    }
    
    // Get current user's name for filtering
    const userName = user.firstName.toLowerCase().trim();
    const userLastName = user.lastName?.toLowerCase().trim() || '';
    const fullName = `${userName} ${userLastName}`.trim();
    
    // Filter recommendations that are for the current user
    // BE LESS STRICT: Include recommendations that mention the user OR are general recommendations
    return recommendations.filter(rec => {
      if (!rec || typeof rec !== 'string') return false;
      
      const recLower = rec.toLowerCase().trim();
      
      // INCLUDE if it starts with the user's name (addressed to them)
      if (userName && recLower.startsWith(userName)) {
        return true;
      }
      
      // INCLUDE if it mentions the user's name at the start (e.g., "John, your calorie...")
      if (userName && recLower.includes(`${userName},`)) {
        return true;
      }
      
      // INCLUDE if it mentions full name
      if (fullName && fullName.length > userName.length && recLower.includes(fullName)) {
        return true;
      }
      
      // EXCLUDE only if it clearly mentions "partner" addressing the partner specifically
      // But include if it's general advice about partnerships
      if (recLower.includes('partner,') && !recLower.startsWith(userName)) {
        // Check if it's addressing the partner (not just mentioning partnership)
        const partnerIndex = recLower.indexOf('partner,');
        if (partnerIndex === 0 || recLower[partnerIndex - 1] === ' ') {
          // This is addressing the partner, exclude it
          return false;
        }
      }
      
      // EXCLUDE if it starts with another specific user's name (not current user)
      const otherUserNames = ['em', 'samra', 'jane', 'mary', 'david', 'alex', 'sarah', 'mike'];
      const startsWithOtherUser = otherUserNames.some(name => {
        if (name === userName) return false; // Don't exclude if it's the current user's name
        return recLower.startsWith(`${name},`) || recLower.startsWith(`${name} `);
      });
      
      if (startsWithOtherUser) {
        return false;
      }
      
      // INCLUDE all other recommendations (general recommendations, advice, etc.)
      // Backend should already filter for current user, but we show all that aren't clearly for someone else
      return true;
    }).slice(0, 5); // Show up to 5 recommendations (backend should return exactly 5: calories, protein, carbs, fat, overall)
  }, [recommendations, currentUserId, user?.firstName, user?.lastName]);


const handleSaveTargets = useCallback(async () => {
  try {
    const savedTarget = await originalHandleSaveTargets();
    
    // Update targets state immediately
    if (savedTarget) {
      setTargets({
        user: {
          calories: savedTarget.calories || 0,
          protein: savedTarget.protein || 0,
          carbs: savedTarget.carbs || 0,
          fat: savedTarget.fat || 0,
        },
        partner: targets.partner, // Keep existing partner target
      });
    }
    
    // Removed duplicate calls - the callback in useNutritionTargetForm already handles this
    
  } catch (error) {
    // Error already handled in originalHandleSaveTargets
  }
}, [originalHandleSaveTargets, setTargets, targets]);

  const handleAddToPlan = useCallback(() => {
    navigate(ROUTES.meals);
  }, [navigate]);

  const handleViewCurrentData = useCallback(() => {
    if (!household) {
      showToast('Please create or join a household first', 'error');
      return;
    }
    
    setHasRequestedData(true);
    // Force reload - always fetch fresh data
    loadNutritionData();
  }, [household, loadNutritionData]);

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-green-600" />
            AI Nutrition Coach
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasRequestedData ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewCurrentData}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewCurrentData}
                disabled={isLoading}
              >
                View Current Data
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={targetModal.open} icon={Settings}>
              Set Targets
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial prompt */}
        {!hasRequestedData && !targetLoading && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg text-center">
            <Apple className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Talk to Your AI Coach and Set Targets
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your nutrition targets and log your food entries, then view your personalized
              nutrition insights and recommendations here.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={targetModal.open}>
                Set Targets
              </Button>
              <Button variant="outline" onClick={handleViewCurrentData}>
                View Current Data
              </Button>
            </div>
          </div>
        )}

        {/* Prompt when targets aren't set but data is requested */}
        {hasRequestedData && !targets.user && !targetLoading && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 mb-1">
                  Set Your Nutrition Targets
                </p>
                <p className="text-xs text-yellow-700">
                  Set your daily nutrition targets to see progress tracking and get personalized
                  recommendations.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={targetModal.open}>
                Set Targets
              </Button>
            </div>
          </div>
        )}

        {/* Current User's Daily Intake (Not Combined) */}
        {hasRequestedData && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Apple className="w-4 h-4" />
                Your Daily Intake
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MACROS.map((macro) => {
                  const current = currentUserIntake[macro];
                  const target = currentUserTarget[macro] || 0;
                  const progress = calculateProgress(current, target);
                  const unit = getMacroUnit(macro);
                  const hasTarget = target > 0;

                  return (
                    <div key={macro} className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 capitalize">{macro}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {current.toFixed(0)}
                        {unit}
                      </p>
                      {hasTarget ? (
                        <>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getProgressColor(progress)}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            of {target.toFixed(0)}
                            {unit}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">No target set</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations - Filter to show only current user's recommendations */}
            {!isLoading && userRecommendations.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {userRecommendations.map((rec, idx) => (
                    <div
                      key={`rec-${idx}-${rec.substring(0, 20)}`}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <p className="text-sm text-blue-900">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Match-Meals */}
            {suggestedMeals.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Suggested Match-Meals
                </h3>
                <div className="space-y-2">
                  {suggestedMeals.map((meal, idx) => (
                    <div
                      key={meal.id ? `meal-${meal.id}-${idx}` : `meal-${idx}-${meal.name || 'unnamed'}`}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{meal.name}</p>
                        {meal.protein && (
                          <p className="text-xs text-gray-600">{meal.protein}g protein</p>
                        )}
                        {meal.calories && (
                          <p className="text-xs text-gray-600">{meal.calories} calories</p>
                        )}
                      </div>
                      <Button variant="primary" size="sm" onClick={handleAddToPlan}>
                        Add to Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Analyzing nutrition data...</p>
              </div>
            )}
          </>
        )}

        {/* Target Setting Modal */}
        <Modal
          isOpen={targetModal.isOpen}
          onClose={targetModal.close}
          title="Set Nutrition Targets"
          footer={
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={targetModal.close}>
                Cancel
              </Button>
              <Button onClick={handleSaveTargets} isLoading={isSaving}>
                Save Targets
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Set your daily nutrition targets. These will be used to track your progress and
              generate recommendations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Calories (kcal)"
                type="number"
                value={targetForm.calories}
                onChange={(e) =>
                  setTargetForm({ ...targetForm, calories: e.target.value })
                }
                placeholder={DEFAULT_TARGETS.calories}
                min="1"
              />
              <Input
                label="Protein (g)"
                type="number"
                value={targetForm.protein}
                onChange={(e) =>
                  setTargetForm({ ...targetForm, protein: e.target.value })
                }
                placeholder={DEFAULT_TARGETS.protein}
                min="0"
              />
              <Input
                label="Carbs (g)"
                type="number"
                value={targetForm.carbs}
                onChange={(e) =>
                  setTargetForm({ ...targetForm, carbs: e.target.value })
                }
                placeholder={DEFAULT_TARGETS.carbs}
                min="0"
              />
              <Input
                label="Fat (g)"
                type="number"
                value={targetForm.fat}
                onChange={(e) =>
                  setTargetForm({ ...targetForm, fat: e.target.value })
                }
                placeholder={DEFAULT_TARGETS.fat}
                min="0"
              />
            </div>
          </div>
        </Modal>
      </CardContent>
    </Card>
  );
};