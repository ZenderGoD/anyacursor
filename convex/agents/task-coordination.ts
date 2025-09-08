import { v } from 'convex/values';
import { mutation, query, action } from '../_generated/server';
import { Doc, Id } from '../_generated/dataModel';
import { internal } from '../_generated/api';

// Task Status Types
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskType = 'specification' | 'plan' | 'tasks' | 'implementation' | 'testing' | 'deployment';

// Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: 'Spec Kit Agent' | 'Enhanced Spec Kit Agent' | 'Cursor Agent' | 'unassigned';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  context?: string;
  expectedOutcome?: string;
  result?: string;
  files?: string[];
  nextSteps?: string;
  progress: number; // 0-100
  dependencies?: string[];
  tags?: string[];
}

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal('specification'),
      v.literal('plan'),
      v.literal('tasks'),
      v.literal('implementation'),
      v.literal('testing'),
      v.literal('deployment')
    ),
    priority: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    assignedTo: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent'),
      v.literal('unassigned')
    ),
    createdBy: v.string(),
    context: v.optional(v.string()),
    expectedOutcome: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    dependencies: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const task: Task = {
      id: taskId,
      title: args.title,
      description: args.description,
      type: args.type,
      priority: args.priority,
      status: 'pending',
      assignedTo: args.assignedTo,
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
      dueDate: args.dueDate,
      context: args.context,
      expectedOutcome: args.expectedOutcome,
      progress: 0,
      dependencies: args.dependencies || [],
      tags: args.tags || [],
    };

    // Store task in database
    await ctx.db.insert('tasks', task);

    return {
      success: true,
      taskId,
      task,
    };
  },
});

// Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('blocked')
    ),
    progress: v.optional(v.number()),
    result: v.optional(v.string()),
    files: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('id'), args.taskId))
      .first();

    if (!task) {
      throw new Error('Task not found');
    }

    const updates: Partial<Task> = {
      status: args.status,
      updatedAt: new Date().toISOString(),
    };

    if (args.progress !== undefined) {
      updates.progress = args.progress;
    }

    if (args.result !== undefined) {
      updates.result = args.result;
    }

    if (args.files !== undefined) {
      updates.files = args.files;
    }

    if (args.nextSteps !== undefined) {
      updates.nextSteps = args.nextSteps;
    }

    await ctx.db.patch(task._id, updates);

    return {
      success: true,
      taskId: args.taskId,
      status: args.status,
      progress: args.progress,
    };
  },
});

// Assign task to agent
export const assignTask = mutation({
  args: {
    taskId: v.string(),
    assignedTo: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('id'), args.taskId))
      .first();

    if (!task) {
      throw new Error('Task not found');
    }

    await ctx.db.patch(task._id, {
      assignedTo: args.assignedTo,
      status: 'assigned',
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      taskId: args.taskId,
      assignedTo: args.assignedTo,
    };
  },
});

// Get task by ID
export const getTask = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    const task = await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('id'), args.taskId))
      .first();

    return task;
  },
});

// Get all tasks
export const getAllTasks = query({
  args: {
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('assigned'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('blocked')
    )),
    assignedTo: v.optional(v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent'),
      v.literal('unassigned')
    )),
    type: v.optional(v.union(
      v.literal('specification'),
      v.literal('plan'),
      v.literal('tasks'),
      v.literal('implementation'),
      v.literal('testing'),
      v.literal('deployment')
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('tasks');

    if (args.status) {
      query = query.filter((q) => q.eq(q.field('status'), args.status));
    }

    if (args.assignedTo) {
      query = query.filter((q) => q.eq(q.field('assignedTo'), args.assignedTo));
    }

    if (args.type) {
      query = query.filter((q) => q.eq(q.field('type'), args.type));
    }

    return await query.order('desc').collect();
  },
});

// Get tasks assigned to specific agent
export const getTasksForAgent = query({
  args: {
    agent: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tasks')
      .filter((q) => q.eq(q.field('assignedTo'), args.agent))
      .order('desc')
      .collect();
  },
});

// Coordinate task between agents
export const coordinateTask = action({
  args: {
    taskId: v.string(),
    fromAgent: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    ),
    toAgent: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    ),
    message: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, simulate task coordination since internal functions don't exist yet
    // In a real implementation, we would:
    // 1. Get the task from the database
    // 2. Update task assignment
    // 3. Create coordination log entry

    // Create coordination log entry
    const coordinationId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const coordination = {
      id: coordinationId,
      taskId: args.taskId,
      fromAgent: args.fromAgent,
      toAgent: args.toAgent,
      message: args.message,
      context: args.context,
      timestamp: new Date().toISOString(),
    };

    // Note: We'll need to create a mutation for this since actions can't directly insert
    // For now, we'll simulate the coordination

    return {
      success: true,
      coordinationId,
      taskId: args.taskId,
      fromAgent: args.fromAgent,
      toAgent: args.toAgent,
      message: args.message,
    };
  },
});

// Report task completion
export const reportTaskCompletion = action({
  args: {
    taskId: v.string(),
    agent: v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    ),
    status: v.union(
      v.literal('completed'),
      v.literal('failed'),
      v.literal('blocked')
    ),
    result: v.string(),
    files: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, simulate task completion reporting
    // In a real implementation, we would update task status in the database

    // Create completion report
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const report = {
      id: reportId,
      taskId: args.taskId,
      agent: args.agent,
      status: args.status,
      result: args.result,
      files: args.files || [],
      nextSteps: args.nextSteps,
      timestamp: new Date().toISOString(),
    };

    // Note: We'll need to create a mutation for this since actions can't directly insert
    // For now, we'll simulate the report

    return {
      success: true,
      reportId,
      taskId: args.taskId,
      status: args.status,
      result: args.result,
    };
  },
});

// Get coordination history for a task
export const getTaskCoordinationHistory = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('taskCoordination')
      .filter((q) => q.eq(q.field('taskId'), args.taskId))
      .order('asc')
      .collect();
  },
});

// Get task reports
export const getTaskReports = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('taskReports')
      .filter((q) => q.eq(q.field('taskId'), args.taskId))
      .order('desc')
      .collect();
  },
});

// Get agent performance metrics
export const getAgentMetrics = query({
  args: {
    agent: v.optional(v.union(
      v.literal('Spec Kit Agent'),
      v.literal('Enhanced Spec Kit Agent'),
      v.literal('Cursor Agent')
    )),
    timeRange: v.optional(v.union(
      v.literal('24h'),
      v.literal('7d'),
      v.literal('30d'),
      v.literal('all')
    )),
  },
  handler: async (ctx, args) => {
    const timeRange = args.timeRange || '7d';
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    let query = ctx.db.query('tasks');

    if (args.agent) {
      query = query.filter((q) => q.eq(q.field('assignedTo'), args.agent));
    }

    const tasks = await query.collect();
    const filteredTasks = tasks.filter(task => 
      new Date(task.createdAt) >= startDate
    );

    const metrics = {
      totalTasks: filteredTasks.length,
      completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
      failedTasks: filteredTasks.filter(t => t.status === 'failed').length,
      inProgressTasks: filteredTasks.filter(t => t.status === 'in_progress').length,
      pendingTasks: filteredTasks.filter(t => t.status === 'pending').length,
      averageCompletionTime: 0, // Calculate based on completed tasks
      successRate: 0, // Calculate success rate
    };

    // Calculate success rate
    if (metrics.totalTasks > 0) {
      metrics.successRate = (metrics.completedTasks / metrics.totalTasks) * 100;
    }

    return metrics;
  },
});
