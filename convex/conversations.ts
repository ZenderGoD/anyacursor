import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "./auth";

// Raj's Conversation Functions
export const sendMessage = mutation({
  args: {
    conversationId: v.id('conversations'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    toolCalls: v.optional(v.array(v.object({
      toolName: v.string(),
      args: v.any(),
      result: v.optional(v.any()),
    }))),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Verify conversation ownership
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError('CONVERSATION_NOT_FOUND');
    }

    if (conversation.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Save message
    await ctx.db.insert('messages', {
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
    });
  },
});

export const createConversation = mutation({
  args: {
    title: v.string(),
    cursorId: v.optional(v.id('cursors')),
  },
  returns: v.id('conversations'),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. If cursorId provided, verify ownership
    if (args.cursorId) {
      const cursor = await ctx.db.get(args.cursorId);
      if (!cursor) {
        throw new ConvexError('CURSOR_NOT_FOUND');
      }

      if (cursor.userId !== userId) {
        throw new ConvexError('ACCESS_DENIED');
      }
    }

    // 3. Create conversation
    const conversationId = await ctx.db.insert('conversations', {
      userId,
      title: args.title,
      cursorId: args.cursorId,
    });

    return conversationId;
  },
});

export const getConversation = query({
  args: { conversationId: v.id('conversations') },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // 2. Get conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    // 3. Check permissions
    if (conversation.userId !== userId) return null;

    return conversation;
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id('conversations'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 2. Get conversation and verify access
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    if (conversation.userId !== userId) return [];

    // 3. Get messages
    return await ctx.db
      .query('messages')
      .withIndex('by_conversation', (q: any) => q.eq('conversationId', args.conversationId))
      .order('desc')
      .take(args.limit || 50);
  },
});