import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { MOOD_OPTIONS, type MoodTrackerProps } from '../types/mood.types';

export const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  onMoodSelect, 
  currentMood 
}) => {
  const [selectedMood, setSelectedMood] = useState<string | undefined>(currentMood);

  // Update local state when currentMood prop changes
  useEffect(() => {
    if (currentMood !== undefined) {
      setSelectedMood(currentMood);
    }
  }, [currentMood]);

  const handleMoodClick = (moodValue: string) => {
    setSelectedMood(moodValue);
    onMoodSelect?.(moodValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodClick(mood.value)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                ${selectedMood === mood.value 
                  ? `${mood.color} scale-105 shadow-md` 
                  : 'bg-white border-gray-200 hover:border-brand-light hover:bg-brand-light/10'
                }
              `}
            >
              <span className="text-3xl mb-1.5">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};