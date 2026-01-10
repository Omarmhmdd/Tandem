import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useHouseholdMembers } from '../api/queries/household';
import type { PartnerIntake, NutritionTargets } from '../types/nutrition.types';

/**
 * Hook to calculate nutrition statistics from partners data
 */
export const useNutritionCalculations = (
  partnersIntake: PartnerIntake[],
  targets: NutritionTargets
) => {
  const { user } = useAuth();
  const { members, household } = useHousehold();
  const currentUserId = user?.id || null;
  
  // Fetch household members if household exists (this ensures we have partner info)
  const { data: fetchedMembers = [] } = useHouseholdMembers(household?.id || '');
  
  // Use fetched members if available, otherwise fallback to context members
  const allMembers = useMemo(() => {
    if (fetchedMembers && fetchedMembers.length > 0) {
      return fetchedMembers;
    }
    return members || [];
  }, [fetchedMembers, members]);

  // Get unique partners, but ensure both current user and partner appear even if one has no data
  // IMPORTANT: Use actual data from partnersIntake for each user, don't duplicate
  const uniquePartnersIntake = useMemo(() => {
    if (!currentUserId) {
      return partnersIntake;
    }

    const currentUserIdStr = String(currentUserId);
    
    // First, identify partner userId from household/members
    // ALWAYS find partner to ensure both users show in comparison
    let partnerUserIdStr: string | null = null;
    let partnerName: string = 'Partner';

    // Try to find partner from fetched/context members first (has more info including name)
    if (allMembers && Array.isArray(allMembers) && allMembers.length > 0) {
      // Find any active member that's NOT the current user (this is the partner)
      const partnerMember = allMembers.find(m => {
        if (!m || m.status !== 'active') return false;
        const memberUserIdStr = String(m.userId);
        return memberUserIdStr !== currentUserIdStr;
      });

      if (partnerMember) {
        partnerUserIdStr = String(partnerMember.userId);
        // Get partner name from member.user if available
        if (partnerMember.user?.first_name) {
          partnerName = partnerMember.user.first_name;
        } else if (partnerMember.role === 'partner') {
          partnerName = 'Partner';
        } else {
          partnerName = 'Member';
        }
      }
    }

    // Fallback: use household IDs to find partner
    // IMPORTANT: Current user could be either primary OR partner, so check both
    if (!partnerUserIdStr && household) {
      const primaryId = household.primaryUserId ? String(household.primaryUserId) : null;
      const partnerId = household.partnerUserId ? String(household.partnerUserId) : null;
      
      // If current user is primary, partner is partnerUserId
      // If current user is partner, partner is primaryUserId
      if (primaryId === currentUserIdStr && partnerId && partnerId !== currentUserIdStr) {
        // Current user is primary, partner is partnerUserId
        partnerUserIdStr = partnerId;
      } else if (partnerId === currentUserIdStr && primaryId && primaryId !== currentUserIdStr) {
        // Current user is partner, partner is primaryUserId
        partnerUserIdStr = primaryId;
      } else if (primaryId && primaryId !== currentUserIdStr) {
        // Current user is neither, use primary as partner (fallback)
        partnerUserIdStr = primaryId;
      } else if (partnerId && partnerId !== currentUserIdStr) {
        // Current user is neither, use partner as partner (fallback)
        partnerUserIdStr = partnerId;
      }
      
      // Try to find name from allMembers after identifying partnerUserId
      if (partnerUserIdStr && allMembers && Array.isArray(allMembers)) {
        const foundMember = allMembers.find(m => String(m.userId) === partnerUserIdStr);
        if (foundMember?.user?.first_name) {
          partnerName = foundMember.user.first_name;
        }
      }
    }

    // Now build the result array with actual data from partnersIntake for each user
    const result: PartnerIntake[] = [];
    
    // Find current user's actual data from partnersIntake
    const currentUserData = partnersIntake.find(p => String(p.userId) === currentUserIdStr);
    if (currentUserData) {
      // Use actual data from backend
      result.push({
        userId: currentUserIdStr,
        name: currentUserData.name || user?.firstName || 'You',
        today: currentUserData.today || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        weekly: currentUserData.weekly || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      });
    } else {
      // Current user not in response, add with zeros
      result.push({
        userId: currentUserIdStr,
        name: user?.firstName || 'You',
        today: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        weekly: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      });
    }

    // ALWAYS add partner if we found one (regardless of whether they have data)
    // This ensures both users show in Individual Comparison
    if (partnerUserIdStr && partnerUserIdStr !== currentUserIdStr) {
      // Check if partner already exists in result (shouldn't happen, but be safe)
      const partnerAlreadyExists = result.some(p => String(p.userId) === partnerUserIdStr);
      
      if (!partnerAlreadyExists) {
        // Find partner's actual data from partnersIntake
        const partnerData = partnersIntake.find(p => String(p.userId) === partnerUserIdStr);
        if (partnerData) {
          // Use actual partner data from backend - this is their real intake
          result.push({
            userId: partnerUserIdStr,
            name: partnerData.name || partnerName,
            today: partnerData.today || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            weekly: partnerData.weekly || { calories: 0, protein: 0, carbs: 0, fat: 0 },
          });
        } else {
          // Partner exists in household but has no nutrition data yet - show with zeros
          result.push({
            userId: partnerUserIdStr,
            name: partnerName,
            today: { calories: 0, protein: 0, carbs: 0, fat: 0 },
            weekly: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          });
        }
      }
    }

    // Debug: Log to help diagnose why partner might not be showing
    // console.log('useNutritionCalculations - Result:', {
    //   currentUserId: currentUserIdStr,
    //   partnerUserIdStr,
    //   partnerName,
    //   householdPartnerId: household?.partnerUserId,
    //   householdPrimaryId: household?.primaryUserId,
    //   allMembersCount: allMembers.length,
    //   resultCount: result.length,
    //   result: result.map(r => ({ userId: r.userId, name: r.name }))
    // });

    // Current user is already first, no need to sort
    return result;
  }, [partnersIntake, allMembers, household, currentUserId, user?.firstName]);

  return {
    uniquePartnersIntake,
  };
};