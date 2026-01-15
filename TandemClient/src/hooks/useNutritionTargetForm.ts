import { useState, useEffect, useCallback, useRef } from 'react';
import { useNutritionTarget, useUpdateNutritionTarget } from '../api/queries/nutrition';
import { useModal } from './useModal';
import { showToast } from '../utils/toast';
import { targetToFormData, validateNutritionTargetForm } from '../utils/nutritionHelpers';
import type { NutritionTargetFormData, BackendNutritionTarget } from '../types/nutrition.types';


export const useNutritionTargetForm = (onSuccess?: () => void) => {
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  // Always call useNutritionTarget - hooks must be called unconditionally
  // The hook itself handles the enabled flag internally
  // Always enabled since we need the target data for the form
  const { data: currentTarget, isLoading: targetLoading } = useNutritionTarget(true);
  const updateTargetMutation = useUpdateNutritionTarget();
  const targetModal = useModal();

  const [targetForm, setTargetForm] = useState<NutritionTargetFormData>({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  // Update form when currentTarget changes
  useEffect(() => {
    if (currentTarget) {
      const formData = targetToFormData(currentTarget);
      setTargetForm(formData);
    }
  }, [currentTarget]);

  // Custom open function - target data is always loaded, just open modal
  const openModal = useCallback(() => {
    targetModal.open();
  }, [targetModal]);

  const handleSaveTargets = useCallback(async (): Promise<BackendNutritionTarget | null> => {
    // Validate all fields
    const validation = validateNutritionTargetForm(targetForm);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid input', 'error');
      return null;
    }

    try {
      const payload = {
        calories: parseInt(targetForm.calories, 10),
        protein: parseInt(targetForm.protein, 10),
        carbs: parseInt(targetForm.carbs, 10),
        fat: parseInt(targetForm.fat, 10),
      };

      const savedTarget = await updateTargetMutation.mutateAsync(payload);
      
      showToast('Nutrition targets updated successfully!', 'success');
      targetModal.close();
      
      // Use ref to call onSuccess (avoids dependency issues)
      if (onSuccessRef.current) {
        onSuccessRef.current();
      }
      
      return savedTarget;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update targets';
      showToast(`Failed to update targets: ${errorMessage}`, 'error');
      return null;
    }
  }, [targetForm, updateTargetMutation, targetModal]);

  return {
    targetForm,
    setTargetForm,
    targetLoading,
    targetModal: {
      ...targetModal,
      open: openModal,
    },
    handleSaveTargets,
    isSaving: updateTargetMutation.isPending,
    currentTarget,
  };
};