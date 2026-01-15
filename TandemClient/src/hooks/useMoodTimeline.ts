import { useState, useEffect, useMemo, useRef } from 'react';
import { useMoodTimeline, useAutoAnnotateMood } from '../api/queries/mood';
import type { MoodEntry, Annotation } from '../types/mood.types';
import { useAuth } from '../contexts/AuthContext';
import {prepareChartData,calculateAverageMoods,groupMoodsByDate,} from '../utils/moodHelpers';
import { formatDateForAPI } from '../utils/dateHelpers';

export const useMoodTimelinePage = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month'); // Default to month to show more data

  // Memoize dates to prevent recalculating on every render
  const { startDateStr, endDate } = useMemo(() => {
    const today = new Date();
    
    // End date: today in UTC
    const endStr = formatDateForAPI(today);
    
    // Start date: calculate based on time range
    const start = new Date(today);
    if (timeRange === 'week') {
      // Last 7 days: today + 6 previous days (7 days total)
      start.setDate(start.getDate() - 6);
    } else {
      // For month, go back 30 days to include more data
      start.setDate(start.getDate() - 30);
    }
    const startStr = formatDateForAPI(start);
    return { startDateStr: startStr, endDate: endStr };
  }, [timeRange]);

  const { data: moods = [], isLoading: moodsLoading } = useMoodTimeline(startDateStr, endDate);
  const autoAnnotateMutation = useAutoAnnotateMood();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotationRequestedRef = useRef<string>(''); // Track if annotation was requested for this date range
  
  // Filter, deduplicate, and limit annotations (max 2 per day)
  const filteredAnnotations = useMemo(() => {
    // First: filter by date range and deduplicate
    const annotationMap = new Map<string, Annotation>();
    annotations.forEach(ann => {
      // Only include annotations within the date range
      if (ann.date >= startDateStr && ann.date <= endDate) {
        // Use date + title + type as unique key to prevent duplicates
        const key = `${ann.date}|${ann.title}|${ann.type}`;
        if (!annotationMap.has(key)) {
          annotationMap.set(key, ann);
        }
      }
    });
    
    // Second: group by date and limit to max 2 per day
    const annotationsByDate = new Map<string, Annotation[]>();
    annotationMap.forEach(ann => {
      if (!annotationsByDate.has(ann.date)) {
        annotationsByDate.set(ann.date, []);
      }
      annotationsByDate.get(ann.date)!.push(ann);
    });
    
    // Third: sort each date's annotations by id (descending) and take max 2
    const result: Annotation[] = [];
    annotationsByDate.forEach((dateAnnotations) => {
      const sorted = dateAnnotations.sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return bId - aId;
      });
      result.push(...sorted.slice(0, 2));
    });
    
    return result;
  }, [annotations, startDateStr, endDate]);
  
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
    
    const dateRangeKey = `${startDateStr}-${endDate}`;
    
    // Skip if already requested for this date range
    if (annotationRequestedRef.current === dateRangeKey) return;
    
    // Skip if mutation is already in progress
    if (autoAnnotateMutation.isPending) return;
    
    // Reset annotations when date range changes
    if (annotationRequestedRef.current !== '' && annotationRequestedRef.current !== dateRangeKey) {
      setAnnotations([]);
    }
    
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
  }, [moodsLoading, startDateStr, endDate, autoAnnotateMutation]);

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

  // Combine dates from moods and annotations - show dates within the selected range
  const timelineDates = useMemo(() => {
    const dateSet = new Set<string>();
    // Add all dates from moods that are within the date range
    moods.forEach(mood => {
      if (mood.date >= startDateStr && mood.date <= endDate) {
        dateSet.add(mood.date);
      }
    });
    // Add all dates from filtered annotations that are within the date range
    filteredAnnotations.forEach(ann => {
      if (ann.date >= startDateStr && ann.date <= endDate) {
        dateSet.add(ann.date);
      }
    });
    // Convert to sorted array (newest first)
    return Array.from(dateSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [moods, filteredAnnotations, startDateStr, endDate]);

  return {
    moods,
    annotations: filteredAnnotations,
    timeRange,
    setTimeRange,
    chartData,
    youAvg,
    partnerAvg,
    groupedMoods,
    timelineDates,
  };
};

