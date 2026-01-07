import { useCallback, useRef } from 'react';
import { useNutritionRecommendations } from '../api/queries/aiCoach';
import { useHousehold } from '../contexts/HouseholdContext';
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
  const hasLoadedRef = useRef(false);

  const loadNutritionData = useCallback(async () => {
    if (!household) {
      return;
    }

    try {
      const result = await nutritionMutation.mutateAsync();
      const parsed = parseNutritionResponse(result);

      setters.setPartnersIntake(parsed.partnersIntake);
      setters.setRecommendations(parsed.recommendations);
      setters.setSuggestedMeals(parsed.suggestedMeals);
      
      if (parsed.targets) {
        setters.setTargets(parsed.targets);
      }
      
      hasLoadedRef.current = true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unable to load nutrition recommendations';
      showToast(`Failed to load nutrition data: ${errorMessage}`, 'error');
      setters.setRecommendations([
        'Unable to load nutrition recommendations. Please try again later.',
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [household, nutritionMutation]); // Setters are stable, don't need in deps

  return {
    loadNutritionData,
    isLoading: nutritionMutation.isPending,
    hasLoadedRef,
  };
};

