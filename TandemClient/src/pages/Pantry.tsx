import React, { useState, useCallback,  } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/shared/PageHeader';
import { ActionButtons } from '../components/shared/ActionButtons';
import { Plus, Search, AlertTriangle, Package } from 'lucide-react';
import { usePantry } from '../hooks/usePantry';
import { useModal } from '../hooks/useModal';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import type { PantryItem, PantryFormData } from '../types/pantry.types';
import  { PANTRY_CATEGORIES, PANTRY_LOCATIONS } from '../utils/constants';

// Default form data constant
const DEFAULT_FORM_DATA: PantryFormData = {
  name: '',
  quantity: 1,
  unit: 'pieces',
  expiry: '',
  location: 'Fridge',
  category: 'Other',
};

export const Pantry: React.FC = () => {
  const {
    items,
    filteredItems,
    expiringSoon,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    saveItem,
    deleteItem,
    calculateDaysUntilExpiry,
    isSaving,
    
  } = usePantry();

  const modal = useModal();
  const deleteConfirm = useConfirmDialog();

  const [editingItem, setEditingItem] = useState<PantryItem | null>(null);
  const [formData, setFormData] = useState<PantryFormData>(DEFAULT_FORM_DATA);

  // Reset form to default state
  const resetForm = useCallback(() => {
    setEditingItem(null);
    setFormData(DEFAULT_FORM_DATA);
  }, []);

  const handleOpenAdd = useCallback(() => {
    resetForm();
    modal.open();
  }, [resetForm, modal]);

  const handleOpenEdit = useCallback((item: PantryItem) => {
    setEditingItem(item);
    setFormData(item);
    modal.open();
  }, [modal]);

  const handleSave = useCallback(async () => {
    const success = await saveItem(formData, editingItem);
    if (success) {
      modal.close();
      resetForm();
    }
  }, [formData, editingItem, saveItem, modal, resetForm]);

  const handleDelete = useCallback((id: string) => {
    deleteConfirm.open(id);
  }, [deleteConfirm]);

  const handleConfirmDelete = useCallback(() => {
    deleteConfirm.confirm((id) => {
      deleteItem(id);
    });
  }, [deleteConfirm, deleteItem]);

  // Format expiry date for display
  const formatExpiryDate = useCallback((expiry: string, daysUntilExpiry: number) => {
    if (!expiry || expiry.trim() === '') {
      return { text: 'Not set', className: 'text-gray-500 italic' };
    }

    const dateText = new Date(expiry).toLocaleDateString();
    const daysText = daysUntilExpiry >= 0 
      ? (daysUntilExpiry === 0 ? 'Today' : `${daysUntilExpiry}d`)
      : 'Expired';

    return {
      text: `${dateText} (${daysText})`,
      className: daysUntilExpiry <= 3 && daysUntilExpiry >= 0 
        ? 'text-orange-600' 
        : 'text-gray-900',
    };
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Pantry' }]} />

      <PageHeader
        title="Pantry"
        description="Manage your inventory and track expiry dates"
        action={{
          label: 'Add Item',
          onClick: handleOpenAdd,
          icon: Plus,
        }}
      />

      {/* Expiring Soon Alert */}
      {expiringSoon.length > 0 && (
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">
                  {expiringSoon.length} item{expiringSoon.length > 1 ? 's' : ''} expiring soon
                </h3>
                <div className="flex flex-wrap gap-2">
                  {expiringSoon.map((item) => {
                    const days = calculateDaysUntilExpiry(item.expiry);
                    return (
                      <span
                        key={item.id}
                        className="inline-block px-2 py-1 bg-white rounded text-sm text-orange-800 border border-orange-200"
                      >
                        {item.name} ({days === 0 ? 'Today' : `${days}d`})
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search pantry items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {PANTRY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all border-2
                    ${selectedCategory === cat
                      ? 'bg-[#53389E] text-white border-[#53389E] shadow-md shadow-purple-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent hover:border-gray-300'
                    }
                  `}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pantry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const daysUntilExpiry = calculateDaysUntilExpiry(item.expiry);
          const expiryDisplay = formatExpiryDate(item.expiry, daysUntilExpiry);
          const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;

          return (
            <Card
              key={item.id}
              hover
              className={isExpiringSoon ? 'border-orange-300' : ''}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium border border-purple-200">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium border border-purple-100">
                        {item.location}
                      </span>
                    </div>
                  </div>
                  {isExpiringSoon && (
                    <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium text-gray-900">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${expiryDisplay.className}`}>
                      {expiryDisplay.text}
                    </span>
                  </div>
                </div>

                <ActionButtons
                  onEdit={() => handleOpenEdit(item)}
                  onDelete={() => handleDelete(item.id)}
                  variant="ghost"
                  size="sm"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && items.length === 0 && (
        <Card>
          <CardContent>
            <EmptyState
              icon={Package}
              title="Your pantry is empty"
              description="Start by adding items to track your inventory and expiry dates."
              action={{
                label: 'Add First Item',
                onClick: handleOpenAdd,
                icon: Plus,
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingItem ? 'Edit Pantry Item' : 'Add Pantry Item'}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={modal.close} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} isLoading={isSaving}>
              {editingItem ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chicken Breast"
            required
            disabled={isSaving}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity.toString()}
              onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              required
              disabled={isSaving}
              min="0"
              step="0.01"
            />

            <Input
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., lbs, pieces"
              required
              disabled={isSaving}
            />
          </div>

          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiry}
            onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
            required
            disabled={isSaving}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <select
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={isSaving}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {PANTRY_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isSaving}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {PANTRY_CATEGORIES.filter(cat => cat !== 'all').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={handleConfirmDelete}
        title="Delete Pantry Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};