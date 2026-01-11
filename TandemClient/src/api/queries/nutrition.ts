import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import type { BackendNutritionTarget, NutritionTargetResponse } from '../../types/nutrition.types';

export const useNutritionTarget = (enabled: boolean = false) => { 
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id || null;
  
  return useQuery<BackendNutritionTarget | null>({
    queryKey: ['nutritionTarget', userId],
    queryFn: async () => {
      const response = await apiClient.get<NutritionTargetResponse>(
        ENDPOINTS.NUTRITION_TARGET
      );
      return response.data.target;
    },
    enabled: enabled && isAuthenticated && !!userId,  // Only run if explicitly enabled AND authenticated AND has user ID
    staleTime: STALE_TIME_5_MIN,
    retry: 1,
  });
};

export const useUpdateNutritionTarget = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id || null;

  return useMutation({
    mutationFn: async (target: Partial<BackendNutritionTarget>) => {
      const response = await apiClient.post<NutritionTargetResponse>(
        ENDPOINTS.NUTRITION_TARGET,
        target
      );
      return response.data.target;
    },
    onSuccess: () => {
      // Invalidate user-specific queries
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['nutritionTarget', userId] });
      }
      queryClient.invalidateQueries({ queryKey: ['nutritionTarget'] }); // Also invalidate general for backward compatibility
      queryClient.invalidateQueries({ queryKey: ['nutritionRecommendations'] });
    },
  });
};