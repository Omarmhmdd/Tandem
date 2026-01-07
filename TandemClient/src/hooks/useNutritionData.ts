import { useEffect, useRef } from 'react';
import { useHousehold } from '../contexts/HouseholdContext';
import { useNutritionTarget } from '../api/queries/nutrition';
import { useNutritionState } from './useNutritionState';
import { useNutritionLoader } from './useNutritionLoader';
import { useNutritionTargetSync } from './useNutritionTargetSync';

/**
 * Main hook to orchestrate nutrition data management
 * Combines state, loading, and synchronization concerns
 */
export const useNutritionData = () => {
  const { household } = useHousehold();
  const { data: currentTarget } = useNutritionTarget(true);
  
  // State management
  const state = useNutritionState();
  
  // Data loading
  const loader = useNutritionLoader({
    setPartnersIntake: state.setPartnersIntake,
    setRecommendations: state.setRecommendations,
    setSuggestedMeals: state.setSuggestedMeals,
    setTargets: state.setTargets,
  });
  
  // Target synchronization
  useNutritionTargetSync({
    currentTarget,
    setTargets: state.setTargets,
  });

  // Auto-load on mount when household and target are available (only once)
  const hasAutoLoadedRef = useRef(false);
  useEffect(() => {
    if (household && currentTarget && !hasAutoLoadedRef.current && !loader.hasLoadedRef.current) {
      hasAutoLoadedRef.current = true;
      loader.loadNutritionData();
    }
  }, [household, currentTarget, loader.loadNutritionData]);

  return {
    partnersIntake: state.partnersIntake,
    recommendations: state.recommendations,
    suggestedMeals: state.suggestedMeals,
    targets: state.targets,
    isLoading: loader.isLoading,
    loadNutritionData: loader.loadNutritionData,
    setTargets: state.setTargets,
  };
};