'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Image, Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Raj's New Chat Page Pattern
export default function NewChatPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'text' | 'text-to-image' | 'image-to-image' | 'mixed'>('text');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      // In a real implementation, this would create a chat session in Convex
      // For now, we'll generate a slug and redirect
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50) + '-' + Date.now().toString(36);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push(`/chat/${slug}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="h-5 w-5" />;
      case 'text-to-image':
        return <Image className="h-5 w-5" />;
      case 'image-to-image':
        return <Edit className="h-5 w-5" />;
      case 'mixed':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'text':
        return 'Chat with AI for text-based conversations and questions';
      case 'text-to-image':
        return 'Generate images from text descriptions using AI';
      case 'image-to-image':
        return 'Edit and modify existing images with AI assistance';
      case 'mixed':
        return 'Combined text and image generation capabilities';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chats
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Chat</h1>
            <p className="text-gray-600 mt-2">Start a new conversation with AI</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chat Settings</CardTitle>
            <CardDescription>
              Choose the type of conversation you want to have with AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Chat Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your chat..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Chat Type Selection */}
            <div className="space-y-3">
              <Label>Chat Type</Label>
              <Tabs value={type} onValueChange={(value) => setType(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="text-to-image" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="image-to-image" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="mixed" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Mixed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Type Description */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {getTypeIcon(type)}
                <h3 className="font-medium text-gray-900 capitalize">
                  {type.replace('-', ' ')} Chat
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {getTypeDescription(type)}
              </p>
            </div>

            {/* Create Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleCreateChat}
                disabled={!title.trim() || isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? 'Creating...' : 'Create Chat'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
