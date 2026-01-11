import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/Logo';
import { useCreateHousehold, useJoinHousehold } from '../api/queries/household';
import { useHousehold } from '../contexts/HouseholdContext';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '../utils/toast';
import { Users, Plus, Key } from 'lucide-react';

export const HouseholdSetup: React.FC = () => {
  const navigate = useNavigate();
  const { household } = useHousehold();
  const queryClient = useQueryClient();
  const createMutation = useCreateHousehold();
  const joinMutation = useJoinHousehold();
  
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [householdName, setHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pendingNavigationRef = useRef(false);

  // Watch for household to be set after creation/join, then navigate to dashboard
  useEffect(() => {
    if (pendingNavigationRef.current && household && !isLoading) {
      pendingNavigationRef.current = false;
      // Small delay to ensure all context updates are complete
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  }, [household, isLoading, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdName.trim()) {
      showToast('Please enter a household name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newHousehold = await createMutation.mutateAsync(householdName.trim());
      
      // The mutation's onSuccess already invalidates the households query
      // Wait for the query to refetch and context to update
      showToast('Household created successfully!', 'success');
      pendingNavigationRef.current = true;
      
      // Refetch to ensure context updates
      await queryClient.refetchQueries({ queryKey: ['households'] });
      
      // Small delay to allow context to update, then navigate
      setTimeout(() => {
        if (household || newHousehold) {
          navigate('/');
        }
      }, 200);
    } catch (error: any) {
      showToast(error.message || 'Failed to create household', 'error');
      pendingNavigationRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      showToast('Please enter an invite code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const joinedHousehold = await joinMutation.mutateAsync(inviteCode.trim().toUpperCase());
      
      // The mutation's onSuccess already invalidates the households query
      // Wait for the query to refetch and context to update
      showToast('Successfully joined household!', 'success');
      pendingNavigationRef.current = true;
      
      // Refetch to ensure context updates
      await queryClient.refetchQueries({ queryKey: ['households'] });
      
      // Small delay to allow context to update, then navigate
      setTimeout(() => {
        if (household || joinedHousehold) {
          navigate('/');
        }
      }, 200);
    } catch (error: any) {
      showToast(error.message || 'Invalid invite code', 'error');
      pendingNavigationRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              mode === 'create'
                ? 'border-brand-primary bg-brand-light/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Plus className={`w-6 h-6 mx-auto mb-2 ${mode === 'create' ? 'text-brand-primary' : 'text-gray-400'}`} />
            <h3 className={`font-semibold ${mode === 'create' ? 'text-brand-primary' : 'text-gray-600'}`}>
              Create Household
            </h3>
            <p className="text-sm text-gray-500 mt-1">Start a new household</p>
          </button>
          
          <button
            onClick={() => setMode('join')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              mode === 'join'
                ? 'border-brand-primary bg-brand-light/10'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Key className={`w-6 h-6 mx-auto mb-2 ${mode === 'join' ? 'text-brand-primary' : 'text-gray-400'}`} />
            <h3 className={`font-semibold ${mode === 'join' ? 'text-brand-primary' : 'text-gray-600'}`}>
              Join Household
            </h3>
            <p className="text-sm text-gray-500 mt-1">Join with invite code</p>
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === 'create' ? (
                <>
                  <Users className="w-5 h-5" />
                  Create New Household
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  Join Household
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === 'create' ? (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 mb-1">
                    Household Name
                  </label>
                  <Input
                    id="householdName"
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    placeholder="The Smith Household"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a name for your household (e.g., "The Smith Household")
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Household'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Invite Code
                  </label>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    required
                    disabled={isLoading}
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the invite code provided by your partner
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Joining...' : 'Join Household'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

