import type { PantryItem, BackendPantryItem } from '../../types/pantry.types';

export const transformPantryItem = (item: BackendPantryItem): PantryItem => ({
  id: String(item.id),
  name: item.name,
  quantity: item.quantity,
  unit: item.unit,
  expiry: item.expiry_date || item.expiry || '',
  location: item.location,
  category: item.category,
});

export const transformToBackend = (item: PantryItem): Omit<BackendPantryItem, 'id'> => {
  const { expiry, ...rest } = item;
  return {
    ...rest,
    expiry_date: expiry,
  };
};

