# Technical Implementation Plan: Conversational AI Cursor Interface

**Feature**: Conversational AI Cursor Interface  
**Created**: 2025-01-27  
**Status**: Draft  
**Tech Stack**: Vercel AI SDK + Convex + OpenRouter

## Architecture Overview

### Frontend Components (Raj's Pattern)
- **ConversationalChatInterface**: Main chat interface with streaming text and image capabilities
- **StreamingTextDisplay**: Real-time text streaming component with proper rendering
- **StreamingImageDisplay**: Real-time image streaming component for cursor generation progress
- **ToolCallIndicator**: Visual indicators for AI tool calls during conversation
- **GenerationProgressTracker**: Progress tracking for concurrent cursor generations
- **ConversationHistory**: Persistent conversation history with streaming support

### Backend Architecture (Raj's Pattern)
- **Convex Mutations**: Handle conversation threads and cursor generation requests
- **Convex Actions**: Manage AI generation workflows with streaming capabilities
- **Convex Queries**: Real-time data fetching for conversations and generation status
- **Streaming Endpoints**: Vercel AI SDK streaming endpoints for text and image streaming
- **Storage Integration**: Convex storage for generated cursor files and conversation data

### AI Integration (Vercel AI SDK + Raj's Pattern)
- **Vercel AI SDK**: Advanced tool calling with streaming chat interface
- **OpenRouter API**: Multi-model AI generation capabilities with streaming support
- **Streaming Tools**: Cursor generation tools with real-time progress updates
- **Conversation Management**: Context-aware conversation handling with streaming
- **Image Generation Streaming**: Real-time image streaming during cursor generation

## Implementation Phases

### Phase 1: Core Infrastructure
1. **Database Schema Updates**
   - Add conversation threads table with streaming session tracking
   - Add cursor generation requests with real-time status updates
   - Add streaming session management tables
   - Update existing schema for conversation-based cursor generation

2. **AI SDK Integration with Streaming**
   - Set up Vercel AI SDK with OpenRouter and streaming capabilities
   - Create streaming cursor generation tools
   - Implement real-time text and image streaming endpoints
   - Add conversation context management

3. **Basic Streaming UI Components**
   - Streaming chat interface with text and image support
   - Real-time cursor generation progress display
   - Tool call visualization during streaming
   - Basic conversation history management

### Phase 2: Enhanced User Experience
1. **Advanced Streaming Features**
   - Concurrent streaming for multiple cursor generations
   - Real-time conversation context updates
   - Streaming error handling and recovery
   - Optimistic UI updates during streaming

2. **Advanced Conversation Features**
   - Multi-turn conversation with cursor generation
   - Context-aware cursor modifications
   - Streaming progress for complex generation requests
   - Real-time collaboration features

### Phase 3: Performance & Scale
1. **Streaming Optimization**
   - Efficient streaming connection management
   - Image streaming optimization and compression
   - Real-time performance monitoring
   - Streaming rate limiting and cost controls

2. **Advanced AI Features**
   - Context-aware conversation suggestions
   - Streaming style transfer capabilities
   - Real-time quality scoring and filtering
   - Advanced streaming tool orchestration

## Technical Decisions

### Database Design (Raj's Pattern)
```typescript
// Convex Schema Additions
conversation_threads: defineTable({
  userId: v.id('users'),
  title: v.string(),
  status: v.union(
    v.literal('active'),
    v.literal('paused'),
    v.literal('completed')
  ),
  context: v.optional(v.object({
    currentCursorId: v.optional(v.id('cursors')),
    generationCount: v.number(),
    lastActivity: v.number(),
  })),
  // No manual timestamps - Convex handles _creationTime
})
  .index('by_user', ['userId'])
  .index('by_status', ['status'])

cursor_generation_requests: defineTable({
  conversationId: v.id('conversation_threads'),
  cursorId: v.optional(v.id('cursors')),
  prompt: v.string(),
  status: v.union(
    v.literal('pending'),
    v.literal('streaming'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed')
  ),
  streamingSessionId: v.optional(v.string()),
  progress: v.optional(v.object({
    textProgress: v.number(),
    imageProgress: v.number(),
    currentStep: v.string(),
  })),
})
  .index('by_conversation', ['conversationId'])
  .index('by_status', ['status'])
  .index('by_streaming_session', ['streamingSessionId'])

streaming_sessions: defineTable({
  conversationId: v.id('conversation_threads'),
  generationRequestId: v.id('cursor_generation_requests'),
  type: v.union(
    v.literal('text'),
    v.literal('image'),
    v.literal('combined')
  ),
  status: v.union(
    v.literal('active'),
    v.literal('completed'),
    v.literal('failed')
  ),
  metadata: v.optional(v.object({
    streamId: v.string(),
    connectionId: v.string(),
    lastUpdate: v.number(),
  })),
})
  .index('by_conversation', ['conversationId'])
  .index('by_generation_request', ['generationRequestId'])
  .index('by_status', ['status'])
```

