import Link from 'next/link';
import { Plus, MessageSquare, Clock, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Raj's Chat List Page Pattern
export default function ChatListPage() {
  // In a real implementation, this would fetch chat sessions from Convex
  const mockChatSessions = [
    {
      id: '1',
      slug: 'ai-design-discussion',
      title: 'AI Design Discussion',
      lastMessage: 'How can we improve the user experience?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      messageCount: 15,
      type: 'mixed' as const,
    },
    {
      id: '2',
      slug: 'image-generation-help',
      title: 'Image Generation Help',
      lastMessage: 'Can you create a logo for my startup?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      messageCount: 8,
      type: 'text-to-image' as const,
    },
    {
      id: '3',
      slug: 'technical-questions',
      title: 'Technical Questions',
      lastMessage: 'What are the best practices for React?',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      messageCount: 25,
      type: 'text' as const,
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      case 'text-to-image':
        return <MessageSquare className="h-4 w-4" />;
      case 'image-to-image':
        return <MessageSquare className="h-4 w-4" />;
      case 'mixed':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return 'bg-blue-100 text-blue-800';
      case 'text-to-image':
        return 'bg-green-100 text-green-800';
      case 'image-to-image':
        return 'bg-purple-100 text-purple-800';
      case 'mixed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chat Conversations</h1>
            <p className="text-gray-600 mt-2">Manage your AI conversations and create new ones</p>
          </div>
          <Link href="/chat/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
        </div>

        {/* Chat Sessions Grid */}
        <div className="grid gap-4">
          {mockChatSessions.map((session) => (
            <Link key={session.id} href={`/chat/${session.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(session.type)}
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {session.lastMessage}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(session.type)}>
                        {session.type.replace('-', ' ')}
                      </Badge>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(session.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{session.messageCount} messages</span>
                    <div className="flex items-center gap-4">
                      <button className="hover:text-gray-700 flex items-center gap-1">
                        <Archive className="h-3 w-3" />
                        Archive
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {mockChatSessions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-600 mb-6">Start a new conversation to begin chatting with AI</p>
            <Link href="/chat/new">
              <Button>Start New Chat</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
