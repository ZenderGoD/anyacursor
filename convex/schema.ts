import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    credits: v.optional(v.number()), // For AI generation credits
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_email", ["email"]),

  conversations: defineTable({
    userId: v.id("users"),
    cursorId: v.optional(v.id("cursors")), // Link to cursor being worked on
    title: v.string(),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_user", ["userId"])
    .index("by_cursor", ["cursorId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.object({
      toolName: v.string(),
      args: v.any(),
      result: v.optional(v.any()),
    }))),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_conversation", ["conversationId"]),

  cursors: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    visibility: v.union(
      v.literal("private"),
      v.literal("public"),
      v.literal("unlisted")
    ),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      style: v.string(),
      color: v.string(),
      size: v.object({
        width: v.number(),
        height: v.number(),
      }),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_user", ["userId"])
    .index("by_visibility", ["visibility"])
    .searchIndex("search_cursors", {
      searchField: "name",
      filterFields: ["userId", "visibility"],
    }),

  versions: defineTable({
    cursorId: v.id("cursors"),
    name: v.string(), // e.g., "v1.0", "summer-edition"
    description: v.optional(v.string()),
    isActive: v.boolean(), // Only one active version per cursor
    changelog: v.optional(v.string()),
    metadata: v.optional(v.object({
      basePrompt: v.string(),
      styleConsistency: v.string(),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_cursor", ["cursorId"])
    .index("by_active", ["cursorId", "isActive"]),

  variants: defineTable({
    versionId: v.id("versions"),
    name: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    storageId: v.optional(v.string()), // Convex storage ID for the image
    metadata: v.optional(v.object({
      model: v.string(), // Which AI model was used
      generationTime: v.number(), // Processing time in ms
      fileSize: v.number(),
      format: v.string(),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_version", ["versionId"])
    .index("by_status", ["status"]),

  animations: defineTable({
    cursorId: v.id("cursors"),
    name: v.string(),
    type: v.union(
      v.literal("hover"),
      v.literal("click"),
      v.literal("idle"),
      v.literal("loading")
    ),
    frames: v.array(v.id("variants")), // References to variant frames
    duration: v.number(), // Duration in milliseconds
    loop: v.boolean(),
    easing: v.string(), // CSS easing function
    metadata: v.optional(v.object({
      frameRate: v.number(),
      totalFrames: v.number(),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_cursor", ["cursorId"])
    .index("by_type", ["type"]),

  // Chat Interface Tables
  chatSessions: defineTable({
    title: v.string(),
    slug: v.string(), // Dynamic routing slug
    userId: v.id("users"),
    type: v.union(
      v.literal("text"),
      v.literal("text-to-image"),
      v.literal("image-to-image"),
      v.literal("mixed")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("deleted")
    ),
    metadata: v.optional(v.object({
      lastMessageAt: v.number(),
      messageCount: v.number(),
      totalCost: v.number(), // Track generation costs
      summary: v.optional(v.string()), // Chat summary for context
      lastSummarizedAt: v.optional(v.number()), // When summary was last updated
      contextWindow: v.optional(v.number()), // Number of messages in current context
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_slug", ["slug"]),

  chatMessages: defineTable({
    sessionId: v.id("chatSessions"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    contentType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("mixed")
    ),
    metadata: v.optional(v.object({
      model: v.string(),
      generationTime: v.number(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.string()),
      error: v.optional(v.string()),
      cost: v.optional(v.number()),
      prompt: v.optional(v.string()),
      inputImages: v.optional(v.array(v.string())), // For image-to-image editing
    })),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),

  generationRequests: defineTable({
    messageId: v.id("chatMessages"),
    userId: v.id("users"),
    type: v.union(
      v.literal("text"),
      v.literal("text-to-image"),
      v.literal("image-to-image")
    ),
    model: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.object({
      content: v.string(),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.string()),
      error: v.optional(v.string()),
    })),
    metadata: v.optional(v.object({
      generationTime: v.number(),
      cost: v.number(),
      retryCount: v.number(),
      inputImages: v.optional(v.array(v.string())),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_type", ["type"]),

  chatSummaries: defineTable({
    sessionId: v.id("chatSessions"),
    summary: v.string(),
    messageRange: v.object({
      startMessageId: v.id("chatMessages"),
      endMessageId: v.id("chatMessages"),
      messageCount: v.number(),
    }),
    metadata: v.optional(v.object({
      model: v.string(),
      generationTime: v.number(),
      cost: v.number(),
    })),
    // No manual timestamps - Convex provides _creationTime
  })
    .index("by_session", ["sessionId"]),

  // Task Coordination Tables
  tasks: defineTable({
    id: v.string(), // Custom task ID for easier reference
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("specification"),
      v.literal("plan"),
      v.literal("tasks"),
      v.literal("implementation"),
      v.literal("testing"),
      v.literal("deployment")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("blocked")
    ),
    assignedTo: v.union(
      v.literal("Spec Kit Agent"),
      v.literal("Enhanced Spec Kit Agent"),
      v.literal("Cursor Agent"),
      v.literal("unassigned")
    ),
    createdBy: v.string(),
    createdAt: v.string(), // ISO string for easier handling
    updatedAt: v.string(),
    dueDate: v.optional(v.string()),
    context: v.optional(v.string()),
    expectedOutcome: v.optional(v.string()),
    result: v.optional(v.string()),
    files: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
    progress: v.number(), // 0-100
    dependencies: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_task_id", ["id"])
    .index("by_status", ["status"])
    .index("by_assigned_to", ["assignedTo"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_created_by", ["createdBy"]),

  taskCoordination: defineTable({
    id: v.string(), // Custom coordination ID
    taskId: v.string(),
    fromAgent: v.union(
      v.literal("Spec Kit Agent"),
      v.literal("Enhanced Spec Kit Agent"),
      v.literal("Cursor Agent")
    ),
    toAgent: v.union(
      v.literal("Spec Kit Agent"),
      v.literal("Enhanced Spec Kit Agent"),
      v.literal("Cursor Agent")
    ),
    message: v.string(),
    context: v.optional(v.string()),
    timestamp: v.string(), // ISO string
  })
    .index("by_coordination_id", ["id"])
    .index("by_task", ["taskId"])
    .index("by_from_agent", ["fromAgent"])
    .index("by_to_agent", ["toAgent"]),

  taskReports: defineTable({
    id: v.string(), // Custom report ID
    taskId: v.string(),
    agent: v.union(
      v.literal("Spec Kit Agent"),
      v.literal("Enhanced Spec Kit Agent"),
      v.literal("Cursor Agent")
    ),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("blocked")
    ),
    result: v.string(),
    files: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
    timestamp: v.string(), // ISO string
  })
    .index("by_report_id", ["id"])
    .index("by_task", ["taskId"])
    .index("by_agent", ["agent"])
    .index("by_status", ["status"]),
});
