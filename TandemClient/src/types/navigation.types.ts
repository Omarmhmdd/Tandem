import type React from 'react';


export interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

