import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/Button';
import { ShoppingCart, Truck, CheckCircle2, X } from 'lucide-react';
import type { AutoOrderProps, GroceryPartner, ShoppingListItem } from '../types/meal.types';
import type { GroceryPartnersResponse } from '../types/api.types';
import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { showToast } from '../utils/toast';
import { transformGroceryPartners } from '../utils/transforms/autoOrderTransforms';

export const AutoOrder: React.FC<AutoOrderProps> = ({ shoppingList, onClose,onOrderComplete,}) => {
  const queryClient = useQueryClient();
  const [partners, setPartners] = useState<GroceryPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<GroceryPartner | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const hasOrderedRef = useRef(false);

  const neededItems = shoppingList.filter((item) => item.needed);

  // Fetch available grocery partners from API
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoadingPartners(true);
        const response = await apiClient.get<GroceryPartnersResponse>(ENDPOINTS.AUTO_ORDER_PARTNERS);
        const partners = response.data?.partners || [];
        setPartners(transformGroceryPartners(partners));
      } catch (error) {
        console.error('Failed to fetch grocery partners:', error);
        setPartners([]);
      } finally {
        setIsLoadingPartners(false);
      }
    };

    fetchPartners();
  }, []);

  // Reset sent state when shopping list changes
  useEffect(() => {
    if (neededItems.length === 0) {
      setSent(false);
      hasOrderedRef.current = false;
    }
  }, [neededItems.length]);

  const handleSend = async () => {
    if (!selectedPartner) {
      showToast('Please select a grocery partner first', 'warning');
      return;
    }

    if (neededItems.length === 0) {
      showToast('No items to order', 'info');
      return;
    }

    if (hasOrderedRef.current) {
      return; // Prevent duplicate orders
    }

    setIsSending(true);

    try {
      hasOrderedRef.current = true;

      await apiClient.post(ENDPOINTS.AUTO_ORDER_SEND, {
        partner_id: selectedPartner.id,
        shopping_list: neededItems,
      });

      // Invalidate pantry query to refresh data after items are added
      // This will trigger shopping list recalculation since it depends on pantryItems
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      
      // Also invalidate meal plans to ensure shopping list recalculates with updated pantry
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });

      setSent(true);

      // Call onOrderComplete callback to mark items as ordered in shopping list
      // NOTE: Backend already adds items to pantry, so we DON'T call onAddToPantry here
      // onAddToPantry is only for manual "Add to Pantry" button, not auto-order
      if (onOrderComplete) {
        onOrderComplete(neededItems);
      }

      showToast(`Order sent to ${selectedPartner.name}! Items added to pantry.`, 'success');
    } catch (error) {
      hasOrderedRef.current = false;
      const errorMessage = error instanceof Error ? error.message : 'Failed to send order';
      showToast(errorMessage, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const totalItems = neededItems.length;

  if (sent) {
    return (
      <div className="flex flex-col h-full max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-primary" />
            Auto-Order Shopping List
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close auto-order modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Sent!</h3>
          <p className="text-gray-600 mb-4">
            Your shopping list has been sent to {selectedPartner?.name}. 
            Ordered items have been added to your pantry.
          </p>
          {onClose && (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-brand-primary" />
          Auto-Order Shopping List
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close auto-order modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Shopping List Summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Shopping List ({totalItems} items)
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
            {totalItems === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No items to order.</p>
            ) : (
              neededItems.map((item: ShoppingListItem) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-900">{item.name}</span>
                  {item.quantity && (
                    <span className="text-xs text-gray-500">{item.quantity}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Partner Selection */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Grocery Partner</h3>
          {isLoadingPartners ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">Loading grocery partners...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">No grocery partners available at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((partner: GroceryPartner) => (
                <div
                  key={partner.id}
                  onClick={() => setSelectedPartner(partner)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPartner?.id === partner.id
                      ? 'border-brand-primary bg-brand-light/20'
                      : 'border-gray-200 hover:border-brand-light'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                      {(partner.deliveryFee !== undefined || partner.minOrder !== undefined || partner.estimatedDelivery) && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          {partner.estimatedDelivery && (
                            <span>Delivery: {partner.estimatedDelivery}</span>
                          )}
                          {partner.deliveryFee !== undefined && (
                            <span>Fee: ${partner.deliveryFee}</span>
                          )}
                          {partner.minOrder !== undefined && (
                            <span>Min: ${partner.minOrder}</span>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedPartner?.id === partner.id && (
                      <CheckCircle2 className="w-6 h-6 text-brand-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Footer */}
      <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
        {!selectedPartner && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              👆 Select a grocery partner above to place your order
            </p>
          </div>
        )}
        <div className="flex gap-3">
          {onClose && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={!selectedPartner || isSending || totalItems === 0}
            className="flex-1"
            isLoading={isSending}
          >
            {isSending 
              ? 'Placing Order...' 
              : selectedPartner 
                ? `Place Order with ${selectedPartner.name}` 
                : 'Select Partner First'}
          </Button>
        </div>
      </div>
    </div>
  );
};

