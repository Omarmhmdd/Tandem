import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { useHousehold } from '../contexts/HouseholdContext';
import { useAuth } from '../contexts/AuthContext';
import { useHouseholdInviteCode, useRegenerateInviteCode } from '../api/queries/household';
import { Settings as SettingsIcon, Copy, RefreshCw, Key, Users, Check } from 'lucide-react';
import { showToast } from '../utils/toast';

export const Settings: React.FC = () => {
  const { household } = useHousehold();
  const { user } = useAuth();
  const { data: inviteCode, isLoading: inviteCodeLoading } = useHouseholdInviteCode(household?.id || '');
  const regenerateMutation = useRegenerateInviteCode();
  const [copied, setCopied] = useState(false);

  const isPrimary = household?.primaryUserId === user?.id;

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
              <Input
                value={household?.name || ''}
                disabled
                className="bg-gray-50"
              />
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
                  variant="outline"
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
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

