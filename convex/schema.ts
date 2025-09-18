import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Minimal schema for fresh start
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
  })
    .index("by_email", ["email"]),
});
