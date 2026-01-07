import { useMutation } from '@tanstack/react-query';
import type { AiCoachQueryResponse, NutritionResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';

export const useAiCoachQuery = () => {
  const hasHousehold = useHasHousehold();
  
  return useMutation({
    mutationFn: async (question: string) => {
      if (!hasHousehold) {
        throw new Error('You must create or join a household to access this feature');
      }
      const response = await apiClient.post<AiCoachQueryResponse>(
        ENDPOINTS.AI_COACH_QUERY,
        { question }
      );
      return response.data;
    },
  });
};

export const useNutritionRecommendations = () => {
  const hasHousehold = useHasHousehold();
  
  return useMutation({
    mutationFn: async () => {
      if (!hasHousehold) {
        throw new Error('You must create or join a household to access this feature');
      }
      const response = await apiClient.post<NutritionResponse>(
        ENDPOINTS.AI_COACH_NUTRITION
      );
      return response.data.nutrition || response.data;
    },
  });
};