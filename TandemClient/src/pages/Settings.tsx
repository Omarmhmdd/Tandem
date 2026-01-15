import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { useHouseholdInviteCode, useRegenerateInviteCode, useUpdateHousehold } from '../api/queries/household';
import { useUpdateProfile } from '../api/queries/auth';
import { Settings as SettingsIcon, Copy, RefreshCw, Key, Users, Check } from 'lucide-react';
import { showToast } from '../utils/toast';

export const Settings: React.FC = () => {
  const { household } = useHousehold();
  const { user } = useAuth();
  const { data: inviteCode, isLoading: inviteCodeLoading } = useHouseholdInviteCode(household?.id || '');
  const regenerateMutation = useRegenerateInviteCode();
  const updateHouseholdMutation = useUpdateHousehold();
  const updateProfileMutation = useUpdateProfile();
  const [copied, setCopied] = useState(false);
  
  const [householdName, setHouseholdName] = useState(household?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const isPrimary = household?.primaryUserId === user?.id;

  // Update local state when props change
  React.useEffect(() => {
    if (household?.name) setHouseholdName(household.name);
  }, [household?.name]);

  React.useEffect(() => {
    if (user?.email) setEmail(user.email);
    if (user?.firstName) setFirstName(user.firstName);
    if (user?.lastName) setLastName(user.lastName);
  }, [user?.email, user?.firstName, user?.lastName]);

  const handleCopyCode = async () => {
    if (!inviteCode) return;

    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      showToast('Invite code copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Failed to copy invite code', 'error');
    }
  };

  const handleRegenerateCode = async () => {
    if (!household?.id) return;

    try {
      await regenerateMutation.mutateAsync(household.id);
      showToast('Invite code regenerated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to regenerate invite code', 'error');
    }
  };

  const handleSaveHousehold = async () => {
    if (!household?.id || !householdName.trim()) {
      showToast('Household name is required', 'error');
      return;
    }

    try {
      await updateHouseholdMutation.mutateAsync({
        householdId: household.id,
        name: householdName.trim(),
      });
      showToast('Household name updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update household name', 'error');
    }
  };

  const handleSaveProfile = async () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      showToast('All fields are required', 'error');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      showToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />

      <PageHeader
        title="Settings"
        description="Manage your household and account settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Household Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              Household Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Household Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  disabled={!isPrimary || updateHouseholdMutation.isPending}
                  className={!isPrimary ? "bg-gray-50" : ""}
                />
                {isPrimary && (
                  <Button
                    onClick={handleSaveHousehold}
                    disabled={updateHouseholdMutation.isPending || !householdName.trim() || householdName === household?.name}
                    isLoading={updateHouseholdMutation.isPending}
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>

            {isPrimary && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={inviteCode || ''}
                      disabled
                      className="pl-10 bg-gray-50 font-mono text-lg tracking-wider uppercase"
                      placeholder={inviteCodeLoading ? 'Loading...' : 'No invite code'}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCopyCode}
                    disabled={!inviteCode || copied}
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this code with your partner so they can join your household
                </p>
                <Button
                  variant="primary"
                  onClick={handleRegenerateCode}
                  disabled={regenerateMutation.isPending || !household?.id}
                  icon={RefreshCw}
                  className="mt-3 w-full"
                >
                  {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate Code'}
                </Button>
              </div>
            )}

            {!isPrimary && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Only the primary household member can manage invite codes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-brand-primary" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateProfileMutation.isPending}
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={updateProfileMutation.isPending}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={updateProfileMutation.isPending}
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={
                updateProfileMutation.isPending ||
                !email.trim() ||
                !firstName.trim() ||
                !lastName.trim() ||
                (email === user?.email && firstName === user?.firstName && lastName === user?.lastName)
              }
              isLoading={updateProfileMutation.isPending}
              className="w-full"
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

