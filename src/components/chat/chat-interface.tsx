'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Image, Edit, MessageSquare } from 'lucide-react';

// Raj's Chat Interface Component Pattern
interface ChatInterfaceProps {
  chatSlug?: string;
}

export default function ChatInterface({ chatSlug }: ChatInterfaceProps) {
  const [generationMode, setGenerationMode] = useState<'text' | 'text-to-image' | 'image-to-image'>('text');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<any[]>([]);

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: input }],
      isOptimistic: true,
    };

    // Optimistic UI update - add user message immediately
    setOptimisticMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add mode context to the message
      const messageWithMode = `${input}\n\n[Mode: ${generationMode}]`;
      await sendMessage({ parts: [{ type: 'text', text: messageWithMode }] });
      
      // Remove optimistic message once real message is received
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } catch (error) {
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'text-to-image':
        return <Image className="h-4 w-4" />;
      case 'image-to-image':
        return <Edit className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'text':
        return 'bg-blue-100 text-blue-800';
      case 'text-to-image':
        return 'bg-green-100 text-green-800';
      case 'image-to-image':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <Card className="rounded-none border-b">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            AI Chat Interface
            <Badge variant="secondary" className="ml-auto">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Generation Mode Selector */}
      <Card className="rounded-none border-b">
        <CardContent className="pt-4">
          <Tabs value={generationMode} onValueChange={(value) => setGenerationMode(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Text Chat
              </TabsTrigger>
              <TabsTrigger value="text-to-image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Generate Image
              </TabsTrigger>
              <TabsTrigger value="image-to-image" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Image
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 rounded-none border-b overflow-hidden">
        <CardContent className="h-full p-0">
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && optimisticMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                  <p className="text-sm">
                    Choose a mode above and start chatting with AI
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {optimisticMessages.map((message) => (
                  <MessageBubble key={message.id} message={message} isOptimistic />
                ))}
              </>
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="rounded-none">
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  generationMode === 'text'
                    ? 'Ask me anything...'
                    : generationMode === 'text-to-image'
                    ? 'Describe the image you want to generate...'
                    : 'Describe how you want to edit the image...'
                }
                disabled={isLoading}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getModeColor(generationMode)}>
              {getModeIcon(generationMode)}
              <span className="ml-1 capitalize">{generationMode.replace('-', ' ')}</span>
            </Badge>
            <span className="text-xs text-gray-500">
              {generationMode === 'text' && 'Powered by OpenRouter'}
              {generationMode === 'text-to-image' && 'Powered by FAL AI Flux Pro'}
              {generationMode === 'image-to-image' && 'Powered by FAL AI Gemini 2.5 Flash'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Raj's Message Bubble Component
function MessageBubble({ message, isOptimistic = false }: { message: any; isOptimistic?: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        } ${isOptimistic ? 'opacity-70' : ''}`}
      >
        <div className="text-sm">
          {message.parts.map((part: any, index: number) => {
            if (part.type === 'text') {
              return (
                <div key={index} className="whitespace-pre-wrap">
                  {part.text}
                </div>
              );
            }
            if (part.type === 'tool-generateImage') {
              const { state, toolCallId } = part;
              if (state === 'input-available') {
                return (
                  <div key={toolCallId} className="text-blue-600">
                    Generating image...
                  </div>
                );
              }
              if (state === 'output-available') {
                const { output } = part;
                return (
                  <div key={toolCallId} className="mt-2">
                    {output.images?.map((image: any, imgIndex: number) => (
                      <img
                        key={imgIndex}
                        src={image.url}
                        alt="Generated image"
                        className="max-w-full h-auto rounded-lg"
                      />
                    ))}
                  </div>
                );
              }
            }
            if (part.type === 'tool-editImage') {
              const { state, toolCallId } = part;
              if (state === 'input-available') {
                return (
                  <div key={toolCallId} className="text-purple-600">
                    Editing image...
                  </div>
                );
              }
              if (state === 'output-available') {
                const { output } = part;
                return (
                  <div key={toolCallId} className="mt-2">
                    {output.images?.map((image: any, imgIndex: number) => (
                      <img
                        key={imgIndex}
                        src={image.url}
                        alt="Edited image"
                        className="max-w-full h-auto rounded-lg"
                      />
                    ))}
                    {output.description && (
                      <p className="text-sm text-gray-600 mt-2">{output.description}</p>
                    )}
                  </div>
                );
              }
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}