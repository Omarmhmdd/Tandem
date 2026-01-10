    import React, { createContext, useContext, useMemo, useRef, useCallback } from 'react';
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
    
    // Use refs to track previous values and prevent infinite loops
    const queryClientRef = useRef(queryClient);
    const lastHouseholdIdRef = useRef<string | null>(null);
    const invalidationQueuedRef = useRef<boolean>(false);
    
    // Keep queryClient ref updated without triggering re-renders
    queryClientRef.current = queryClient;

    // Derive household directly from query without intermediate state
    const household = useMemo<Household | null>(() => {
        if (!isAuthenticated || householdsLoading) {
            return null;
        }

        if (households && households.length > 0) {
            const firstHousehold = households[0];
            const householdData: Household = {
                id: firstHousehold.id,
                name: firstHousehold.name,
                primaryUserId: firstHousehold.primaryUserId,
                partnerUserId: firstHousehold.partnerUserId,
                inviteCode: firstHousehold.inviteCode,
            };
            
            // Check if household ID has changed - invalidate queries once
            const householdIdChanged = lastHouseholdIdRef.current !== householdData.id;
            if (householdIdChanged) {
                lastHouseholdIdRef.current = householdData.id;
                invalidationQueuedRef.current = false;
                
                // Save to storage
                storage.set('tandem_household', householdData);
                
                // Queue query invalidation (only once per household change)
                if (!invalidationQueuedRef.current) {
                    invalidationQueuedRef.current = true;
                    // Use requestAnimationFrame to defer invalidation after render
                    requestAnimationFrame(() => {
                        queryClientRef.current.invalidateQueries({ queryKey: ['moodTimeline'] });
                        queryClientRef.current.invalidateQueries({ queryKey: ['moodComparison'] });
                        queryClientRef.current.invalidateQueries({ queryKey: ['mealPlans'] });
                        queryClientRef.current.invalidateQueries({ queryKey: ['analytics'] });
                        invalidationQueuedRef.current = false;
                    });
                }
            }
            
            return householdData;
        }
        
        // No households from API - clear refs and storage
        if (lastHouseholdIdRef.current !== null) {
            lastHouseholdIdRef.current = null;
            invalidationQueuedRef.current = false;
            storage.remove('tandem_household');
        }
        return null;
    }, [isAuthenticated, households, householdsLoading]);

    // Derive members directly from storage
    const members = useMemo<HouseholdMember[]>(() => {
        if (!isAuthenticated) return [];
        return storage.get<HouseholdMember[]>('tandem_household_members', []);
    }, [isAuthenticated, households?.length]);

    // Derive loading state
    const isLoading = useMemo<boolean>(() => {
        if (!isAuthenticated) return false;
        return householdsLoading;
    }, [isAuthenticated, householdsLoading]);

    const setHousehold = useCallback((newHousehold: Household | null) => {
        if (newHousehold) {
            storage.set('tandem_household', newHousehold);
            lastHouseholdIdRef.current = newHousehold.id;
            // Invalidate queries to trigger re-fetch
            queryClientRef.current.invalidateQueries({ queryKey: ['households'] });
        } else {
            storage.remove('tandem_household');
            lastHouseholdIdRef.current = null;
            // Invalidate queries to trigger re-fetch
            queryClientRef.current.invalidateQueries({ queryKey: ['households'] });
        }
    }, []);

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