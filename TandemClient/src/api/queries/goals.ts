import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Goal, Milestone, GoalsResponse, SingleGoalResponse, MilestoneResponse, GoalsAggregatedData, UseGoalsAggregatedParams } from '../../types/goal.types';
import type { GoalsAggregatedResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { useHasHousehold } from '../../hooks/useHasHousehold';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import { transformGoal, transformGoalToBackend, transformMilestone, transformMilestoneToBackend, transformGoalsAggregated } from '../../utils/transforms/goalTransforms';

/**
 * Aggregated goals query hook - fetches goals and budget summary in a single call
 */
export const useGoalsAggregated = (params: UseGoalsAggregatedParams = {}) => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<GoalsAggregatedData>({
    queryKey: ['goals', 'aggregated', params.year, params.month],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params.year) queryParams.set('year', params.year.toString());
      if (params.month) queryParams.set('month', params.month.toString());
      
      const query = queryParams.toString();
      
      const response = await apiClient.get<GoalsAggregatedResponse>(
        `${ENDPOINTS.GOALS_AGGREGATED}${query ? `?${query}` : ''}`
      );
      
      return transformGoalsAggregated(response.data);
    },
    enabled: hasHousehold,
    staleTime: STALE_TIME_5_MIN,
    retry: 2,
  });
};

export const useGoals = () => {
  const hasHousehold = useHasHousehold();
  
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiClient.get<GoalsResponse>(ENDPOINTS.GOALS);
      const goals = response.data.goals || [];
      return goals.map(transformGoal);
    },
    enabled: hasHousehold,
    staleTime: STALE_TIME_5_MIN,
  });
};

export const useGoalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, { goal: Goal; isUpdate: boolean }>({
    mutationFn: async ({ goal, isUpdate }) => {
      const backendData = transformGoalToBackend(goal);
      // For new goals (empty ID), use create endpoint; otherwise use update
      const endpoint = isUpdate && goal.id && goal.id !== ''
        ? ENDPOINTS.GOAL_UPDATE(String(goal.id))
        : ENDPOINTS.GOALS;

      const response = await apiClient.post<SingleGoalResponse>(endpoint, backendData);
      return transformGoal(response.data.goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.GOAL_DELETE(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<Goal, Error, { id: string; current: number }>({
    mutationFn: async ({ id, current }) => {
      const response = await apiClient.post<SingleGoalResponse>(
        ENDPOINTS.GOAL_PROGRESS(id),
        { current }
      );
      return transformGoal(response.data.goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};

// Milestone mutations
export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation<Milestone, Error, { goalId: string; milestone: Omit<Milestone, 'id'> }>({
    mutationFn: async ({ goalId, milestone }) => {
      const backendData = transformMilestoneToBackend(milestone);
      const response = await apiClient.post<MilestoneResponse>(
        ENDPOINTS.GOAL_MILESTONES(goalId),
        backendData
      );
      return transformMilestone(response.data.milestone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation<Milestone, Error, { goalId: string; milestoneId: string; milestone: Partial<Milestone> }>({
    mutationFn: async ({ goalId, milestoneId, milestone }) => {
      const backendData = milestone.deadline !== undefined
        ? { ...milestone, deadline: milestone.deadline || null }
        : milestone;
      
      const response = await apiClient.post<MilestoneResponse>(
        ENDPOINTS.GOAL_MILESTONE_UPDATE(goalId, milestoneId),
        backendData
      );
      return transformMilestone(response.data.milestone);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, { goalId: string; milestoneId: string }>({
    mutationFn: async ({ goalId, milestoneId }) => {
      await apiClient.post(ENDPOINTS.GOAL_MILESTONE_DELETE(goalId, milestoneId));
      return milestoneId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', 'aggregated'] });
    },
  });
};