import type { GroceryPartner, BackendGroceryPartner } from '../../types/meal.types';


export const transformGroceryPartner = (backendPartner: BackendGroceryPartner): GroceryPartner => {
  return {
    id: String(backendPartner.id || ''),
    name: backendPartner.name || 'Unknown Partner',
    logo: backendPartner.logo,
    deliveryFee: backendPartner.delivery_fee ?? undefined,
    minOrder: backendPartner.min_order ?? undefined,
    estimatedDelivery: backendPartner.estimated_delivery ?? undefined,
  };
};


export const transformGroceryPartners = (backendPartners: BackendGroceryPartner[]): GroceryPartner[] => {
  return backendPartners.map(transformGroceryPartner);
};

