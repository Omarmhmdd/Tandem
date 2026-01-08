import { useMemo } from 'react';
import { useHealthLogs, useHealthLogMutation, useDeleteHealthLog } from '../api/queries/health';
import type { LogEntry } from '../types/health.types';
import { showToast } from '../utils/toast';
import { transformHealthLogToBackend } from '../utils/transforms/healthTransforms';
import {getMoodEmoji,calculateAvgSleep,calculateTotalActivities,calculateTotalFoodItems,} from '../utils/healthHelpers';

export const useHealthPage = () => {
  const { data: entries = [], isLoading } = useHealthLogs();
  const mutation = useHealthLogMutation();
  const deleteMutation = useDeleteHealthLog();

  const avgSleep = useMemo(() => calculateAvgSleep(entries), [entries]);
  const totalActivities = useMemo(() => calculateTotalActivities(entries), [entries]);
  const totalFoodItems = useMemo(() => calculateTotalFoodItems(entries), [entries]);

  const saveEntry = async (entry: Omit<LogEntry, 'id'> & { confidence?: number; originalText?: string }): Promise<boolean> => {
    try {
      const backendData = transformHealthLogToBackend(entry);
      await mutation.mutateAsync(backendData);
      showToast('Health log entry saved successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save entry';
      showToast(errorMessage, 'error');
      return false;
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast('Entry deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete entry', 'error');
    }
  };

  return {
    entries,
    isLoading,
    avgSleep,
    totalActivities,
    totalFoodItems,
    saveEntry,
    deleteEntry,
    getMoodEmoji,
  };
};