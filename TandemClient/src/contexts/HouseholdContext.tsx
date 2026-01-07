    import React, { createContext, useContext, useState, useEffect } from 'react';
    import type { ReactNode } from 'react';
    import { useQueryClient } from '@tanstack/react-query';
    import { storage } from '../utils/storage';
    import { useHouseholds } from '../api/queries/household';
    import { useAuth } from './AuthContext';
    import type { Household, HouseholdMember, HouseholdContextType } from '../types/household.type';

    const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);


    export const useHousehold = () => {
    const context = useContext(HouseholdContext);
    if (!context) {
        throw new Error('useHousehold must be used within HouseholdProvider');
    }
    return context;
    };
        
    interface HouseholdProviderProps {
    children: ReactNode;
    }

    export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const { data: households, isLoading: householdsLoading } = useHouseholds();
    const [household, setHouseholdState] = useState<Household | null>(null);
    const [members, setMembers] = useState<HouseholdMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
        setIsLoading(false);
        setHouseholdState(null);
        setMembers([]);
        return;
        }

        if (householdsLoading) {
        return;
        }


        const storedHousehold = storage.get<Household | null>('tandem_household', null);
        const storedMembers = storage.get<HouseholdMember[]>('tandem_household_members', []);
        

        if (households && households.length > 0) {
        const firstHousehold = households[0];
        const householdData: Household = {
            id: firstHousehold.id,
            name: firstHousehold.name,
            primaryUserId: firstHousehold.primaryUserId,
            partnerUserId: firstHousehold.partnerUserId,
            inviteCode: firstHousehold.inviteCode,
        };
        

        if (!storedHousehold || storedHousehold.id !== householdData.id) {
            setHouseholdState(householdData);
            storage.set('tandem_household', householdData);
            // Invalidate queries when household changes to ensure fresh data
            queryClient.invalidateQueries({ queryKey: ['moodTimeline'] });
            queryClient.invalidateQueries({ queryKey: ['moodComparison'] });
            queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        } else {
            setHouseholdState(storedHousehold);
        }
        } else {

        if (storedHousehold) {
            setHouseholdState(null);
            storage.remove('tandem_household');
        }
        }
        
        setMembers(storedMembers);
        setIsLoading(false);
    }, [isAuthenticated, households, householdsLoading, queryClient]);

    const setHousehold = (newHousehold: Household | null) => {
        setHouseholdState(newHousehold);
        if (newHousehold) {
        storage.set('tandem_household', newHousehold);
        } else {
        storage.remove('tandem_household');
        }
    };

    const invitePartner = async (_email: string): Promise<boolean> => {

        return false;
    };

    const acceptInvitation = async (_code: string): Promise<boolean> => {

        return false;
    };

    return (
        <HouseholdContext.Provider
        value={{
            household,
            members,
            isLoading,
            setHousehold,
            invitePartner,
            acceptInvitation,
        }}
        >
        {children}
        </HouseholdContext.Provider>
    );
    };