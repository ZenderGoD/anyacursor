import { openrouter } from '@/lib/openrouter';
import { chatTools } from '@/lib/chat-ai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { NextRequest } from 'next/server';

// Raj's Chat API Route Pattern
export async function POST(request: NextRequest) {
  try {
    // Raj's Error Handling Pattern - Authentication check first
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response('OpenRouter API key not configured', { status: 500 });
    }

    const { messages }: { messages: UIMessage[] } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    // Raj's Streaming Response Pattern - Simplified for testing
    const result = streamText({
      model: openrouter.chat('openai/gpt-4o'),
      messages: messages.map(msg => ({
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : msg.content?.[0]?.text || '',
      })),
      temperature: 0.7,
      system: `You are a helpful AI assistant for a chat interface. Respond with clear, helpful text.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    // Raj's Error Handling Pattern
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Chat generation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Raj's CORS Configuration
export const runtime = 'edge';
export const maxDuration = 60; // 60 seconds max for generation
