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


export const useNutritionLoader = (setters: NutritionStateSetters) => {
  const nutritionMutation = useNutritionRecommendations();
  const { household } = useHousehold();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const hasLoadedRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const loadNutritionData = useCallback(async () => {
    if (!household || !user?.id) {
      return;
    }

    // Reset loaded flag if user changed
    if (user.id !== lastUserIdRef.current) {
      lastUserIdRef.current = user.id;
      hasLoadedRef.current = false;
      // Clear all cached nutrition data for previous user
      queryClient.removeQueries({ queryKey: ['nutritionRecommendations'] });
      queryClient.removeQueries({ queryKey: ['nutritionTarget'] });
      // Reset state
      setters.setPartnersIntake([]);
      setters.setRecommendations([]);
      setters.setSuggestedMeals([]);
      setters.setTargets({ user: null, partner: null });
    }

    try {
      // Always fetch fresh data - don't use cache
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household, user?.id, nutritionMutation, queryClient]); // Setters are stable, don't need in deps

  return {
    loadNutritionData,
    isLoading: nutritionMutation.isPending,
    hasLoadedRef,
  };
};

