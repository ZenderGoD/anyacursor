# Vercel AI SDK + Convex Integration Example

This example shows how to integrate Vercel AI SDK with your existing Convex backend for cursor generation, following Raj's coding patterns.

## 1. AI SDK Route with Convex Integration

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
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const tools = {
  generateCursor: tool({
    description: 'Generate a new cursor design from a text prompt',
    inputSchema: z.object({
      prompt: z.string().describe('The prompt describing the cursor design'),
      format: z.enum(['cur', 'ani', 'png']).describe('The cursor format'),
      size: z.enum(['16x16', '32x32', '64x64']).describe('The cursor size'),
    }),
    execute: async ({ prompt, format, size }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Create cursor record with pending status
        const cursorId = await convex.mutation(api.cursors.mutations.create, {
          name: `Cursor from: ${prompt.substring(0, 50)}`,
          prompt,
          format,
          size,
          ownerId: userId,
          status: 'pending',
        });

        // 3. Schedule async generation
        await convex.action(api.cursors.actions.generateCursor, {
          cursorId,
          prompt,
          format,
          size,
        });

        return `Cursor generation started! I'm creating a ${size} ${format} cursor based on: "${prompt}". You can check the progress in your cursor collection.`;
      } catch (error) {
        throw new Error(`Failed to generate cursor: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),

  getMyCursors: tool({
    description: 'Get all cursors owned by the current user',
    inputSchema: z.object({
      limit: z.number().optional().describe('Maximum number of cursors to return'),
    }),
    execute: async ({ limit = 10 }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Get user's cursors
        const cursors = await convex.query(api.cursors.queries.getByOwner, {
          ownerId: userId,
          limit,
        });

        if (cursors.length === 0) {
          return "You don't have any cursors yet. Try generating one with the generateCursor tool!";
        }

        const cursorList = cursors.map(cursor => 
          `- ${cursor.name} (${cursor.format}, ${cursor.size}) - Status: ${cursor.status}`
        ).join('\n');

        return `Here are your cursors:\n${cursorList}`;
      } catch (error) {
        throw new Error(`Failed to fetch cursors: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),

  updateCursor: tool({
    description: 'Update cursor metadata (name, description, visibility)',
    inputSchema: z.object({
      cursorId: z.string().describe('The cursor ID to update'),
      name: z.string().optional().describe('New cursor name'),
      description: z.string().optional().describe('New cursor description'),
      visibility: z.enum(['private', 'public', 'unlisted']).optional().describe('New visibility setting'),
    }),
    execute: async ({ cursorId, name, description, visibility }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Get cursor and validate ownership
        const cursor = await convex.query(api.cursors.queries.getById, { id: cursorId });
        if (!cursor) {
          throw new Error('CURSOR_NOT_FOUND');
        }
        if (cursor.ownerId !== userId) {
          throw new Error('ACCESS_DENIED');
        }

        // 3. Update cursor (Raj's pattern - explicit field handling)
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (visibility !== undefined) updateData.visibility = visibility;

        await convex.mutation(api.cursors.mutations.update, {
          id: cursorId,
          ...updateData,
        });

        return `Cursor updated successfully! ${name ? `Name: ${name}` : ''} ${description ? `Description: ${description}` : ''} ${visibility ? `Visibility: ${visibility}` : ''}`;
      } catch (error) {
        throw new Error(`Failed to update cursor: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  }),

  getCursorVariants: tool({
    description: 'Get all variants for a specific cursor',
    inputSchema: z.object({
      cursorId: z.string().describe('The cursor ID to get variants for'),
    }),
    execute: async ({ cursorId }) => {
      try {
        // 1. Authentication check first (Raj's pattern)
        const userId = await getAuthUserId();
        if (!userId) {
          throw new Error('UNAUTHORIZED');
        }

        // 2. Get cursor and validate ownership
        const cursor = await convex.query(api.cursors.queries.getById, { id: cursorId });
        if (!cursor) {
          throw new Error('CURSOR_NOT_FOUND');
        }
        if (cursor.ownerId !== userId) {
          throw new Error('ACCESS_DENIED');
        }

        // 3. Get variants
        const variants = await convex.query(api.cursors.queries.getVariants, { cursorId });

        if (variants.length === 0) {
          return `No variants found for cursor "${cursor.name}". Try generating some variants!`;
        }

        const variantList = variants.map(variant => 
          `- Variant: ${variant.prompt} - Status: ${variant.status}`
        ).join('\n');

        return `Variants for "${cursor.name}":\n${variantList}`;
      } catch (error) {
        throw new Error(`Failed to fetch variants: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    system: `You are a helpful assistant for cursor generation and management.
    
    You can help users:
    - Generate new cursor designs from text prompts
    - Manage their cursor collections
    - Update cursor metadata
    - View cursor variants
    
    Always follow these rules:
    - Check user authentication before any operation
    - Validate user permissions for cursor access
    - Provide clear feedback on operation results
    - Handle errors gracefully with user-friendly messages
    - Use the tools to perform actions, don't just describe them`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // Allow multiple tool calls
    tools,
  });

  return result.toUIMessageStreamResponse();
}

// Helper function to get authenticated user ID
async function getAuthUserId(): Promise<string> {
  // This would integrate with your authentication system
  // For now, returning a placeholder
  return 'user_123';
}
```

## 2. Enhanced Chat Interface with Tool Call UI

```typescript
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import type { ChatMessage } from './api/chat/route';

export default function CursorChatPage() {
  const [input, setInput] = useState('');

  const { messages, sendMessage, isLoading } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Cursor AI Assistant</h1>
        <p className="text-gray-600">Generate and manage your cursor designs with AI</p>
      </div>

      {/* Chat Messages */}
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
                  
                  case 'tool-generateCursor':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-purple-800">
                            Generating Cursor
                          </span>
                        </div>
                        <div className="text-sm text-purple-700">
                          <div><strong>Prompt:</strong> {part.args.prompt}</div>
                          <div><strong>Format:</strong> {part.args.format}</div>
                          <div><strong>Size:</strong> {part.args.size}</div>
                        </div>
                      </div>
                    );
                  
                  case 'tool-getMyCursors':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            Fetching Your Cursors
                          </span>
                        </div>
                        <div className="text-sm text-green-700">
                          Getting your cursor collection...
                        </div>
                      </div>
                    );
                  
                  case 'tool-updateCursor':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-800">
                            Updating Cursor
                          </span>
                        </div>
                        <div className="text-sm text-blue-700">
                          Updating cursor metadata...
                        </div>
                      </div>
                    );
                  
                  case 'tool-getCursorVariants':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-yellow-800">
                            Fetching Variants
                          </span>
                        </div>
                        <div className="text-sm text-yellow-700">
                          Getting cursor variants...
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
            placeholder="Ask me to generate a cursor or manage your collection..."
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
            onClick={() => setInput('Generate a futuristic cursor for gaming')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Gaming Cursor
          </button>
          <button
            onClick={() => setInput('Show me my cursor collection')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            My Cursors
          </button>
          <button
            onClick={() => setInput('Create a minimalist cursor design')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            Minimalist
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 3. Convex Backend Functions

```typescript
// convex/cursors/mutations.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '../auth';

export const create = mutation({
  args: {
    name: v.string(),
    prompt: v.string(),
    format: v.union(v.literal('cur'), v.literal('ani'), v.literal('png')),
    size: v.union(v.literal('16x16'), v.literal('32x32'), v.literal('64x64')),
    ownerId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
  },
  returns: v.id('cursors'),
  handler: async (ctx, args) => {
    // 1. Authentication check first (Raj's pattern)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Create cursor record
    const cursorId = await ctx.db.insert('cursors', {
      name: args.name,
      prompt: args.prompt,
      format: args.format,
      size: args.size,
      ownerId: args.ownerId,
      status: args.status,
      // No manual timestamps - Convex handles _creationTime
    });

    return cursorId;
  },
});

export const update = mutation({
  args: {
    id: v.id('cursors'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('unlisted')
    )),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Authentication check first (Raj's pattern)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get cursor and validate ownership
    const cursor = await ctx.db.get(args.id);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }
    if (cursor.ownerId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Update cursor (Raj's pattern - explicit field handling)
    const updateData: Record<string, unknown> = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.visibility !== undefined) updateData.visibility = args.visibility;

    await ctx.db.patch(args.id, updateData);
  },
});
```

## 4. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=your_convex_url
OPENROUTER_API_KEY=your_openrouter_key
```

## 5. Package Dependencies

```json
{
  "dependencies": {
    "@ai-sdk/react": "^0.0.66",
    "@ai-sdk/openrouter": "^0.0.66",
    "ai": "^3.0.0",
    "convex": "^1.0.0",
    "zod": "^3.22.0"
  }
}
```

This integration provides:
- ✅ **Raj's authentication patterns** in all functions
- ✅ **Proper error handling** with user-friendly messages
- ✅ **Type safety** with TypeScript and Zod validation
- ✅ **Real-time updates** through Convex
- ✅ **Tool calling** with Vercel AI SDK
- ✅ **Streaming responses** for better UX
- ✅ **Multi-step tool execution** for complex workflows

The result is a powerful AI-powered cursor generation platform that combines the best of both worlds!
