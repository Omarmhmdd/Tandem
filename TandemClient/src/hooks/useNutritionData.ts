import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { useNutritionTarget } from '../api/queries/nutrition';
import { useNutritionState } from './useNutritionState';
import { useNutritionLoader } from './useNutritionLoader';
import { useNutritionTargetSync } from './useNutritionTargetSync';


export const useNutritionData = () => {
  const { household } = useHousehold();
  const { user } = useAuth();
  const userId = user?.id || null;
  const { data: currentTarget } = useNutritionTarget(true);
  
  // State management
  const state = useNutritionState();
  
  // Data loading
  const loader = useNutritionLoader({
    setPartnersIntake: state.setPartnersIntake,
    setRecommendations: state.setRecommendations,
    setSuggestedMeals: state.setSuggestedMeals,
    setTargets: state.setTargets,
  }, {
    partnersIntake: state.partnersIntake,
    recommendations: state.recommendations,
  });
  
  // Target synchronization
  useNutritionTargetSync({
    currentTarget,
    setTargets: state.setTargets,
  });

  // Track last user ID to reset state when user changes
  const lastUserIdRef = useRef<string | null>(null);
  
  // Reset state when user changes
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (userId && userId !== lastUserIdRef.current) {
      // User changed - reset state and auto-load flag
      const previousUserId = lastUserIdRef.current;
      lastUserIdRef.current = userId;
      
      // Clear all state
      state.setPartnersIntake([]);
      state.setRecommendations([]);
      state.setSuggestedMeals([]);
      state.setTargets({ user: null, partner: null });
      loader.hasLoadedRef.current = false;
      
      // Clear query cache for previous user if exists
      if (previousUserId) {
        queryClient.removeQueries({ queryKey: ['nutritionTarget', previousUserId] });
        queryClient.removeQueries({ queryKey: ['nutritionRecommendations', previousUserId] });
      }
    }
  }, [userId, state, loader.hasLoadedRef, queryClient]);

  // Auto-load on mount when household and target are available
  // Use a ref to track if we've already triggered auto-load to prevent multiple loads
  const hasAutoLoadedRef = useRef(false);
  
  useEffect(() => {
    if (household && currentTarget && userId && !hasAutoLoadedRef.current) {
      hasAutoLoadedRef.current = true;
      // Load data when component mounts - backend cache key is based on food log timestamps
      // If food logs changed, cache key changes = fresh data
      // If food logs didn't change, cache hit = instant response
      loader.loadNutritionData();
    }
    
    // Reset auto-load flag when user changes
    if (userId !== lastUserIdRef.current) {
      hasAutoLoadedRef.current = false;
    }
  }, [household, currentTarget, userId, loader.loadNutritionData]);

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