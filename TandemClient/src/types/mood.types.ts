export interface MoodEntry {
  id: string;
  date: string;
  userId: string;
  userName: string;
  mood: 'happy' | 'calm' | 'tired' | 'anxious' | 'sad' | 'energized';
  notes?: string;
  annotations?: string[];
}

export interface Annotation {
  id: string;
  date: string;
  type: 'call' | 'trip' | 'purchase' | 'event';
  title: string;
  description: string;
}
export interface MoodOption {
  emoji: string;
  label: string;
  value: string;
  color: string;
}

export interface MoodTrackerProps {
  onMoodSelect?: (mood: string) => void;
  currentMood?: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { emoji: '😌', label: 'Calm', value: 'calm', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { emoji: '😴', label: 'Tired', value: 'tired', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { emoji: '😰', label: 'Anxious', value: 'anxious', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  { emoji: '😢', label: 'Sad', value: 'sad', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  { emoji: '🔥', label: 'Energized', value: 'energized', color: 'bg-red-100 text-red-700 border-red-300' },
];