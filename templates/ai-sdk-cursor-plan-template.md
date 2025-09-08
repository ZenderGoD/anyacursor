# Technical Implementation Plan: [CURSOR FEATURE NAME] with Vercel AI SDK

**Feature**: [Feature Name]  
**Created**: [DATE]  
**Status**: Draft  
**Tech Stack**: Next.js 14, Convex, TypeScript, Tailwind CSS, Vercel AI SDK, OpenRouter API

## Architecture Overview

### Frontend Components (Raj's Pattern)
- **[ComponentName]**: [Description of cursor-related component]
- **[ComponentName]**: [Description of AI chat interface component]
- **[ComponentName]**: [Description of cursor preview/display component]
- **[ComponentName]**: [Description of tool call UI component]

### Backend Architecture (Raj's Pattern)
- **Convex Mutations**: Handle cursor creation and status updates
- **Convex Actions**: Manage AI generation workflows and external API calls
- **Convex Queries**: Real-time data fetching for cursors and generation status
- **Storage Integration**: Convex storage for generated cursor files

### AI Integration (Vercel AI SDK + Raj's Pattern)
- **Vercel AI SDK**: Tool calling and chat interface
- **OpenRouter API**: Multi-model AI generation capabilities
- **Tool Definitions**: Cursor generation and management tools
- **Streaming Responses**: Real-time AI responses with tool calls

## Implementation Phases

### Phase 1: Core Infrastructure
1. **Database Schema Updates**
   - Add cursor-related tables with proper indexes
   - Add generation tracking tables
   - Update existing schema for cursor relationships

2. **AI SDK Integration**
   - Set up Vercel AI SDK with OpenRouter
   - Create cursor generation tools
   - Implement streaming chat interface

3. **Basic UI Components**
   - AI chat interface with tool calling
   - Cursor generation form
   - Simple cursor display

### Phase 2: Enhanced User Experience
1. **Real-time Updates**
   - WebSocket integration for live generation status
   - Optimistic UI updates
   - Error handling and retry mechanisms

2. **Advanced Features**
   - Multi-step tool calling
   - Cursor variant management
   - Generation history and analytics

### Phase 3: Performance & Scale
1. **Optimization**
   - Cursor file optimization and caching
   - Query performance improvements
   - Rate limiting and cost controls

2. **Advanced AI Features**
   - Prompt suggestions and templates
   - Style transfer capabilities
   - Quality scoring and filtering

## Technical Decisions

### Database Design (Raj's Pattern)
```typescript
// Convex Schema Additions
cursors: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  ownerId: v.id('users'),
  organizationId: v.optional(v.id('organizations')),
  visibility: v.union(
    v.literal('private'),
    v.literal('public'),
    v.literal('unlisted')
  ),
  // Cursor-specific fields
  format: v.union(
    v.literal('cur'),
    v.literal('ani'),
    v.literal('png')
  ),
  size: v.union(
    v.literal('16x16'),
    v.literal('32x32'),
    v.literal('64x64')
  ),
  // No manual timestamps - Convex handles _creationTime
})
  .index('by_owner', ['ownerId'])
  .index('by_organization', ['organizationId'])
  .index('by_format', ['format'])

cursor_variants: defineTable({
  cursorId: v.id('cursors'),
  prompt: v.string(),
  status: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed')
  ),
  storageId: v.optional(v.string()),
  metadata: v.optional(v.object({
    model: v.string(),
    processingTimeMs: v.number(),
    errorMessage: v.optional(v.string())
  }))
})
  .index('by_cursor', ['cursorId'])
  .index('by_status', ['status'])
```

