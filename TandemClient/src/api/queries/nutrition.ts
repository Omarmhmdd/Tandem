import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import type { BackendNutritionTarget, NutritionTargetResponse } from '../../types/nutrition.types';

export const useNutritionTarget = (enabled: boolean = false) => { 
  const { isAuthenticated } = useAuth();
  
  return useQuery<BackendNutritionTarget | null>({
    queryKey: ['nutritionTarget'],
    queryFn: async () => {
      const response = await apiClient.get<NutritionTargetResponse>(
        ENDPOINTS.NUTRITION_TARGET
      );
      return response.data.target;
    },
    enabled: enabled && isAuthenticated,  // Only run if explicitly enabled AND authenticated
    staleTime: STALE_TIME_5_MIN,
    retry: 1,
  });
};

export const useUpdateNutritionTarget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Partial<BackendNutritionTarget>) => {
      const response = await apiClient.post<NutritionTargetResponse>(
        ENDPOINTS.NUTRITION_TARGET,
        target
      );
      return response.data.target;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutritionTarget'] });
      queryClient.invalidateQueries({ queryKey: ['nutritionRecommendations'] });
    },
  });
};