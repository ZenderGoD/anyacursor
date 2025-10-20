import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// User presence tracking
export const updatePresence = mutation({
  args: {
    canvasId: v.id('canvases'),
    cursor: v.optional(v.object({ x: v.number(), y: v.number() })),
    selection: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Store presence in a temporary table or use Convex's built-in presence
    // For now, we'll use a simple approach with user sessions
    const userId = identity.subject;
    const now = Date.now();

    // This would typically use Convex's presence API
    // For now, we'll simulate with a simple update
    console.log('User presence updated:', { userId, canvasId: args.canvasId, cursor: args.cursor, selection: args.selection });
    
    return { userId, timestamp: now };
  },
});

// Get active users on canvas
export const getActiveUsers = query({
  args: { canvasId: v.id('canvases') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // In a real implementation, this would query presence data
    // For now, return mock data
    return [
      {
        userId: identity.subject,
        name: 'You',
        cursor: { x: 100, y: 200 },
        color: '#3B82F6',
        isActive: true,
      }
    ];
  },
});

// Live cursor updates
export const updateCursor = mutation({
  args: {
    canvasId: v.id('canvases'),
    x: v.number(),
    y: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Update cursor position
    console.log('Cursor updated:', { userId: identity.subject, x: args.x, y: args.y });
    
    return { success: true };
  },
});

// Node selection updates
export const updateSelection = mutation({
  args: {
    canvasId: v.id('canvases'),
    selectedNodes: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    console.log('Selection updated:', { userId: identity.subject, selectedNodes: args.selectedNodes });
    
    return { success: true };
  },
});

// Conflict resolution for simultaneous edits
export const resolveConflict = mutation({
  args: {
    canvasId: v.id('canvases'),
    nodeId: v.string(),
    conflictData: v.any(),
    resolution: v.string(), // 'server', 'client', 'merge'
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Implement conflict resolution logic
    console.log('Conflict resolved:', { 
      userId: identity.subject, 
      nodeId: args.nodeId, 
      resolution: args.resolution 
    });
    
    return { success: true, resolvedData: args.conflictData };
  },
});
