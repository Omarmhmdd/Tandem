    import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
    import type { LogEntry, ParsedHealthLog, HealthLogsResponse, SingleHealthLogResponse, ParseHealthLogResponse } from '../../types/health.types';
    import { apiClient } from '../client';
    import { ENDPOINTS } from '../endpoints';
    import { STALE_TIME_5_MIN } from '../../utils/constants';
    import { transformHealthLog, buildQueryString } from '../../utils/transforms/healthTransforms';

    export const useHealthLogs = (startDate?: string, endDate?: string) => {
    return useQuery<LogEntry[]>({
        queryKey: ['healthLogs', startDate, endDate],
        queryFn: async () => {
        const queryString = buildQueryString(startDate, endDate);
        const response = await apiClient.get<HealthLogsResponse>(`${ENDPOINTS.HEALTH_LOGS}${queryString}`);
        const logs = response.data.logs || [];
        return logs.map(transformHealthLog);
        },
        staleTime: STALE_TIME_5_MIN,
    });
    };

    export const useHealthLogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation<LogEntry, Error, Omit<LogEntry, 'id'>>({
        mutationFn: async (log) => {
        const response = await apiClient.post<SingleHealthLogResponse>(
            ENDPOINTS.HEALTH_LOGS,
            log
        );
        return transformHealthLog(response.data.log);
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
        },
    });
    };

    export const useParseHealthLog = () => {
    return useMutation<ParsedHealthLog, Error, [string, string?]>({
        mutationFn: async ([text, mood]) => {
        const response = await apiClient.post<ParseHealthLogResponse>(
            ENDPOINTS.HEALTH_LOGS_PARSE,
            { text, mood }
        );
        return response.data.parsed;
        },
    });
    };


    export const useDeleteHealthLog = () => {
    const queryClient = useQueryClient();

    return useMutation<string, Error, string>({
        mutationFn: async (id: string) => {
        await apiClient.post(ENDPOINTS.HEALTH_LOG_DELETE(id));
        return id;
        },
        onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['healthLogs'] });
        },
    });
    };