### AI SDK Tool Definitions (Raj's Pattern)
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
  generateCursor: tool({
    description: 'Generate a new cursor design from a text prompt',
    inputSchema: z.object({
      prompt: z.string().describe('The prompt describing the cursor design'),
      format: z.enum(['cur', 'ani', 'png']).describe('The cursor format'),
      size: z.enum(['16x16', '32x32', '64x64']).describe('The cursor size'),
    }),
    execute: async ({ prompt, format, size }) => {
      // 1. Authentication check first (Raj's pattern)
      const userId = await getAuthUserId();
      if (!userId) {
        throw new Error('UNAUTHORIZED');
      }

      // 2. Create cursor record with pending status
      const cursorId = await createCursor({
        prompt,
        format,
        size,
        ownerId: userId,
        status: 'pending',
      });

      // 3. Schedule async generation
      await scheduleCursorGeneration(cursorId, prompt, format, size);

      return `Cursor generation started! ID: ${cursorId}`;
    },
  }),

  getCursorVariants: tool({
    description: 'Get all variants for a specific cursor',
    inputSchema: z.object({
      cursorId: z.string().describe('The cursor ID to get variants for'),
    }),
    execute: async ({ cursorId }) => {
      // 1. Authentication check first (Raj's pattern)
      const userId = await getAuthUserId();
      if (!userId) {
        throw new Error('UNAUTHORIZED');
      }

      // 2. Get cursor and validate ownership
      const cursor = await getCursor(cursorId);
      if (!cursor || cursor.ownerId !== userId) {
        throw new Error('ACCESS_DENIED');
      }

      // 3. Get variants
      const variants = await getCursorVariants(cursorId);
      return variants;
    },
  }),

  updateCursor: tool({
    description: 'Update cursor metadata',
    inputSchema: z.object({
      cursorId: z.string().describe('The cursor ID to update'),
      name: z.string().optional().describe('New cursor name'),
      description: z.string().optional().describe('New cursor description'),
      visibility: z.enum(['private', 'public', 'unlisted']).optional().describe('New visibility setting'),
    }),
    execute: async ({ cursorId, name, description, visibility }) => {
      // 1. Authentication check first (Raj's pattern)
      const userId = await getAuthUserId();
      if (!userId) {
        throw new Error('UNAUTHORIZED');
      }

      // 2. Get cursor and validate ownership
      const cursor = await getCursor(cursorId);
      if (!cursor || cursor.ownerId !== userId) {
        throw new Error('ACCESS_DENIED');
      }

      // 3. Update cursor
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (visibility !== undefined) updateData.visibility = visibility;

      await updateCursor(cursorId, updateData);
      return `Cursor updated successfully!`;
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
    - Handle errors gracefully with user-friendly messages`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5), // Allow multiple tool calls
    tools,
  });

  return result.toUIMessageStreamResponse();
}
```

### Frontend Chat Interface (Raj's Pattern)
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
    <div className="flex flex-col h-screen">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}>
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return <div key={`${message.id}-text`}>{part.text}</div>;
                  case 'tool-generateCursor':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-2 bg-purple-100 rounded">
                        <div className="text-sm font-medium text-purple-800">
                          Generating cursor: {part.args.prompt}
                        </div>
                        <div className="text-xs text-purple-600">
                          Format: {part.args.format} | Size: {part.args.size}
                        </div>
                      </div>
                    );
                  case 'tool-getCursorVariants':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-2 bg-green-100 rounded">
                        <div className="text-sm font-medium text-green-800">
                          Fetching cursor variants...
                        </div>
                      </div>
                    );
                  case 'tool-updateCursor':
                    return (
                      <div key={`${message.id}-tool-${i}`} className="mt-2 p-2 bg-blue-100 rounded">
                        <div className="text-sm font-medium text-blue-800">
                          Updating cursor...
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
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Security & Validation (Raj's Pattern)

### Input Validation
- Prompt length and content validation
- Rate limiting per user
- Cost controls and usage tracking
- Proper error handling without exposing internals

### Authentication (Raj's Pattern)
- Verify user permissions for cursor access
- Validate ownership before generation
- Track generation costs per user
- Implement proper session management

## Testing Strategy

### Unit Tests
- Tool function validation
- AI generation utilities
- Component rendering and interactions

### Integration Tests
- End-to-end chat workflow
- Tool calling mechanisms
- Error handling scenarios
- Performance under load

## Deployment Considerations

### Environment Variables
- OpenRouter API key configuration
- Generation cost limits
- Rate limiting parameters
- Storage configuration

### Monitoring
- Generation success rates
- API response times
- Cost tracking and alerts
- User engagement metrics

---

## Next Steps
1. Review and approve this technical plan
2. Use `/tasks` command to break down into actionable tasks
3. Begin implementation with Phase 1 components
4. Set up monitoring and testing infrastructure
