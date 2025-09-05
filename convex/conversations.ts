import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Raj's Error Types
export const ERROR_TYPES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
} as const;

// Raj's Input Validation
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 1000); // Limit length
}

export const getConversations = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id('conversations'),
    userId: v.id('users'),
    title: v.string(),
    _creationTime: v.number(),
  })),
  handler: async (ctx) => {
    // For demo purposes, return all conversations
    // In production, this would filter by authenticated user
    const conversations = await ctx.db
      .query("conversations")
      .order("desc")
      .take(50); // Always limit results

    return conversations;
  },
});

export const createConversation = mutation({
  args: {
    title: v.string(),
  },
  returns: v.id('conversations'),
  handler: async (ctx, args) => {
    // 1. Validate inputs
    const sanitizedTitle = sanitizeInput(args.title);
    if (sanitizedTitle.length < 1) {
      throw new ConvexError('Title is required');
    }

    if (sanitizedTitle.length > 200) {
      throw new ConvexError('Title is too long (max 200 characters)');
    }

    // 2. Create conversation (Convex handles _creationTime automatically)
    const conversationId = await ctx.db.insert("conversations", {
      userId: "demo-user-id" as any, // Temporary for demo
      title: sanitizedTitle,
    });

    return conversationId;
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.union(
    v.object({
      _id: v.id('conversations'),
      userId: v.id('users'),
      title: v.string(),
      _creationTime: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    
    if (!conversation) {
      return null;
    }

    // In production, check if user has access to this conversation
    // For demo, return the conversation
    return conversation;
  },
});
