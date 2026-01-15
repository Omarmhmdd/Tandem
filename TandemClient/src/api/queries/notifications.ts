import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification, NotificationsResponse } from '../../types/notification.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { STALE_TIME_5_MIN } from '../../utils/constants';

export const useNotifications = (unreadOnly: boolean = false) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const queryParams = unreadOnly ? '?unread_only=true' : '';
      const response = await apiClient.get<NotificationsResponse>(
        `${ENDPOINTS.NOTIFICATIONS}${queryParams}`
      );
      return response.data.notifications || [];
    },
    staleTime: STALE_TIME_5_MIN,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ENDPOINTS.NOTIFICATION_READ(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post(ENDPOINTS.NOTIFICATIONS_READ_ALL);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

