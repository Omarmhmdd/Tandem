/**
 * Household types
 */

export interface Household {
  id: string;
  name: string;
  primaryUserId: string;
  partnerUserId?: string;
  inviteCode?: string;
}

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: 'primary' | 'partner';
  status: 'active' | 'pending' | 'declined';
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface HouseholdContextType {
  household: Household | null;
  members: HouseholdMember[];
  isLoading: boolean;
  setHousehold: (household: Household | null) => void;
  invitePartner: (email: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<boolean>;
}

// Backend response types (snake_case from API)
export interface BackendHousehold {
  id: number | string;
  name: string;
  primary_user_id: number | string;
  partner_user_id?: number | string;
  invite_code?: string;
}

export interface BackendHouseholdMember {
  id: number | string;
  user_id: number | string;
  household_id: number | string;
  role: 'primary' | 'partner';
  status: 'active' | 'pending' | 'declined';
  user?: {
    id: number | string;
    first_name: string;
    last_name: string;
    email: string;
  };
}