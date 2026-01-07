import { useEffect } from 'react';
import { transformApiTargetToTargets } from '../utils/nutritionHelpers';
import type { NutritionTargets } from '../types/nutrition.types';

interface TargetSyncProps {
  currentTarget: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null | undefined;
  setTargets: (targets: NutritionTargets | ((prev: NutritionTargets) => NutritionTargets)) => void;
}

export const useNutritionTargetSync = ({ currentTarget, setTargets }: TargetSyncProps) => {
  useEffect(() => {
    if (currentTarget) {
      // Use functional update to avoid targets dependency
      setTargets(prev => transformApiTargetToTargets(currentTarget, prev));
    }
  }, [currentTarget, setTargets]); // setTargets is stable from useState
};

