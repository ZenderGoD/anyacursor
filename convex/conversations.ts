import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const conversations = await ctx.db
      .query("conversations")
      .order("desc")
      .collect();

    return conversations;
  },
});

export const createConversation = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const conversationId = await ctx.db.insert("conversations", {
      userId: "temp-user-id" as any, // Temporary for demo
      title: args.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return conversationId;
  },
});

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    return conversation;
  },
});
