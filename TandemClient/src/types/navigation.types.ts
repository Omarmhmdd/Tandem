import type React from 'react';

/**
 * Navigation types
 */
export interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

