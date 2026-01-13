import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MessageSquare, Send, Lightbulb } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { PageHeader } from '../components/shared/PageHeader';
import { useAiCoachQuery } from '../api/queries/aiCoach';
import type { Message } from '../types/aiCoach.types';
import {
  EXAMPLE_QUESTIONS,
  getInitialMessage,
  createUserMessage,
  createAssistantMessage,
  createErrorMessage,
  formatMessageTime,
} from '../utils/aiCoachHelpers';

export const Coach: React.FC = () => {
  
  const aiCoachMutation = useAiCoachQuery();
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const isLoading = aiCoachMutation.isPending;

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const question = inputValue.trim();
    const userMessage = createUserMessage(question);

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const result = await aiCoachMutation.mutateAsync(question);
      
      const assistantMessage = createAssistantMessage(
        result.answer || 'I apologize, but I couldn\'t generate a response. Please try again.'
      );

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = createErrorMessage();
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleExampleClick = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'AI Coach' }]} />

      <PageHeader
        title="AI Coach"
        description="Get personalized recommendations and insights"
      />

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
              Chat with AI Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="space-y-4 mb-4 h-[400px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-[#53389E] text-white'
                        : message.role === 'error'
                        ? 'bg-red-50 text-red-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your wellness, pantry, or goals..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !inputValue.trim()} icon={Send}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Example Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Try Asking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {EXAMPLE_QUESTIONS.map((question: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => handleExampleClick(question)}
                  className="w-full text-left p-3 text-sm text-gray-700 bg-gray-50 hover:bg-brand-light/20 hover:text-brand-primary rounded-lg transition-colors border border-transparent hover:border-brand-light"
                >
                  {question}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
