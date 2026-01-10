    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import type { MealSlot, ShoppingListItem, MatchMeal, MealPlansResponse, SingleMealPlanResponse, ShoppingListResponse, MatchMealResponse } from '../../types/meal.types';
    import { apiClient } from '../client';
    import { ENDPOINTS } from '../endpoints';
    import { useHasHousehold } from '../../hooks/useHasHousehold';
    import { STALE_TIME_2_MIN, STALE_TIME_5_MIN } from '../../utils/constants';
    import { transformMealPlan, transformMealPlanToBackend, buildWeekStartQuery } from '../../utils/transforms/mealTransforms';

    export const useMealPlans = (weekStart?: string) => {
    const hasHousehold = useHasHousehold();
    
    return useQuery<MealSlot[]>({
        queryKey: ['mealPlans', weekStart],
        queryFn: async () => {
        const queryString = buildWeekStartQuery(weekStart);
        const response = await apiClient.get<MealPlansResponse>(
            `${ENDPOINTS.MEAL_PLANS}${queryString}`
        );
        const plans = response.data.plans || [];
        return plans.map(transformMealPlan);
        },
        enabled: hasHousehold,
        staleTime: STALE_TIME_5_MIN,
    });
    };

    export const useMealPlanMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<MealSlot, Error, { meal: MealSlot; isUpdate: boolean }>({
        mutationFn: async ({ meal, isUpdate }) => {
        const backendData = transformMealPlanToBackend(meal);

        const endpoint = isUpdate 
            ? ENDPOINTS.MEAL_PLAN_UPDATE(meal.id)
            : ENDPOINTS.MEAL_PLANS;

        const response = await apiClient.post<SingleMealPlanResponse>(endpoint, backendData);
        return transformMealPlan(response.data.plan);
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
        },
    });
    };

    export const useDeleteMeal = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>({
        mutationFn: async (id: string) => {
        await apiClient.post(ENDPOINTS.MEAL_PLAN_DELETE(id));
        return id;
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
        },
    });
    };

    export const useShoppingList = (planId: string) => {
    return useQuery<ShoppingListItem[]>({
        queryKey: ['shoppingList', planId],
        queryFn: async () => {
        const response = await apiClient.post<ShoppingListResponse>(
            ENDPOINTS.SHOPPING_LIST(planId)
        );
        return response.data.items || [];
        },
        enabled: !!planId,
        staleTime: STALE_TIME_2_MIN,
    });
    };

    export const useCreateMatchMeal = () => {
    const queryClient = useQueryClient();

    return useMutation<MatchMeal, Error, { mealPlanId: number; invitedToUserId: number }>({
        mutationFn: async ({ mealPlanId, invitedToUserId }) => {
        // Ensure both IDs are integers (backend expects integers)
        const mealPlanIdInt = Math.floor(Number(mealPlanId));
        const invitedToUserIdInt = Math.floor(Number(invitedToUserId));

        if (isNaN(mealPlanIdInt) || isNaN(invitedToUserIdInt) || mealPlanIdInt <= 0 || invitedToUserIdInt <= 0) {
            throw new Error('Invalid meal plan ID or invited user ID');
        }

        const response = await apiClient.post<MatchMealResponse>(
            ENDPOINTS.MATCH_MEALS,
            {
            meal_plan_id: mealPlanIdInt,
            invited_to_user_id: invitedToUserIdInt,
            }
        );
        return response.data.match_meal;
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
        },
    });
    };