### AI SDK Streaming Tool Definitions (Raj's Pattern)
```typescript
// app/api/chat/route.ts
import { openrouter } from '@ai-sdk/openrouter';
import {
  type InferUITools,
  type ToolSet,
  type UIDataTypes,
  type UIMessage,
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import { z } from 'zod';

const tools = {
  generateCursorWithStreaming: tool({
    description: 'Generate a cursor with real-time streaming updates for both text and image',
    inputSchema: z.object({
      prompt: z.string().describe('The prompt describing the cursor design'),
      format: z.enum(['cur', 'ani', 'png']).describe('The cursor format'),
      size: z.enum(['16x16', '32x32', '64x64']).describe('The cursor size'),
      conversationId: z.string().describe('The conversation thread ID'),
    }),
    execute: async ({ prompt, format, size, conversationId }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Create generation request with streaming session
        const generationRequestId = await convex.mutation(api.cursorGeneration.mutations.create, {
          conversationId,
          prompt,
          format,
          size,
          status: 'streaming',
        });

        // 3. Initialize streaming session
        const streamingSessionId = await convex.mutation(api.streaming.mutations.create, {
          conversationId,
          generationRequestId,
          type: 'combined',
          status: 'active',
        });

        // 4. Start streaming generation process
        await convex.action(api.cursorGeneration.actions.startStreamingGeneration, {
          generationRequestId,
          streamingSessionId,
          prompt,
          format,
          size,
        });

        return `Starting cursor generation with real-time streaming! I'm creating a ${size} ${format} cursor based on: "${prompt}". You'll see both text updates and image progress in real-time.`;
      } catch (error) {
        throw new Error(`Failed to start streaming cursor generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),

  updateCursorWithStreaming: tool({
    description: 'Update an existing cursor with streaming progress updates',
    inputSchema: z.object({
      cursorId: z.string().describe('The cursor ID to update'),
      modifications: z.string().describe('The modifications to apply'),
      conversationId: z.string().describe('The conversation thread ID'),
    }),
    execute: async ({ cursorId, modifications, conversationId }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Validate cursor ownership
        const cursor = await convex.query(api.cursors.queries.getById, { id: cursorId });
        if (!cursor || cursor.ownerId !== userId) {
          throw new Error('ACCESS_DENIED');
        }

        // 3. Create streaming update session
        const streamingSessionId = await convex.mutation(api.streaming.mutations.create, {
          conversationId,
          generationRequestId: cursorId,
          type: 'combined',
          status: 'active',
        });

        // 4. Start streaming update process
        await convex.action(api.cursorGeneration.actions.startStreamingUpdate, {
          cursorId,
          streamingSessionId,
          modifications,
        });

        return `Starting cursor update with streaming progress! I'm applying your modifications: "${modifications}". You'll see real-time updates as I process your changes.`;
      } catch (error) {
        throw new Error(`Failed to start streaming cursor update: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),

  getStreamingProgress: tool({
    description: 'Get real-time progress of ongoing cursor generation',
    inputSchema: z.object({
      streamingSessionId: z.string().describe('The streaming session ID'),
    }),
    execute: async ({ streamingSessionId }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Get streaming session progress
        const progress = await convex.query(api.streaming.queries.getProgress, {
          streamingSessionId,
        });

        if (!progress) {
          return "No active streaming session found.";
        }

        return `Streaming Progress: Text ${progress.textProgress}%, Image ${progress.imageProgress}% - Current Step: ${progress.currentStep}`;
      } catch (error) {
        throw new Error(`Failed to get streaming progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),
} satisfies ToolSet;

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  const { messages }: { messages: ChatMessage[] } = await req.json();

  const result = streamText({
    model: openrouter('openai/gpt-4o'),
    system: `You are a helpful AI assistant for cursor generation with real-time streaming capabilities.
    
    You can help users:
    - Generate new cursor designs with real-time streaming updates
    - Modify existing cursors with streaming progress
    - Provide real-time feedback during generation
    - Manage cursor collections through conversation
    
    Always follow these rules:
    - Use streaming tools for all cursor generation operations
    - Provide real-time updates during generation processes
    - Handle streaming failures gracefully
    - Maintain conversation context across streaming sessions
    - Use the tools to perform actions, don't just describe them`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // Allow multiple tool calls
    tools,
  });

  return result.toUIMessageStreamResponse();
}
```

### Frontend Streaming Chat Interface (Raj's Pattern)
```typescript
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect } from 'react';
import type { ChatMessage } from './api/chat/route';

