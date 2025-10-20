import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Create or update canvas
export const createCanvas = mutation({
  args: {
    title: v.string(),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvasId = await ctx.db.insert('canvases', {
      title: args.title,
      userId: identity.subject,
      isPublic: args.isPublic || false,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return canvasId;
  },
});

// Get canvas with real-time updates
export const getCanvas = query({
  args: { canvasId: v.id('canvases') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    return canvas;
  },
});

// Update canvas state
export const updateCanvasState = mutation({
  args: {
    canvasId: v.id('canvases'),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    await ctx.db.patch(args.canvasId, {
      data: args.data,
      updatedAt: Date.now(),
    });

    return args.canvasId;
  },
});

// Add node to canvas
export const addNode = mutation({
  args: {
    canvasId: v.id('canvases'),
    nodeId: v.string(),
    type: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    // Add to canvas nodes table
    await ctx.db.insert('canvasNodes', {
      canvasId: args.canvasId,
      nodeId: args.nodeId,
      type: args.type,
      position: args.position,
      data: args.data,
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update canvas data
    const currentData = canvas.data || { nodes: [], edges: [] };
    const newNode = {
      id: args.nodeId,
      type: args.type,
      position: args.position,
      data: args.data,
    };

    await ctx.db.patch(args.canvasId, {
      data: {
        ...currentData,
        nodes: [...currentData.nodes, newNode],
      },
      updatedAt: Date.now(),
    });

    return args.nodeId;
  },
});

// Update node
export const updateNode = mutation({
  args: {
    canvasId: v.id('canvases'),
    nodeId: v.string(),
    data: v.any(),
    position: v.optional(v.object({ x: v.number(), y: v.number() })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    // Update canvas node
    const canvasNode = await ctx.db
      .query('canvasNodes')
      .withIndex('by_canvas_node', (q) => 
        q.eq('canvasId', args.canvasId).eq('nodeId', args.nodeId)
      )
      .first();

    if (canvasNode) {
      await ctx.db.patch(canvasNode._id, {
        data: args.data,
        position: args.position || canvasNode.position,
        updatedAt: Date.now(),
      });
    }

    // Update canvas data
    const currentData = canvas.data || { nodes: [], edges: [] };
    const updatedNodes = currentData.nodes.map((node: any) => 
      node.id === args.nodeId 
        ? { 
            ...node, 
            data: args.data,
            position: args.position || node.position 
          }
        : node
    );

    await ctx.db.patch(args.canvasId, {
      data: {
        ...currentData,
        nodes: updatedNodes,
      },
      updatedAt: Date.now(),
    });

    return args.nodeId;
  },
});

// Delete node
export const deleteNode = mutation({
  args: {
    canvasId: v.id('canvases'),
    nodeId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    // Delete from canvas nodes table
    const canvasNode = await ctx.db
      .query('canvasNodes')
      .withIndex('by_canvas_node', (q) => 
        q.eq('canvasId', args.canvasId).eq('nodeId', args.nodeId)
      )
      .first();

    if (canvasNode) {
      await ctx.db.delete(canvasNode._id);
    }

    // Update canvas data
    const currentData = canvas.data || { nodes: [], edges: [] };
    const updatedNodes = currentData.nodes.filter((node: any) => node.id !== args.nodeId);
    const updatedEdges = currentData.edges.filter((edge: any) => 
      edge.source !== args.nodeId && edge.target !== args.nodeId
    );

    await ctx.db.patch(args.canvasId, {
      data: {
        ...currentData,
        nodes: updatedNodes,
        edges: updatedEdges,
      },
      updatedAt: Date.now(),
    });

    return args.nodeId;
  },
});

// Add edge/connection
export const addEdge = mutation({
  args: {
    canvasId: v.id('canvases'),
    source: v.string(),
    target: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    const currentData = canvas.data || { nodes: [], edges: [] };
    const newEdge = {
      id: `${args.source}-${args.target}`,
      source: args.source,
      target: args.target,
      type: args.type || 'default',
    };

    await ctx.db.patch(args.canvasId, {
      data: {
        ...currentData,
        edges: [...currentData.edges, newEdge],
      },
      updatedAt: Date.now(),
    });

    return newEdge.id;
  },
});

// Delete edge
export const deleteEdge = mutation({
  args: {
    canvasId: v.id('canvases'),
    edgeId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const canvas = await ctx.db.get(args.canvasId);
    if (!canvas || canvas.userId !== identity.subject) {
      throw new Error('Canvas not found');
    }

    const currentData = canvas.data || { nodes: [], edges: [] };
    const updatedEdges = currentData.edges.filter((edge: any) => edge.id !== args.edgeId);

    await ctx.db.patch(args.canvasId, {
      data: {
        ...currentData,
        edges: updatedEdges,
      },
      updatedAt: Date.now(),
    });

    return args.edgeId;
  },
});

// Get user's canvases
export const getUserCanvases = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await ctx.db
      .query('canvases')
      .withIndex('by_user', (q) => q.eq('userId', identity.subject))
      .order('desc')
      .collect();
  },
});
