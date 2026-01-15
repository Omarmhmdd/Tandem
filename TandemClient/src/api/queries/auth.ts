import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { storage } from '../../utils/storage';
import type { User } from '../../types/auth.types';

interface UpdateProfileResponse {
  message: string;
  data: {
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { email?: string; first_name?: string; last_name?: string }>({
    mutationFn: async (profileData) => {
      const response = await apiClient.post<UpdateProfileResponse>(
        ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      
      // Update stored user data
      const currentUser = storage.get<User | null>('tandem_user', null);
      const updatedUser: User = {
        ...currentUser!,
        email: response.data.user.email,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
      };
      storage.set('tandem_user', updatedUser);
      
      return {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        firstName: response.data.user.first_name,
        lastName: response.data.user.last_name,
        token: currentUser?.token,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      // Reload the page to refresh user context
      window.location.reload();
    },
  });
};

