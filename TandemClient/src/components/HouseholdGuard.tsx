import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHousehold } from '../contexts/HouseholdContext';
import { useHouseholds } from '../api/queries/household';
import type { HouseholdGuardProps } from '../types/component.types';

export const HouseholdGuard: React.FC<HouseholdGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { household, isLoading: householdLoading } = useHousehold();
  // Only fetch households if authenticated
  const { data: households, isLoading: householdsLoading } = useHouseholds();

  const isLoading = householdLoading || (isAuthenticated && householdsLoading);
  const isOnSetupPage = location.pathname === '/household-setup';

  // If not authenticated, let ProtectedRoute handle it
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Allow access to household-setup page
  if (isOnSetupPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading household...</p>
        </div>
      </div>
    );
  }

  // If no household in context and no households from API, redirect to setup
  if (!household && (!households || households.length === 0)) {
    return <Navigate to="/household-setup" replace />;
  }

  return <>{children}</>;
};

