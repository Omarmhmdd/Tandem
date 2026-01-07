import type { Household, HouseholdMember, BackendHousehold, BackendHouseholdMember } from '../../types/household.type';

export const transformHousehold = (h: BackendHousehold): Household => ({
  id: String(h.id),
  name: h.name || '',
  primaryUserId: String(h.primary_user_id),
  partnerUserId: h.partner_user_id ? String(h.partner_user_id) : undefined,
  inviteCode: h.invite_code,
});

export const transformMember = (m: BackendHouseholdMember): HouseholdMember => ({
  id: String(m.id),
  userId: String(m.user_id),
  householdId: String(m.household_id),
  role: m.role || 'partner',
  status: m.status || 'pending',
  user: m.user ? {
    id: String(m.user.id),
    first_name: m.user.first_name || '',
    last_name: m.user.last_name || '',
    email: m.user.email || '',
  } : undefined,
});

