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

  // Canvases for infinite canvas
  canvases: defineTable({
    title: v.string(),
    userId: v.string(),
    isPublic: v.boolean(),
    data: v.any(), // Canvas state (nodes, edges, etc.)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_public", ["userId", "isPublic"]),

  // Canvas nodes
  canvasNodes: defineTable({
    canvasId: v.id('canvases'),
    nodeId: v.string(),
    type: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    data: v.any(),
    connections: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_canvas", ["canvasId"])
  .index("by_canvas_node", ["canvasId", "nodeId"]),

  // AI Generations
  aiGenerations: defineTable({
    type: v.union(
      v.literal('image'),
      v.literal('video'),
      v.literal('3d'),
      v.literal('audio'),
      v.literal('code'),
      v.literal('text')
    ),
    prompt: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    userId: v.string(),
    canvasId: v.optional(v.id('canvases')),
    nodeId: v.optional(v.string()),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    options: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
  .index("by_user", ["userId"])
  .index("by_canvas", ["canvasId"])
  .index("by_status", ["status"])
  .index("by_type", ["type"]),

  // Chat messages
  chatMessages: defineTable({
    canvasId: v.id('canvases'),
    message: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    timestamp: v.number(),
    userId: v.string(),
    metadata: v.optional(v.any()),
  })
  .index("by_canvas", ["canvasId"])
  .index("by_canvas_timestamp", ["canvasId", "timestamp"]),

  // Users
  users: defineTable({
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    preferences: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user_id", ["userId"]),

  // Organizations
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    members: v.array(v.object({
      userId: v.string(),
      role: v.union(
        v.literal('owner'),
        v.literal('admin'),
        v.literal('member')
      ),
      joinedAt: v.number(),
    })),
    settings: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_owner", ["ownerId"]),
});
