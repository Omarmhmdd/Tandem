import type { PartnerIntake, NutritionTargets, NutritionTarget, SuggestedMeal, NutritionTargetFormData, BackendNutritionTarget, NutritionRecommendationResponse } from '../types/nutrition.types';
import { VALIDATION_LIMITS } from './constants';

export type MacroType = 'calories' | 'protein' | 'carbs' | 'fat';

export const PROGRESS_HIGH = 90;
export const PROGRESS_MEDIUM = 70;

export const MACROS: readonly MacroType[] = ['calories', 'protein', 'carbs', 'fat'] as const;

export const UNITS: Record<MacroType, string> = {
  calories: 'kcal',
  protein: 'g',
  carbs: 'g',
  fat: 'g',
};

export const DEFAULT_TARGETS = {
  calories: '2000',
  protein: '150',
  carbs: '250',
  fat: '65',
} as const;

export const ROUTES = {
  meals: '/meals',
} as const;

export const getMacroUnit = (macro: MacroType): string => {
  return UNITS[macro];
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const getProgressColor = (progress: number): string => {
  if (progress >= PROGRESS_HIGH) return 'bg-green-500';
  if (progress >= PROGRESS_MEDIUM) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Nutrition calculation helpers


export const hasNutritionData = (partner: PartnerIntake): boolean => {
  return (
    partner.today.calories > 0 ||
    partner.today.protein > 0 ||
    partner.today.carbs > 0 ||
    partner.today.fat > 0
  );
};

export const filterUniquePartners = (
  partners: PartnerIntake[],
  userUserId?: string
): PartnerIntake[] => {
  return partners
    .filter((partner, idx, arr) => {
      const firstIndex = arr.findIndex((p) => p.userId === partner.userId);
      return idx === firstIndex;
    })
    .filter((partner) => {
      const isUser = partner.userId === userUserId;
      return hasNutritionData(partner) || isUser;
    });
};


export const calculateCombinedIntake = (partners: PartnerIntake[]): NutritionTarget => {
  return partners.reduce(
    (acc, partner) => ({
      calories: acc.calories + partner.today.calories,
      protein: acc.protein + partner.today.protein,
      carbs: acc.carbs + partner.today.carbs,
      fat: acc.fat + partner.today.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
};


export const calculateCombinedTargets = (targets: NutritionTargets): NutritionTarget => {
  return {
    calories: (targets.user?.calories || 0) + (targets.partner?.calories || 0),
    protein: (targets.user?.protein || 0) + (targets.partner?.protein || 0),
    carbs: (targets.user?.carbs || 0) + (targets.partner?.carbs || 0),
    fat: (targets.user?.fat || 0) + (targets.partner?.fat || 0),
  };
};

// Nutrition data processing helpers

export const parseNutritionResponse = (
  result: unknown
): {
  partnersIntake: PartnerIntake[];
  recommendations: string[];
  suggestedMeals: SuggestedMeal[];
  targets?: NutritionTargets;
} => {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid response format');
  }

  const response = result as NutritionRecommendationResponse;

  return {
    partnersIntake: Array.isArray(response.partnersIntake) ? response.partnersIntake : [],
    recommendations: Array.isArray(response.recommendations) ? response.recommendations : [],
    suggestedMeals: Array.isArray(response.suggestedMeals) ? response.suggestedMeals : [],
    targets: response.targets && typeof response.targets === 'object' ? response.targets : undefined,
  };
};


export const transformApiTargetToTargets = (
  currentTarget: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null,
  existingTargets: NutritionTargets): NutritionTargets => {
  if (!currentTarget) {
    return existingTargets;
  }

  return {
    user: {
      calories: currentTarget.calories || 0,
      protein: currentTarget.protein || 0,
      carbs: currentTarget.carbs || 0,
      fat: currentTarget.fat || 0,
    },
    partner: existingTargets.partner, // Keep existing partner target
  };
};


export const targetToFormData = (target: BackendNutritionTarget | null | undefined): NutritionTargetFormData => {
  if (!target) {
    return { calories: '', protein: '', carbs: '', fat: '' };
  }
  return {
    calories: target.calories?.toString() || '',
    protein: target.protein?.toString() || '',
    carbs: target.carbs?.toString() || '',
    fat: target.fat?.toString() || '',
  };
};


export const validateTargetValue = (
  value: string,
  macro: MacroType
): { isValid: boolean; error?: string; numValue?: number } => {
  const numValue = parseInt(value, 10);
  const limits = VALIDATION_LIMITS[macro];

  if (isNaN(numValue) || value.trim() === '') {
    return { isValid: false, error: `Please enter a valid ${macro} value` };
  }

  if (numValue < limits.min || numValue > limits.max) {
    return {
      isValid: false,
      error: `Please enter a ${macro} value between ${limits.min} and ${limits.max}`,
    };
  }

  return { isValid: true, numValue };
};


export const validateNutritionTargetForm = (
  formData: NutritionTargetFormData
): { isValid: boolean; error?: string } => {
  const macros: MacroType[] = ['calories', 'protein', 'carbs', 'fat'];
  
  for (const macro of macros) {
    const validation = validateTargetValue(formData[macro], macro);
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }
  }
  
  return { isValid: true };
};