export default function StreamingCursorChatPage() {
  const [input, setInput] = useState('');
  const [streamingSessions, setStreamingSessions] = useState<Map<string, any>>(new Map());

  const { messages, sendMessage, isLoading } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Handle streaming updates
  useEffect(() => {
    const eventSource = new EventSource('/api/streaming/events');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { streamingSessionId, type, progress, imageData } = data;
      
      if (type === 'progress') {
        setStreamingSessions(prev => new Map(prev.set(streamingSessionId, {
          ...prev.get(streamingSessionId),
          progress,
        })));
      }
      
      if (type === 'image_update') {
        setStreamingSessions(prev => new Map(prev.set(streamingSessionId, {
          ...prev.get(streamingSessionId),
          imageData,
        })));
      }
    };

    return () => eventSource.close();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Streaming Cursor AI Assistant</h1>
        <p className="text-gray-600">Generate cursors with real-time streaming updates</p>
      </div>

      {/* Chat Messages with Streaming */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 border'
            }`}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-text`} className="whitespace-pre-wrap">{part.text}</div>;
                  
                  case 'tool-generateCursorWithStreaming':
                    const streamingSessionId = part.args.conversationId;
                    const session = streamingSessions.get(streamingSessionId);
                    
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-purple-800">
                            Streaming Cursor Generation
                          </span>
                        </div>
                        <div className="text-sm text-purple-700 mb-2">
                          <div><strong>Prompt:</strong> {part.args.prompt}</div>
                          <div><strong>Format:</strong> {part.args.format}</div>
                          <div><strong>Size:</strong> {part.args.size}</div>
                        </div>
                        
                        {/* Streaming Progress */}
                        {session?.progress && (
                          <div className="space-y-2">
                            <div className="text-xs text-purple-600">
                              Text Progress: {session.progress.textProgress}%
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${session.progress.textProgress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-purple-600">
                              Image Progress: {session.progress.imageProgress}%
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${session.progress.imageProgress}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-purple-600">
                              Current Step: {session.progress.currentStep}
                            </div>
                          </div>
                        )}
                        
                        {/* Streaming Image Preview */}
                        {session?.imageData && (
                          <div className="mt-2">
                            <img 
                              src={`data:image/png;base64,${session.imageData}`}
                              alt="Streaming cursor preview"
                              className="w-16 h-16 border border-purple-300 rounded"
                            />
                          </div>
                        )}
                      </div>
                    );
                  
                  case 'tool-updateCursorWithStreaming':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Streaming Cursor Update
                          </span>
                        </div>
                        <div className="text-sm text-blue-700">
                          <div><strong>Modifications:</strong> {part.args.modifications}</div>
                        </div>
                      </div>
                    );
                  
                  case 'tool-getStreamingProgress':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Streaming Progress
                          </span>
                        </div>
                        <div className="text-sm text-green-700">
                          Checking real-time progress...
                        </div>
                      </div>
                    );
                  
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={async (event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (input.trim()) {
                  sendMessage({
                    text: input,
                  });
                  setInput('');
                }
              }
            }}
            placeholder="Describe the cursor you want to generate..."
            disabled={isLoading}
          />
          <button
            onClick={() => {
              if (input.trim()) {
                sendMessage({
                  text: input,
                });
                setInput('');
              }
            }}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInput('Generate a futuristic gaming cursor with streaming updates')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Gaming Cursor
          </button>
          <button
            onClick={() => setInput('Create a minimalist cursor with real-time progress')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Minimalist
          </button>
          <button
            onClick={() => setInput('Generate a colorful animated cursor with streaming')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Animated
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Security & Validation (Raj's Pattern)

### Input Validation
- Streaming session validation and rate limiting
- Real-time progress validation and sanitization
- Image streaming security and size limits
- Conversation context validation

### Authentication (Raj's Pattern)
- Verify user permissions for streaming sessions
- Validate conversation ownership before streaming
- Track streaming costs and usage per user
- Implement proper session management for streaming

## Testing Strategy

### Unit Tests
- Streaming tool function validation
- Real-time progress tracking
- Image streaming component rendering
- Conversation context management

### Integration Tests
- End-to-end streaming workflow
- Concurrent streaming session handling
- Streaming error recovery mechanisms
- Performance under streaming load

## Deployment Considerations

### Environment Variables
- OpenRouter API key configuration with streaming support
- Streaming session limits and timeouts
- Image streaming rate limiting parameters
- Real-time connection configuration

### Monitoring
- Streaming success rates and performance
- Real-time connection monitoring
- Image streaming bandwidth usage
- User engagement with streaming features

---

## Next Steps
1. Review and approve this technical plan
2. Use `/tasks` command to break down into actionable tasks
3. Begin implementation with Phase 1 streaming components
4. Set up monitoring and testing infrastructure for streaming
