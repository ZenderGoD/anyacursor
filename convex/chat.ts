import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import type { Id } from './_generated/dataModel';

// Raj's Chat Functions Pattern

// Create a new chat session
export const createChatSession = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal('text'),
      v.literal('text-to-image'),
      v.literal('image-to-image'),
      v.literal('mixed')
    ),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern - Check auth first
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Generate unique slug for routing
    const slug = generateChatSlug(args.title);

    const sessionId = await ctx.db.insert('chatSessions', {
      title: args.title,
      slug,
      userId,
      type: args.type,
      status: 'active',
      metadata: {
        lastMessageAt: Date.now(),
        messageCount: 0,
        totalCost: 0,
        contextWindow: 0,
      },
    });

    return { sessionId, slug };
  },
});

// Get chat sessions for a user
export const getChatSessions = query({
  args: {
    status: v.optional(v.union(
      v.literal('active'),
      v.literal('archived'),
      v.literal('deleted')
    )),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    let query = ctx.db
      .query('chatSessions')
      .withIndex('by_user', (q) => q.eq('userId', userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field('status'), args.status));
    }

    return await query.order('desc').collect();
  },
});

// Get messages for a chat session
export const getChatMessages = query({
  args: {
    sessionId: v.id('chatSessions'),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Raj's Authorization Pattern - Check ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    if (session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    return await ctx.db
      .query('chatMessages')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('asc')
      .collect();
  },
});

// Add a message to a chat session
export const addChatMessage = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    role: v.union(
      v.literal('user'),
      v.literal('assistant'),
      v.literal('system')
    ),
    content: v.string(),
    contentType: v.union(
      v.literal('text'),
      v.literal('image'),
      v.literal('mixed')
    ),
    metadata: v.optional(v.object({
      model: v.string(),
      generationTime: v.number(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.string()),
      error: v.optional(v.string()),
      cost: v.optional(v.number()),
      prompt: v.optional(v.string()),
      inputImages: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Raj's Authorization Pattern - Check ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    if (session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    const messageId = await ctx.db.insert('chatMessages', {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      contentType: args.contentType,
      metadata: args.metadata,
      status: 'completed',
    });

    // Update session metadata
    await ctx.db.patch(args.sessionId, {
      metadata: {
        ...session.metadata,
        lastMessageAt: Date.now(),
        messageCount: (session.metadata?.messageCount || 0) + 1,
        totalCost: (session.metadata?.totalCost || 0) + (args.metadata?.cost || 0),
      },
    });

    return messageId;
  },
});

// Update message status (for tracking generation progress)
export const updateMessageStatus = mutation({
  args: {
    messageId: v.id('chatMessages'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    metadata: v.optional(v.object({
      model: v.string(),
      generationTime: v.number(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.string()),
      error: v.optional(v.string()),
      cost: v.optional(v.number()),
      prompt: v.optional(v.string()),
      inputImages: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Raj's Authorization Pattern - Check ownership through session
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    const session = await ctx.db.get(message.sessionId);
    if (!session || session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    await ctx.db.patch(args.messageId, {
      status: args.status,
      metadata: args.metadata ? { ...message.metadata, ...args.metadata } : message.metadata,
    });

    return args.messageId;
  },
});

// Archive a chat session
export const archiveChatSession = mutation({
  args: {
    sessionId: v.id('chatSessions'),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Raj's Authorization Pattern - Check ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    if (session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    await ctx.db.patch(args.sessionId, {
      status: 'archived',
    });

    return args.sessionId;
  },
});

// Helper function to generate unique chat slug
function generateChatSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}

// Get chat session by slug
export const getChatSessionBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    const session = await ctx.db
      .query('chatSessions')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (!session) {
      throw new ConvexError('RESOURCE_NOT_FOUND');
    }

    if (session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    return session;
  },
});

// Get chat context with summarization
export const getChatContext = query({
  args: { 
    sessionId: v.id('chatSessions'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Get session and verify ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    const limit = args.limit || 50;
    
    // Get recent messages
    const recentMessages = await ctx.db
      .query('chatMessages')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .take(limit);

    // Get summaries if we have more than 50 messages
    const summaries = await ctx.db
      .query('chatSummaries')
      .withIndex('by_session', (q) => q.eq('sessionId', args.sessionId))
      .order('desc')
      .collect();

    return {
      session,
      messages: recentMessages.reverse(), // Reverse to get chronological order
      summaries,
      hasMoreMessages: (session.metadata?.messageCount || 0) > limit,
    };
  },
});

// Create chat summary when context window is exceeded
export const createChatSummary = mutation({
  args: {
    sessionId: v.id('chatSessions'),
    messageIds: v.array(v.id('chatMessages')),
  },
  handler: async (ctx, args) => {
    // Raj's Authentication Pattern
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // Verify session ownership
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // Get messages to summarize
    const messages = await Promise.all(
      args.messageIds.map(id => ctx.db.get(id))
    );

    const validMessages = messages.filter(Boolean);
    if (validMessages.length === 0) {
      throw new ConvexError('NO_MESSAGES_TO_SUMMARIZE');
    }

    // Create summary (in a real implementation, this would call an AI model)
    const summary = `Chat summary: ${validMessages.length} messages covering topics like ${validMessages.slice(0, 3).map(m => m?.content.substring(0, 50)).join(', ')}...`;

    const summaryId = await ctx.db.insert('chatSummaries', {
      sessionId: args.sessionId,
      summary,
      messageRange: {
        startMessageId: validMessages[0]!._id,
        endMessageId: validMessages[validMessages.length - 1]!._id,
        messageCount: validMessages.length,
      },
      metadata: {
        model: 'gpt-4o',
        generationTime: 1000,
        cost: 0.01,
      },
    });

    // Update session metadata
    await ctx.db.patch(args.sessionId, {
      metadata: {
        lastMessageAt: session.metadata?.lastMessageAt || Date.now(),
        messageCount: session.metadata?.messageCount || 0,
        totalCost: session.metadata?.totalCost || 0,
        summary,
        lastSummarizedAt: Date.now(),
        contextWindow: 0, // Reset context window
      },
    });

    return summaryId;
  },
});

// Helper function to get authenticated user ID
async function getAuthUserId(ctx: any): Promise<Id<'users'> | null> {
  // This would integrate with your auth system
  // For now, return a placeholder - you'll need to implement proper auth
  // In a real implementation, this would get the actual user ID from the auth context
  return null; // Temporarily return null until auth is implemented
}
