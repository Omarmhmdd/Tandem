import type { MoodEntry, Annotation } from '../../types/mood.types';
import type { BackendMoodEntry, BackendAnnotation } from '../../types/api.types';
import { formatDateForAPI } from '../dateHelpers';


export const transformMoodEntry = (entry: BackendMoodEntry): MoodEntry => ({
  id: String(entry.id),
  date: entry.date,
  userId: entry.user_id ? String(entry.user_id) : '',
  userName: entry.user_name || 'User',
  mood: entry.mood,
  notes: entry.notes || undefined,
});


export const transformAnnotation = (annotation: BackendAnnotation): Annotation => ({
  id: String(annotation.id),
  date: annotation.date,
  type: annotation.type,
  title: annotation.title,
  description: annotation.description,
});


export const transformMoodEntryToBackend = (entry: Partial<MoodEntry>): {
  date: string;
  mood: string;
  notes?: string;
  time?: string;
} => ({
  date: entry.date || formatDateForAPI(),
  mood: entry.mood || 'calm',
  notes: entry.notes,
});

