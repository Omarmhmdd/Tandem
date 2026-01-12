import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MoodEntry, Annotation } from '../../types/mood.types';
import type { MoodTimelineResponse, MoodComparisonResponse, MoodEntryResponse, MoodAnnotationsResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { useAuth } from '../../contexts/AuthContext';
import { transformMoodEntry, transformAnnotation, transformMoodEntryToBackend } from '../../utils/transforms/moodTransforms';

export const useMoodTimeline = (startDate?: string, endDate?: string) => {
  const hasHousehold = useHasHousehold();
  const { user } = useAuth();
  
  return useQuery<MoodEntry[]>({
    queryKey: ['moodTimeline', startDate, endDate, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const query = params.toString();
      const response = await apiClient.get<MoodTimelineResponse>(
        `${ENDPOINTS.MOOD_TIMELINE}${query ? `?${query}` : ''}`
      );
      const backendEntries = response.data.entries || [];
      return backendEntries.map(transformMoodEntry);
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });
};

export const useMoodComparison = (startDate?: string, endDate?: string) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<{ user: MoodEntry[]; partner: MoodEntry[] }>({
    queryKey: ['moodComparison', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const query = params.toString();
      const response = await apiClient.get<MoodComparisonResponse>(
        `${ENDPOINTS.MOOD_COMPARISON}${query ? `?${query}` : ''}`
      );
      return {
        user: (response.data.user || []).map(transformMoodEntry),
        partner: (response.data.partner || []).map(transformMoodEntry),
      };
    },
    enabled: hasHousehold,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation<MoodEntry, Error, Partial<MoodEntry>>({
    mutationFn: async (entryData) => {
      const backendData = transformMoodEntryToBackend(entryData);
      const response = await apiClient.post<MoodEntryResponse>(
        ENDPOINTS.MOOD_ENTRIES,
        backendData
      );
      return transformMoodEntry(response.data.entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['moodComparison'] });
    },
  });
};

export const useAutoAnnotateMood = () => {
  return useMutation<Annotation[], Error, { startDate?: string; endDate?: string }>({
    mutationFn: async ({ startDate, endDate }) => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const query = params.toString();
      const response = await apiClient.post<MoodAnnotationsResponse>(
        `${ENDPOINTS.MOOD_ANNOTATIONS}${query ? `?${query}` : ''}`
      );
      const backendAnnotations = response.data.annotations || [];
      return backendAnnotations.map(transformAnnotation);
    },
  });
};

