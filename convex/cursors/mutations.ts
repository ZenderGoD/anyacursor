import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "../auth";

// Raj's Convex Function Pattern - Cursor Mutations
export const createCursor = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('unlisted')
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
  },
  returns: v.id('cursors'),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check first
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Business logic
    const cursorId = await ctx.db.insert('cursors', {
      name: args.name,
      description: args.description,
      userId,
      visibility: args.visibility,
      tags: args.tags || [],
      metadata: args.metadata,
    });

    // 3. Create initial version
    await ctx.db.insert('versions', {
      cursorId,
      name: 'v1.0',
      description: 'Initial version',
      isActive: true,
      changelog: 'Created cursor',
      metadata: {
        basePrompt: args.description || '',
        styleConsistency: 'initial',
      },
    });

    return cursorId;
  },
});

export const updateCursor = mutation({
  args: {
    cursorId: v.id('cursors'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('unlisted')
    )),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      style: v.string(),
      color: v.string(),
      size: v.object({
        width: v.number(),
        height: v.number(),
      }),
    })),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get and validate cursor
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Update only provided fields
    const updateData: Record<string, unknown> = {};

    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.visibility !== undefined) updateData.visibility = args.visibility;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.metadata !== undefined) updateData.metadata = args.metadata;

    if (Object.keys(updateData).length > 0) {
      await ctx.db.patch(args.cursorId, updateData);
    }
  },
});

export const deleteCursor = mutation({
  args: { cursorId: v.id('cursors') },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get and validate cursor
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Delete cursor (cascade will handle related data)
    await ctx.db.delete(args.cursorId);
  },
});

export const createVersion = mutation({
  args: {
    cursorId: v.id('cursors'),
    name: v.string(),
    description: v.optional(v.string()),
    changelog: v.optional(v.string()),
    basePrompt: v.optional(v.string()),
  },
  returns: v.id('versions'),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get and validate cursor
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Set previous active version to inactive
    const activeVersion = await ctx.db
      .query('versions')
      .withIndex('by_active', (q: any) =>
        q.eq('cursorId', args.cursorId).eq('isActive', true)
      )
      .first();

    if (activeVersion) {
      await ctx.db.patch(activeVersion._id, { isActive: false });
    }

    // 4. Create new version
    const versionId = await ctx.db.insert('versions', {
      cursorId: args.cursorId,
      name: args.name,
      description: args.description,
      isActive: true,
      changelog: args.changelog,
      metadata: {
        basePrompt: args.basePrompt || '',
        styleConsistency: activeVersion?.metadata?.styleConsistency || 'maintained',
      },
    });

    return versionId;
  },
});

export const updateVariantStatus = mutation({
  args: {
    variantId: v.id('variants'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    storageId: v.optional(v.string()),
    processingTimeMs: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Get variant
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new ConvexError('VARIANT_NOT_FOUND');
    }

    // 2. Update variant
    const updateData: Record<string, unknown> = {
      status: args.status,
    };

    if (args.storageId !== undefined) {
      updateData.storageId = args.storageId;
    }

    if (args.processingTimeMs !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        generationTime: args.processingTimeMs,
      };
    }

    if (args.fileSize !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        fileSize: args.fileSize,
      };
    }

    if (args.errorMessage !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        errorMessage: args.errorMessage,
      };
    }

    await ctx.db.patch(args.variantId, updateData);
  },
});

// Internal version for AI processing
export const updateVariantStatusInternal = internalMutation({
  args: {
    variantId: v.id('variants'),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    storageId: v.optional(v.string()),
    processingTimeMs: v.optional(v.number()),
    fileSize: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Get variant
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new ConvexError('VARIANT_NOT_FOUND');
    }

    // 2. Update variant
    const updateData: Record<string, unknown> = {
      status: args.status,
    };

    if (args.storageId !== undefined) {
      updateData.storageId = args.storageId;
    }

    if (args.processingTimeMs !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        generationTime: args.processingTimeMs,
      };
    }

    if (args.fileSize !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        fileSize: args.fileSize,
      };
    }

    if (args.errorMessage !== undefined) {
      updateData.metadata = {
        ...variant.metadata,
        errorMessage: args.errorMessage,
      };
    }

    await ctx.db.patch(args.variantId, updateData);
  },
});

export const createAnimation = mutation({
  args: {
    cursorId: v.id('cursors'),
    name: v.string(),
    type: v.union(
      v.literal('hover'),
      v.literal('click'),
      v.literal('idle'),
      v.literal('loading')
    ),
    frames: v.array(v.id('variants')),
    duration: v.number(),
    loop: v.boolean(),
    easing: v.optional(v.string()),
  },
  returns: v.id('animations'),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get and validate cursor
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Validate frames exist and belong to this cursor
    for (const frameId of args.frames) {
      const variant = await ctx.db.get(frameId);
      if (!variant) {
        throw new ConvexError('FRAME_VARIANT_NOT_FOUND');
      }

      const version = await ctx.db.get(variant.versionId);
      if (!version || version.cursorId !== args.cursorId) {
        throw new ConvexError('FRAME_VARIANT_ACCESS_DENIED');
      }
    }

    // 4. Create animation
    const animationId = await ctx.db.insert('animations', {
      cursorId: args.cursorId,
      name: args.name,
      type: args.type,
      frames: args.frames,
      duration: args.duration,
      loop: args.loop,
      easing: args.easing || 'linear',
      metadata: {
        frameRate: Math.round((args.frames.length / args.duration) * 1000),
        totalFrames: args.frames.length,
      },
    });

    return animationId;
  },
});
