import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AiCoachQueryResponse, NutritionResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id || null;
  
  return useMutation({
    mutationFn: async () => {
      if (!hasHousehold) {
        throw new Error('You must create or join a household to access this feature');
      }
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Clear ALL cached nutrition data to ensure fresh data for current user
      queryClient.removeQueries({ 
        queryKey: ['nutritionRecommendations'] 
      });
      queryClient.removeQueries({ 
        queryKey: ['nutritionTarget'] 
      });
      
      // Always fetch fresh data - add timestamp to prevent caching
      // Note: Backend should handle user authentication from token, but we add timestamp to prevent browser/proxy caching
      const timestamp = Date.now();
      const response = await apiClient.post<NutritionResponse>(
        `${ENDPOINTS.AI_COACH_NUTRITION}?t=${timestamp}`,
        {} // Empty body - backend uses token to identify user
      );
      return response.data.nutrition || response.data;
    },
    // Don't cache mutations - always fetch fresh
    gcTime: 0,
    retry: false,
  });
};
