import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Return a demo user for now
    return {
      _id: "demo-user-id" as any,
      name: "Demo User",
      email: "demo@example.com",
      createdAt: Date.now(),
    };
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      createdAt: Date.now(),
    });

    return userId;
  },
});
