import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { MoodTracker } from './MoodTracker';
import { showToast } from '../utils/toast';
import { useHealthLogParser } from '../hooks/useHealthLogParser';
import { transformParsedToEntry } from '../utils/transforms/healthTransforms';
import type { HealthLoggerProps } from '../types/health.types';

export const HealthLogger: React.FC<HealthLoggerProps> = ({ onSave }) => {
  const [logText, setLogText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { parsedData, parseLogText, clearParsedData, isParsing } = useHealthLogParser({ selectedMood });

  const handleSubmit = async () => {
    if (!logText.trim() && !selectedMood) return;
    setIsSubmitting(true);
    try {
      const parsed = await parseLogText(logText.trim());
      if (!logText.trim()) clearParsedData();
      const entry = transformParsedToEntry(parsed, selectedMood, logText.trim());
      await onSave?.(entry);
      setLogText('');
      setSelectedMood(undefined);
      showToast('Health log entry saved successfully!', 'success');
    } catch {
      showToast('Failed to save entry', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            Daily Health Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Tell me about your day... e.g., 'walked 25 min, 2 coffees, slept at 01:30'"
            value={logText}
            onChange={(e) => { setLogText(e.target.value); clearParsedData(); }}
            rows={4}
            className="text-base"
          />
          <MoodTracker onMoodSelect={setSelectedMood} currentMood={selectedMood || parsedData?.mood} />
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">AI will automatically parse your entry into structured data</p>
            <Button onClick={handleSubmit} disabled={(!logText.trim() && !selectedMood) || isParsing} isLoading={isSubmitting || isParsing} icon={Send} />
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <Card className="border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-primary">
              <CheckCircle2 className="w-5 h-5" />
              AI Parsed Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedData.complement && (
              <div className="p-3 bg-white rounded-lg border border-brand-primary/10">
                <p className="text-sm font-medium text-gray-700 mb-1">💬 AI Feedback:</p>
                <p className="text-sm text-gray-600 italic">"{parsedData.complement}"</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {parsedData.activities.length > 0 && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Activities</p>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.activities.map((activity, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">{activity}</span>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.food.length > 0 && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Food</p>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.food.map((item, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.sleep_hours && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Sleep</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parsedData.sleep_hours}h
                    {parsedData.bedtime && parsedData.wake_time && (
                      <span className="text-xs text-gray-500 ml-2">({parsedData.bedtime} - {parsedData.wake_time})</span>
                    )}
                  </p>
                </div>
              )}
              {parsedData.mood && (
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-1">Mood</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{parsedData.mood}</p>
                </div>
              )}
            </div>

            {parsedData.notes && (
              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{parsedData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};