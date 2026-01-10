    import { useState, useMemo, useCallback } from 'react';
    import { usePantryItems, usePantryMutation, useDeletePantryItem } from '../api/queries/pantry';
    import type { PantryItem, PantryFormData } from '../types/pantry.types';
    import { showToast } from '../utils/toast';
    import { calculateDaysUntilExpiry, filterPantryItems, getExpiringItems,validatePantryForm,createPantryItemData,} from '../utils/pantryHelpers';

    export const usePantry = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const { data: items = [], isLoading, error } = usePantryItems();
    const mutation = usePantryMutation();
    const deleteMutation = useDeletePantryItem();

    // Memoize expensive calculations
    const filteredItems = useMemo(
        () => filterPantryItems(items, searchQuery, selectedCategory),
        [items, searchQuery, selectedCategory]
    );

    const expiringSoon = useMemo(
        () => getExpiringItems(items, 3),
        [items]
    );

    const saveItem = useCallback(async (formData: PantryFormData, editingItem: PantryItem | null): Promise<boolean> => {
        // Validate form data
        const validationError = validatePantryForm(formData);
        if (validationError) {
        showToast(validationError, 'error');
        return false;
        }

        // Create item data (backend will generate ID for new items)
        const itemData = createPantryItemData(formData, editingItem?.id) as PantryItem;

        try {
        await mutation.mutateAsync({ 
            item: itemData, 
            isEdit: !!editingItem 
        });
        showToast(
            editingItem ? 'Item updated successfully' : 'Item added to pantry',
            'success'
        );
        return true;
        } catch (error) {
        showToast('Failed to save item', 'error');
        return false;
        }
    }, [mutation]);

    const deleteItem = useCallback(async (id: string): Promise<void> => {
        try {
        await deleteMutation.mutateAsync(id);
        showToast('Item deleted successfully', 'success');
        } catch (error) {
        showToast('Failed to delete item', 'error');
        }
    }, [deleteMutation]);

    return {
        items,
        filteredItems,
        expiringSoon,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isLoading,
        isSaving: mutation.isPending,
        isDeleting: deleteMutation.isPending,
        error,
        saveItem,
        deleteItem,
        calculateDaysUntilExpiry,
    };
    };