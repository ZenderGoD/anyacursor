import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Raj's Error Types
export const ERROR_TYPES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
} as const;

// Raj's Input Validation
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML
    .substring(0, 10000); // Limit length for messages
}

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.array(v.object({
    _id: v.id('messages'),
    conversationId: v.id('conversations'),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    _creationTime: v.number(),
  })),
  handler: async (ctx, args) => {
    // 1. Verify conversation exists
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }

    // 2. Get messages with proper ordering
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
      .order("asc")
      .take(100); // Always limit results

    return messages;
  },
});

export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  returns: v.id('messages'),
  handler: async (ctx, args) => {
    // 1. Validate inputs
    const sanitizedContent = sanitizeInput(args.content);
    if (sanitizedContent.length < 1) {
      throw new ConvexError('Message content is required');
    }

    if (sanitizedContent.length > 10000) {
      throw new ConvexError('Message is too long (max 10,000 characters)');
    }

    // 2. Verify conversation exists
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new ConvexError(ERROR_TYPES.CONVERSATION_NOT_FOUND);
    }

    // 3. Create message (Convex handles _creationTime automatically)
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      role: args.role,
      content: sanitizedContent,
    });

    return messageId;
  },
});
