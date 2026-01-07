import { useState } from 'react';
import type {
  PartnerIntake,
  SuggestedMeal,
  NutritionTargets,
} from '../types/nutrition.types';


export const useNutritionState = () => {
  const [partnersIntake, setPartnersIntake] = useState<PartnerIntake[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [suggestedMeals, setSuggestedMeals] = useState<SuggestedMeal[]>([]);
  const [targets, setTargets] = useState<NutritionTargets>({ user: null, partner: null });

  return {
    partnersIntake,
    recommendations,
    suggestedMeals,
    targets,
    setPartnersIntake,
    setRecommendations,
    setSuggestedMeals,
    setTargets,
  };
};

