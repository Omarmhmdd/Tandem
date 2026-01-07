import type { PantryItem } from '../types/pantry.types';
export const calculateDaysUntilExpiry = (expiryDate: string): number => {
  if (!expiryDate || expiryDate.trim() === '') {
    return Infinity; // No expiry date set
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  // Check if date is valid
  if (isNaN(expiry.getTime())) {
    return Infinity; // Invalid date
  }
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};


export const getExpiringItems = (items: PantryItem[], days: number = 3): PantryItem[] => {
  return items.filter(item => {
    if (!item.expiry || item.expiry.trim() === '') {
      return false; // Skip items without expiry dates
    }
    const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry);
    return daysUntilExpiry <= days && daysUntilExpiry >= 0;
  });
};

export const filterPantryItems = (items: PantryItem[],searchQuery: string,category: string): PantryItem[] => {
  return items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || item.category === category;
    return matchesSearch && matchesCategory;
  });
};

export const AUTO_ORDER_DEFAULT_EXPIRY_DAYS = 7;


