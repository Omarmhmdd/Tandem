    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import type { PantryItem, PantryResponse, SinglePantryResponse } from '../../types/pantry.types';
    import { apiClient } from '../client';
    import { ENDPOINTS } from '../endpoints';
    import { useHasHousehold } from '../../hooks/useHasHousehold';
    import { STALE_TIME_5_MIN } from '../../utils/constants';
    import { transformPantryItem, transformToBackend } from '../../utils/transforms/pantryTransforms';

    export const usePantryItems = () => {
    const hasHousehold = useHasHousehold();
    
    return useQuery<PantryItem[]>({
        queryKey: ['pantry'],
        queryFn: async () => {
        const response = await apiClient.get<PantryResponse>(ENDPOINTS.PANTRY);
        const items = response.data.items || [];
        return items.map(transformPantryItem);
        },
        enabled: hasHousehold,
        staleTime: STALE_TIME_5_MIN,
    });
    };

    export const usePantryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<PantryItem, Error, { item: PantryItem; isEdit: boolean }>({
        mutationFn: async ({ item, isEdit }) => {
        const payload = transformToBackend(item);
        const endpoint = isEdit 
            ? ENDPOINTS.PANTRY_UPDATE(item.id)
            : ENDPOINTS.PANTRY;

        const response = await apiClient.post<SinglePantryResponse>(endpoint, payload);
        return transformPantryItem(response.data.item);
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pantry'] });
        },
    });
    };

    export const useDeletePantryItem = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>({
        mutationFn: async (id: string) => {
        await apiClient.post(ENDPOINTS.PANTRY_DELETE(id));
        return id;
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['pantry'] });
        },
    });
    };
