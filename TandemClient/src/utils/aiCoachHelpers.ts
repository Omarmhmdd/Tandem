import type { Message } from '../types/aiCoach.types';

export const EXAMPLE_QUESTIONS = [
  'What healthy meal ideas can you suggest for this week?',
  'How can I improve my nutrition intake?',
  'What are some good habits for better wellness?',
  'Can you help me plan meals for my household?',
  'What exercises would you recommend?',
  'How can I track my wellness goals better?',
];

export const getInitialMessage = (): Message => ({
  id: 'initial',
  role: 'assistant',
  content: 'Hello! I\'m your AI Coach. I can help you with wellness, nutrition, meal planning, and more. What would you like to know?',
  timestamp: new Date(),
});

export const createUserMessage = (content: string): Message => ({
  id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'user',
  content,
  timestamp: new Date(),
});

export const createAssistantMessage = (content: string): Message => ({
  id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'assistant',
  content,
  timestamp: new Date(),
});

export const createErrorMessage = (): Message => ({
  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'error',
  content: 'I apologize, but I encountered an error. Please try again.',
  timestamp: new Date(),
});

export const formatMessageTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

