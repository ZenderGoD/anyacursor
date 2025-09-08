import { query, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "../auth";

// Raj's Query Optimization Patterns
export const getCursorsByUser = query({
  args: {
    userId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id('cursors'),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('unlisted')
    ),
    tags: v.array(v.string()),
    _creationTime: v.number(),
    metadata: v.optional(v.object({
      style: v.string(),
      color: v.string(),
      size: v.object({
        width: v.number(),
        height: v.number(),
      }),
    })),
    // Include active version info
    activeVersion: v.optional(v.object({
      _id: v.id('versions'),
      name: v.string(),
      description: v.optional(v.string()),
    })),
    // Include variant count
    variantCount: v.number(),
  })),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 2. Determine whose cursors to fetch
    const targetUserId = args.userId || userId;

    // 3. Permission check for other users' cursors
    if (targetUserId !== userId) {
      // For now, only allow viewing own cursors
      // Could be extended for public cursors later
      return [];
    }

    // 4. Fetch cursors with proper indexing
    const cursors = await ctx.db
      .query('cursors')
      .withIndex('by_user', (q: any) => q.eq('userId', targetUserId))
      .order('desc')
      .take(args.limit || 50);

    // 5. Enrich with version and variant data
    const enrichedCursors = await Promise.all(
      cursors.map(async (cursor: any) => {
        // Get active version
        const activeVersion = await ctx.db
          .query('versions')
          .withIndex('by_active', (q: any) =>
            q.eq('cursorId', cursor._id).eq('isActive', true)
          )
          .first();

        // Get variant count for active version
        let variantCount = 0;
        if (activeVersion) {
          variantCount = await ctx.db
            .query('variants')
            .withIndex('by_version', (q: any) => q.eq('versionId', activeVersion._id))
            .collect()
            .then((variants: any) => variants.length);
        }

        return {
          ...cursor,
          activeVersion: activeVersion ? {
            _id: activeVersion._id,
            name: activeVersion.name,
            description: activeVersion.description,
          } : undefined,
          variantCount,
        };
      })
    );

    return enrichedCursors;
  },
});

export const getCursorById = query({
  args: { cursorId: v.id('cursors') },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get cursor
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    // 3. Permission check
    if (cursor.userId !== userId && cursor.visibility === 'private') {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 4. Get active version
    const activeVersion = await ctx.db
      .query('versions')
      .withIndex('by_active', (q: any) =>
        q.eq('cursorId', cursor._id).eq('isActive', true)
      )
      .first();

    // 5. Get versions
    const versions = await ctx.db
      .query('versions')
      .withIndex('by_cursor', (q: any) => q.eq('cursorId', cursor._id))
      .order('desc')
      .collect();

    // 6. Get animations
    const animations = await ctx.db
      .query('animations')
      .withIndex('by_cursor', (q: any) => q.eq('cursorId', cursor._id))
      .order('desc')
      .collect();

    return {
      ...cursor,
      activeVersion,
      versions,
      animations,
    };
  },
});

export const getVersionsByCursor = query({
  args: {
    cursorId: v.id('cursors'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get cursor and verify access
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId && cursor.visibility === 'private') {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Get versions
    return await ctx.db
      .query('versions')
      .withIndex('by_cursor', (q: any) => q.eq('cursorId', args.cursorId))
      .order('desc')
      .take(args.limit || 20);
  },
});

export const getVariantsByVersion = query({
  args: {
    versionId: v.id('versions'),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    _id: v.id('variants'),
    name: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed')
    ),
    storageId: v.optional(v.string()),
    _creationTime: v.number(),
    metadata: v.optional(v.object({
      model: v.string(),
      generationTime: v.number(),
      fileSize: v.number(),
      format: v.string(),
    })),
  })),
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 2. Get version and verify access
    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError('VERSION_NOT_FOUND');
    }

    const cursor = await ctx.db.get(version.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId && cursor.visibility === 'private') {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Get variants
    return await ctx.db
      .query('variants')
      .withIndex('by_version', (q: any) => q.eq('versionId', args.versionId))
      .order('desc')
      .take(args.limit || 50);
  },
});

export const getVariant = query({
  args: { variantId: v.id('variants') },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError('UNAUTHORIZED');
    }

    // 2. Get variant
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new ConvexError('VARIANT_NOT_FOUND');
    }

    // 3. Verify access through version and cursor
    const version = await ctx.db.get(variant.versionId);
    if (!version) {
      throw new ConvexError('VERSION_NOT_FOUND');
    }

    const cursor = await ctx.db.get(version.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId && cursor.visibility === 'private') {
      throw new ConvexError('ACCESS_DENIED');
    }

    return variant;
  },
});

// Internal version for AI processing
export const getVariantInternal = internalQuery({
  args: { variantId: v.id('variants') },
  handler: async (ctx: any, args: any) => {
    // 1. Get variant (no auth check for internal use)
    const variant = await ctx.db.get(args.variantId);
    if (!variant) {
      throw new ConvexError('VARIANT_NOT_FOUND');
    }

    return variant;
  },
});

export const getAnimationsByCursor = query({
  args: { cursorId: v.id('cursors') },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 2. Get cursor and verify access
    const cursor = await ctx.db.get(args.cursorId);
    if (!cursor) {
      throw new ConvexError('CURSOR_NOT_FOUND');
    }

    if (cursor.userId !== userId && cursor.visibility === 'private') {
      throw new ConvexError('ACCESS_DENIED');
    }

    // 3. Get animations
    return await ctx.db
      .query('animations')
      .withIndex('by_cursor', (q: any) => q.eq('cursorId', args.cursorId))
      .order('desc')
      .collect();
  },
});

export const searchCursors = query({
  args: {
    query: v.string(),
    userId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // 2. Search cursors
    const targetUserId = args.userId || userId;

    return await ctx.db
      .query('cursors')
      .withSearchIndex('search_cursors', (q: any) =>
        q.search('name', args.query).eq('userId', targetUserId)
      )
      .take(args.limit || 20);
  },
});
