    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import type { Goal, GoalsResponse, SingleGoalResponse } from '../../types/goal.types';
    import { apiClient } from '../client';
    import { ENDPOINTS } from '../endpoints';
    import { useHasHousehold } from '../../hooks/useHasHousehold';
    import { STALE_TIME_5_MIN } from '../../utils/constants';
    import { transformGoal } from '../../utils/transforms/goalTransforms';

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
        const backendData = {title: goal.title,category: goal.category,target: goal.target,current: goal.current,unit: goal.unit,deadline: goal.deadline || null,is_household: true,};

        const endpoint = isUpdate ? ENDPOINTS.GOAL_UPDATE(goal.id): ENDPOINTS.GOALS;

        const response = await apiClient.post<SingleGoalResponse>(endpoint, backendData);
        return transformGoal(response.data.goal);
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
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
        },
    });
    };