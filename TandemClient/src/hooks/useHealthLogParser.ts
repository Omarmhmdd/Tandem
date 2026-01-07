import { useState } from 'react';
import { useParseHealthLog } from '../api/queries/health';
import type { ParsedHealthLog, UseHealthLogParserOptions } from '../types/health.types';
import { isLikelyGibberish, createFallbackParsedData } from '../utils/healthHelpers';

export const useHealthLogParser = ({ selectedMood }: UseHealthLogParserOptions) => {
  const [parsedData, setParsedData] = useState<ParsedHealthLog | null>(null);
  const parseMutation = useParseHealthLog();

  const parseLogText = async (logText: string): Promise<ParsedHealthLog> => {
    if (!logText.trim()) {
      return createFallbackParsedData(selectedMood);
    }

    try {
      const parsed = await parseMutation.mutateAsync([logText, selectedMood || undefined]);
      
      if (selectedMood) {
        parsed.mood = selectedMood;
      }
      
      setParsedData(parsed);
      return parsed;
    } catch (parseError) {
      console.warn('Parse failed, using fallback:', parseError);
      
      const filteredNotes = logText.trim().length > 0 && !isLikelyGibberish(logText) 
        ? logText.trim() 
        : '';
      
      const fallback = createFallbackParsedData(selectedMood, filteredNotes);
      setParsedData(fallback);
      return fallback;
    }
  };

  const clearParsedData = () => {
    setParsedData(null);
  };

  return {
    parsedData,
    parseLogText,
    clearParsedData,
    isParsing: parseMutation.isPending,
  };
};