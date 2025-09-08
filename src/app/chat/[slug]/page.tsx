import { notFound } from 'next/navigation';
import ChatInterface from '@/components/chat/chat-interface';
import { ConvexClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Raj's Dynamic Chat Page Pattern
interface ChatPageProps {
  params: {
    slug: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { slug } = params;

  // In a real implementation, you'd verify the chat session exists
  // For now, we'll pass the slug to the chat interface
  return <ChatInterface chatSlug={slug} />;
}

// Generate metadata for the chat page
export async function generateMetadata({ params }: ChatPageProps) {
  const { slug } = params;
  
  return {
    title: `Chat - ${slug}`,
    description: 'AI-powered chat interface with text and image generation',
  };
}
