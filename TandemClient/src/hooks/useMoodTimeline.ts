import { useState, useEffect, useMemo, useRef } from 'react';
import { useMoodTimeline, useAutoAnnotateMood } from '../api/queries/mood';
import type { MoodEntry, Annotation } from '../types/mood.types';
import { useAuth } from '../contexts/AuthContext';
import {prepareChartData,calculateAverageMoods,groupMoodsByDate,} from '../utils/moodHelpers';
export const useMoodTimelinePage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month'); // Default to month to show more data
  
  // Memoize dates to prevent recalculating on every render
  const { startDateStr, endDate } = useMemo(() => {
    const end = new Date().toISOString().split('T')[0];
    const start = new Date();
    if (timeRange === 'week') {
      start.setDate(start.getDate() - 7);
    } else {
      // For month, go back 30 days to include more data
      start.setDate(start.getDate() - 30);
    }
    const startStr = start.toISOString().split('T')[0];
    return { startDateStr: startStr, endDate: end };
  }, [timeRange]);

  const { data: moods = [], isLoading: moodsLoading } = useMoodTimeline(startDateStr, endDate);
  const autoAnnotateMutation = useAutoAnnotateMood();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotationRequestedRef = useRef<string>(''); // Track if annotation was requested for this date range
  
  // Get partner user ID from mood entries (any user that's not the current user)
  const currentUserId = user?.id?.toString() || null;
  const partnerUserId = useMemo(() => {
    if (!currentUserId || moods.length === 0) return null;
    const userIds = moods
      .map((m: MoodEntry) => String(m.userId || ''))
      .filter((id: string) => id !== '');
    const uniqueUserIds: string[] = Array.from(new Set<string>(userIds));
    return uniqueUserIds.find((id: string) => id !== currentUserId) || null;
  }, [moods, currentUserId]);

  // Auto-annotation effect - only run when date range changes or when moods finish loading
  // Uses ref-based tracking to prevent infinite loops
  useEffect(() => {
    // Skip if still loading
    if (moodsLoading) return;
    
    // Skip if no moods
    if (moods.length === 0) return;
    
    
    const dateRangeKey = `${startDateStr}-${endDate}`;
    
    // Reset annotations when date range changes
    if (annotationRequestedRef.current !== '' && annotationRequestedRef.current !== dateRangeKey) {
      annotationRequestedRef.current = '';
      setAnnotations([]);
      return;
    }
    
    // Skip if already requested for this date range
    if (annotationRequestedRef.current === dateRangeKey) return;
    
    // Skip if mutation is already in progress
    if (autoAnnotateMutation.isPending) return;
    
    // Mark as requested BEFORE calling to prevent race conditions
    annotationRequestedRef.current = dateRangeKey;
    
    // Store mutation reference to avoid stale closure
    const mutation = autoAnnotateMutation;
    const currentDateRangeKey = dateRangeKey;
    
    // Call annotation API
    mutation.mutate(
      { startDate: startDateStr, endDate },
      {
        onSuccess: (data) => {
          // Only update if this is still the current date range (prevents stale updates)
          if (annotationRequestedRef.current === currentDateRangeKey) {
            setAnnotations(data);
          }
        },
        onError: () => {
          // Reset ref on error so user can retry
          if (annotationRequestedRef.current === currentDateRangeKey) {
            annotationRequestedRef.current = '';
          }
        },
      }
    );
    //Only depend on stable values to prevent infinite loops
    // - moodsLoading: changes when query loading state changes
    // - startDateStr/endDate: changes when timeRange changes
    // - moods.length: intentionally excluded to prevent re-triggers when moods array reference changes

  }, [moodsLoading, startDateStr, endDate]);

  // Memoize chart data calculation
  const chartData = useMemo(() => {
    return prepareChartData(moods, currentUserId, partnerUserId);
  }, [moods, currentUserId, partnerUserId]);

  // Memoize average moods calculation
  const { youAvg, partnerAvg } = useMemo(() => {
    return calculateAverageMoods(moods, currentUserId, partnerUserId);
  }, [moods, currentUserId, partnerUserId]);

  // Memoize grouped moods
  const groupedMoods = useMemo(() => {
    return groupMoodsByDate(moods);
  }, [moods]);

  return {
    moods,
    annotations,
    timeRange,
    setTimeRange,
    chartData,
    youAvg,
    partnerAvg,
    groupedMoods,
  };
};

