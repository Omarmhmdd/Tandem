import type { MoodEntry } from '../types/mood.types';


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


export const getMoodValue = (mood: string): number => {
  const values: Record<string, number> = {
    sad: 1,
    anxious: 2,
    tired: 3,
    calm: 4,
    happy: 5,
    energized: 5,
    neutral: 3,
  };
  return values[mood] || 3;
};


export const calculateAverageMood = (entries: MoodEntry[]): number => {
  if (entries.length === 0) return 0;
  const sum = entries.reduce((acc, entry) => acc + getMoodValue(entry.mood), 0);
  return sum / entries.length;
};

export const groupMoodsByDate = (entries: MoodEntry[]): Record<string, MoodEntry[]> => {
  return entries.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, MoodEntry[]>);
};


export const prepareChartData = (
  entries: MoodEntry[],
  currentUserId: string | null,
  partnerUserId: string | null
): Array<{ date: string; you: number; partner: number }> => {
  const dateMap = new Map<string, { date: string; you: number; partner: number }>();
  
  entries.forEach((entry) => {
    const date = entry.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { date, you: 0, partner: 0 });
    }
    const chartEntry = dateMap.get(date)!;
    const moodValue = getMoodValue(entry.mood);
    
    if (entry.userId === currentUserId) {
      chartEntry.you = moodValue;
    } else if (partnerUserId && entry.userId === partnerUserId) {
      chartEntry.partner = moodValue;
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};


export const calculateAverageMoods = (
  entries: MoodEntry[],
  currentUserId: string | null,
  partnerUserId: string | null
): { youAvg: string; partnerAvg: string } => {
  const stats = entries.reduce((acc, entry) => {
    const moodValue = getMoodValue(entry.mood);
    
    if (entry.userId === currentUserId) {
      acc.you += moodValue;
      acc.youCount++;
    } else if (partnerUserId && entry.userId === partnerUserId) {
      acc.partner += moodValue;
      acc.partnerCount++;
    }
    return acc;
  }, { you: 0, youCount: 0, partner: 0, partnerCount: 0 });

  return {
    youAvg: stats.youCount > 0 ? (stats.you / stats.youCount).toFixed(1) : '0',
    partnerAvg: stats.partnerCount > 0 ? (stats.partner / stats.partnerCount).toFixed(1) : '0',
  };
};


