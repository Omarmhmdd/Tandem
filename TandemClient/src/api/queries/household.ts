import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Household, HouseholdMember } from '../../types/household.type';  
import type { HouseholdsResponse, SingleHouseholdResponse, HouseholdMembersResponse } from '../../types/api.types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';
import { storage } from '../../utils/storage';
import type { User } from '../../types/auth.types';
import { STALE_TIME_5_MIN } from '../../utils/constants';
import { transformHousehold, transformMember } from '../../utils/transforms/householdTransforms';

const getToken = (): string | null => {
  const user = storage.get<User | null>('tandem_user', null);
  return user?.token || null;
};

export const useHouseholds = (householdId?: string) => {
  return useQuery<Household[]>({
    queryKey: ['households', householdId],
    queryFn: async () => {
      const response = await apiClient.get<HouseholdsResponse>(
        ENDPOINTS.HOUSEHOLD_GET_ALL(householdId)
      );
      return (response.data.households || []).map(transformHousehold);
    },
    enabled: !!getToken(),
    staleTime: STALE_TIME_5_MIN,  
  });
};


export const useCreateHousehold = () => {
  const queryClient = useQueryClient();

  return useMutation<Household, Error, string>({
    mutationFn: async (name: string) => {
      const response = await apiClient.post<SingleHouseholdResponse>(
        ENDPOINTS.HOUSEHOLD_CREATE(name)
      );
      return transformHousehold(response.data.household);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });
};


export const useJoinHousehold = () => {
  const queryClient = useQueryClient();

  return useMutation<Household, Error, string>({
    mutationFn: async (code: string) => {
      const response = await apiClient.post<SingleHouseholdResponse>(
        ENDPOINTS.HOUSEHOLD_JOIN(code)
      );
      return transformHousehold(response.data.household);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
    },
  });
};


export const useHouseholdMembers = (householdId: string) => {
  return useQuery<HouseholdMember[]>({
    queryKey: ['householdMembers', householdId],
    queryFn: async () => {
      const response = await apiClient.get<HouseholdMembersResponse>(
        ENDPOINTS.HOUSEHOLD_MEMBERS(householdId)
      );
      return (response.data.members || []).map(transformMember);
    },
    enabled: !!householdId,
    staleTime: STALE_TIME_5_MIN,  // ← Use constant
  });
};


export const useHouseholdInviteCode = (householdId: string) => {
  return useQuery<string, Error>({
    queryKey: ['householdInviteCode', householdId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { invite_code: string }; message?: string }>(
        ENDPOINTS.HOUSEHOLD_INVITE_CODE(householdId)
      );
      return response.data.invite_code;
    },
    enabled: !!householdId,
    staleTime: STALE_TIME_5_MIN,  // ← Use constant
  });
};


export const useRegenerateInviteCode = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (householdId: string) => {
      const response = await apiClient.post<{ data: { invite_code: string }; message?: string }>(
        ENDPOINTS.HOUSEHOLD_REGENERATE_INVITE_CODE(householdId)
      );
      return response.data.invite_code;
    },
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({ queryKey: ['householdInviteCode', householdId] });
    },
  });
};