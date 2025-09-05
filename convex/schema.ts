import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_email", ["email"]),

  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["_creationTime"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_conversation", ["conversationId"])
    .index("by_created_at", ["_creationTime"]),
});
