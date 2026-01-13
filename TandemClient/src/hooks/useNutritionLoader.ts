import { useCallback, useRef } from 'react';
import { useNutritionRecommendations } from '../api/queries/aiCoach';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '../utils/toast';
import { parseNutritionResponse } from '../utils/nutritionHelpers';
import type {PartnerIntake,SuggestedMeal,NutritionTargets,} from '../types/nutrition.types';

interface NutritionStateSetters {
  setPartnersIntake: (data: PartnerIntake[]) => void;
  setRecommendations: (data: string[]) => void;
  setSuggestedMeals: (data: SuggestedMeal[]) => void;
  setTargets: (data: NutritionTargets) => void;
}

interface NutritionStateValues {
  partnersIntake: PartnerIntake[];
  recommendations: string[];
}

export const useNutritionLoader = (
  setters: NutritionStateSetters,
  _state: NutritionStateValues // Not used in dependencies to prevent infinite loop
) => {
  const nutritionMutation = useNutritionRecommendations();
  const { household } = useHousehold();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const isLoadingRef = useRef(false);

  const loadNutritionData = useCallback(async () => {
    if (!household || !user?.id) {
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      return;
    }

    // Reset loaded flag if user changed
    if (user.id !== lastUserIdRef.current) {
      lastUserIdRef.current = user.id;
      hasLoadedRef.current = false;
      // Clear session storage for previous user
      const today = new Date().toISOString().split('T')[0];
      sessionStorage.removeItem(`nutrition_loaded_${lastUserIdRef.current}_${today}`);
      // Clear all cached nutrition data for previous user
      queryClient.removeQueries({ queryKey: ['nutritionRecommendations'] });
      queryClient.removeQueries({ queryKey: ['nutritionTarget'] });
      // Reset state
      setters.setPartnersIntake([]);
      setters.setRecommendations([]);
      setters.setSuggestedMeals([]);
      setters.setTargets({ user: null, partner: null });
    }

    // CRITICAL: Always call API - backend cache handles freshness
    // The cache key is based on last food log timestamp, so new food = new cache key = fresh data
    // Always fetch - backend will return cached if same, or fresh if food logs changed
    // IMPORTANT: Add a small delay to ensure new food logs are committed to database
    // This prevents race condition where cache key is calculated before new log is saved

    isLoadingRef.current = true;
    try {
      // Small delay to ensure any recently added food logs are committed
      // This prevents cache key from using old timestamp
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch data (backend will cache it based on food logs, so same food = same result)
      const result = await nutritionMutation.mutateAsync();
      const parsed = parseNutritionResponse(result);

      setters.setPartnersIntake(parsed.partnersIntake || []);
      setters.setRecommendations(parsed.recommendations || []);
      setters.setSuggestedMeals(parsed.suggestedMeals || []);
      
      if (parsed.targets) {
        setters.setTargets(parsed.targets);
      }
      
      hasLoadedRef.current = true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to load nutrition recommendations';
      showToast(`Failed to load nutrition data: ${errorMessage}`, 'error');
      setters.setRecommendations([]);
      setters.setPartnersIntake([]);
      setters.setSuggestedMeals([]);
    } finally {
      isLoadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household, user?.id, nutritionMutation, queryClient]); // Removed state.partnersIntake to prevent infinite loop

  return {
    loadNutritionData,
    isLoading: nutritionMutation.isPending,
    hasLoadedRef,
  };
};

