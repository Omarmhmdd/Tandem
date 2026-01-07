import type { LogEntry, ParsedHealthLog} from '../types/health.types';

export const getMoodEmoji = (mood: string): string => {
  const emojis: Record<string, string> = {
    happy: '😊',
    calm: '😌',
    tired: '😴',
    anxious: '😰',
    sad: '😢',
    energized: '🔥',
    neutral: '😐',
  };
  return emojis[mood] || '😐';
};

export const calculateAvgSleep = (entries: LogEntry[]): string => {
  if (entries.length === 0) return '0';
  const total = entries.reduce((sum, e) => sum + (e.sleep?.hours || 0), 0);
  return (total / entries.length).toFixed(1);
};


export const calculateTotalActivities = (entries: LogEntry[]): number => {
  return entries.reduce((sum, e) => sum + e.activities.length, 0);
};


export const calculateTotalFoodItems = (entries: LogEntry[]): number => {
  return entries.reduce((sum, e) => sum + e.food.length, 0);
};




export const isLikelyGibberish = (text: string): boolean => {
  if (!text || text.length < 3) return false;
  
  // Check for keyboard patterns
  const keyboardPatterns = [/^[qwertyuiop]+$/i, /^[asdfghjkl]+$/i, /^[zxcvbnm]+$/i];
  if (keyboardPatterns.some(pattern => pattern.test(text))) return true;
  
  // Check for high repetition of same character
  const charCounts: Record<string, number> = {};
  for (const char of text.toLowerCase()) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  const maxCount = Math.max(...Object.values(charCounts));
  if (maxCount / text.length > 0.4 && text.length > 5) return true;
  
  
  const vowelCount = (text.match(/[aeiou]/gi) || []).length;
  if (text.length > 20 && vowelCount / text.length < 0.15) return true;
  
  return false;
};


export const createFallbackParsedData = (mood?: string, notes?: string): ParsedHealthLog => ({
  activities: [],
  food: [],
  sleep_hours: null,
  bedtime: null,
  wake_time: null,
  mood: mood || 'neutral',
  notes: notes || '',
  confidence: 0.5,
  complement: '',
});