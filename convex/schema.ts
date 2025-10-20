import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Canvas documents
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isPublished: v.boolean(),
  })
  .index("by_user", ["userId"])
  .index("by_user_published", ["userId", "isPublished"]),
});
