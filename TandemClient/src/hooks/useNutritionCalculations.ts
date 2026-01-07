import { useMemo } from 'react';
import type { PartnerIntake, NutritionTargets } from '../types/nutrition.types';
import {
  filterUniquePartners,
  calculateCombinedIntake,
  calculateCombinedTargets,
} from '../utils/nutritionHelpers';

/**
 * Hook to calculate nutrition statistics from partners data
 */
export const useNutritionCalculations = (
  partnersIntake: PartnerIntake[],
  targets: NutritionTargets
) => {
  const uniquePartnersIntake = useMemo(() => {
    const userUserId = partnersIntake[0]?.userId;
    return filterUniquePartners(partnersIntake, userUserId);
  }, [partnersIntake]);

  const combinedToday = useMemo(
    () => calculateCombinedIntake(uniquePartnersIntake),
    [uniquePartnersIntake]
  );

  const combinedTargets = useMemo(
    () => calculateCombinedTargets(targets),
    [targets]
  );

  return {
    uniquePartnersIntake,
    combinedToday,
    combinedTargets,
  };
};