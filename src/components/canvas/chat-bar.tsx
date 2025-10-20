'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBarProps {
  onGenerate?: (type: string, prompt: string) => void;
  className?: string;
}

export function ChatBar({ onGenerate, className = '' }: ChatBarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you generate images, videos, 3D models, audio, and code. What would you like to create?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to create: "${userMessage.content}". I can help you generate this content. What type of media would you prefer?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const quickActions = [
    { label: 'Generate Image', type: 'image', icon: '🖼️' },
    { label: 'Create Video', type: 'video', icon: '🎥' },
    { label: '3D Model', type: '3d', icon: '🎲' },
    { label: 'Audio/Music', type: 'audio', icon: '🎵' },
    { label: 'Code', type: 'code', icon: '💻' },
  ];

  const handleQuickAction = (type: string) => {
    const action = quickActions.find(a => a.type === type);
    if (action && onGenerate) {
      onGenerate(type, `Generate ${action.label.toLowerCase()}`);
    }
  };

  return (
    <Card className={`bg-neutral-900 border-neutral-800 ${className}`}>
      <div className="p-4">
        {/* Messages */}
        <div className="h-32 overflow-y-auto mb-4 space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                {message.content}
              </div>
              {message.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-neutral-800 text-neutral-200 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action) => (
            <Button
              key={action.type}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.type)}
              className="bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700"
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </Button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to create..."
            className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        {/* Status */}
        <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
              {messages.length} messages
            </Badge>
          </div>
          <div>AI Assistant Ready</div>
        </div>
      </div>
    </Card>
  );
}
