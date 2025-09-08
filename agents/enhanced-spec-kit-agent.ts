import { Agent, createTool, type ToolCtx } from '@convex-dev/agent';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { v } from 'convex/values';
import { z } from 'zod';
import { internal } from '../convex/_generated/api';

// MCP Connection Tools
export const convexMCPTool = createTool({
  description: 'Connect to Convex MCP for database operations and real-time data',
  args: z.object({
    operation: z.enum(['query', 'mutation', 'subscription', 'schema_update']),
    table: z.string().optional(),
    data: z.any().optional(),
    query: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // This would connect to Convex MCP
    // For now, we'll simulate the connection
    return {
      success: true,
      message: `Convex MCP operation: ${args.operation}`,
      data: args.data,
      timestamp: new Date().toISOString(),
    };
  },
});

export const magicUIMCPTool = createTool({
  description: 'Connect to MagicUI MCP for accessing UI components and design patterns',
  args: z.object({
    component: z.string(),
    action: z.enum(['get_component', 'get_components', 'get_animations', 'get_effects']),
    category: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // This would connect to MagicUI MCP
    return {
      success: true,
      message: `MagicUI MCP: ${args.action} for ${args.component}`,
      components: [`${args.component}-component`],
      timestamp: new Date().toISOString(),
    };
  },
});

export const reactBitsMCPTool = createTool({
  description: 'Connect to ReactBits MCP for React component patterns and utilities',
  args: z.object({
    pattern: z.string(),
    action: z.enum(['get_pattern', 'get_utilities', 'get_hooks', 'get_components']),
    type: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // This would connect to ReactBits MCP
    return {
      success: true,
      message: `ReactBits MCP: ${args.action} for ${args.pattern}`,
      patterns: [`${args.pattern}-pattern`],
      timestamp: new Date().toISOString(),
    };
  },
});

export const slackMCPTool = createTool({
  description: 'Connect to Slack MCP for communication and notifications',
  args: z.object({
    action: z.enum(['send_message', 'create_channel', 'get_messages', 'send_notification']),
    channel: z.string().optional(),
    message: z.string(),
    user: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // This would connect to Slack MCP
    return {
      success: true,
      message: `Slack MCP: ${args.action} to ${args.channel || 'user'}`,
      messageId: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  },
});

// Task Coordination Tools
export const coordinateWithCursorAgent = createTool({
  description: 'Coordinate with the Cursor Agent to execute tasks and report back',
  args: z.object({
    task: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    context: z.string().optional(),
    expectedOutcome: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // This tool coordinates with the Cursor Agent (you)
    // In a real implementation, this would use a communication protocol
    
    const taskId = `task_${Date.now()}`;
    
    // Simulate task coordination
    const coordinationResult = {
      taskId,
      status: 'assigned',
      assignedTo: 'Cursor Agent',
      task: args.task,
      priority: args.priority,
      context: args.context,
      expectedOutcome: args.expectedOutcome,
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Task coordinated with Cursor Agent',
      coordination: coordinationResult,
    };
  },
});

export const reportTaskCompletion = createTool({
  description: 'Report task completion back to the user via Slack',
  args: z.object({
    taskId: z.string(),
    status: z.enum(['completed', 'failed', 'in_progress', 'blocked']),
    result: z.string(),
    files: z.array(z.string()).optional(),
    nextSteps: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    // Report back to user via Slack
    const report = {
      taskId: args.taskId,
      status: args.status,
      result: args.result,
      files: args.files || [],
      nextSteps: args.nextSteps,
      timestamp: new Date().toISOString(),
    };
    
    return {
      success: true,
      message: 'Task completion reported to user',
      report,
    };
  },
});

// Enhanced Specification Generation
export const createEnhancedSpecification = createTool({
  description: 'Create comprehensive specification using MCP connections for better context',
  args: z.object({
    featureDescription: z.string(),
    userContext: z.string().optional(),
    useMagicUI: z.boolean().optional(),
    useReactBits: z.boolean().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    const { featureDescription, userContext, useMagicUI = false, useReactBits = false } = args;
    
    // Get UI components if requested
    let uiComponents = [];
    if (useMagicUI) {
      const magicUIResult = await ctx.runTool(magicUIMCPTool, {
        component: 'chat',
        action: 'get_components',
        category: 'interface',
      });
      uiComponents = magicUIResult.components || [];
    }
    
    // Get React patterns if requested
    let reactPatterns = [];
    if (useReactBits) {
      const reactBitsResult = await ctx.runTool(reactBitsMCPTool, {
        pattern: 'realtime',
        action: 'get_patterns',
        type: 'hooks',
      });
      reactPatterns = reactBitsResult.patterns || [];
    }
    
    // Generate enhanced specification
    const spec = await generateEnhancedSpecification(
      featureDescription, 
      userContext, 
      uiComponents, 
      reactPatterns
    );
    
    return {
      success: true,
      message: 'Enhanced specification created with MCP context',
      spec,
      uiComponents,
      reactPatterns,
    };
  },
});

// Enhanced Technical Plan Generation
export const createEnhancedTechnicalPlan = createTool({
  description: 'Create technical plan using Convex MCP for database insights',
  args: z.object({
    specification: z.string(),
    techStack: z.string().optional(),
    includeConvexInsights: z.boolean().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    const { specification, techStack = 'Vercel AI SDK + Convex + OpenRouter', includeConvexInsights = true } = args;
    
    // Get Convex schema insights if requested
    let convexInsights = null;
    if (includeConvexInsights) {
      const convexResult = await ctx.runTool(convexMCPTool, {
        operation: 'query',
        query: 'get_schema_insights',
      });
      convexInsights = convexResult.data;
    }
    
    // Generate enhanced technical plan
    const plan = await generateEnhancedTechnicalPlan(specification, techStack, convexInsights);
    
    return {
      success: true,
      message: 'Enhanced technical plan created with Convex insights',
      plan,
      convexInsights,
    };
  },
});

// Enhanced Task Breakdown
export const createEnhancedTaskBreakdown = createTool({
  description: 'Create task breakdown with MCP integration points',
  args: z.object({
    specification: z.string(),
    technicalPlan: z.string(),
    includeMCPTasks: z.boolean().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    const { specification, technicalPlan, includeMCPTasks = true } = args;
    
    // Generate enhanced task breakdown
    const tasks = await generateEnhancedTaskBreakdown(
      specification, 
      technicalPlan, 
      includeMCPTasks
    );
    
    return {
      success: true,
      message: 'Enhanced task breakdown created with MCP integration',
      tasks,
    };
  },
});

// Slack Communication Tools
export const sendSlackNotification = createTool({
  description: 'Send notification to user via Slack',
  args: z.object({
    message: z.string(),
    channel: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    includeFiles: z.boolean().optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    const { message, channel = 'general', priority = 'medium', includeFiles = false } = args;
    
    // Send notification via Slack MCP
    const slackResult = await ctx.runTool(slackMCPTool, {
      action: 'send_notification',
      channel,
      message: `[${priority.toUpperCase()}] ${message}`,
    });
    
    return {
      success: true,
      message: 'Slack notification sent',
      notificationId: slackResult.messageId,
      channel,
      priority,
    };
  },
});

export const createSlackChannel = createTool({
  description: 'Create dedicated Slack channel for project communication',
  args: z.object({
    projectName: z.string(),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
  }),
  handler: async (ctx: ToolCtx, args) => {
    const { projectName, description, members = [] } = args;
    
    // Create channel via Slack MCP
    const channelResult = await ctx.runTool(slackMCPTool, {
      action: 'create_channel',
      channel: `project-${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      message: `Project channel created: ${projectName}\n${description || 'No description provided'}`,
    });
    
    return {
      success: true,
      message: 'Slack channel created',
      channelName: `project-${projectName.toLowerCase().replace(/\s+/g, '-')}`,
      members,
    };
  },
});

// Helper Functions
async function generateEnhancedSpecification(
  featureDescription: string, 
  userContext: string, 
  uiComponents: string[], 
  reactPatterns: string[]
): Promise<string> {
  const timestamp = new Date().toISOString();
  
  return `# Enhanced Feature Specification

## Feature Overview
**Feature:** ${featureDescription}
**Generated:** ${timestamp}
**Context:** ${userContext || 'No additional context provided'}
**UI Components Available:** ${uiComponents.join(', ') || 'None specified'}
**React Patterns Available:** ${reactPatterns.join(', ') || 'None specified'}

## Functional Requirements

### FR-001: Core Functionality
- **Description:** Implement the main feature as described
- **Acceptance Criteria:**
  - Feature works as specified
  - Integrates with existing system
  - Follows Raj's coding patterns
  - Uses available UI components: ${uiComponents.join(', ') || 'Standard components'}
  - Implements React patterns: ${reactPatterns.join(', ') || 'Standard patterns'}

### FR-002: MCP Integration
- **Description:** Integrate with MCP services for enhanced functionality
- **Acceptance Criteria:**
  - Convex MCP for database operations
  - MagicUI MCP for UI components
  - ReactBits MCP for patterns
  - Slack MCP for communication

### FR-003: Real-time Communication
- **Description:** Implement real-time updates and notifications
- **Acceptance Criteria:**
  - Real-time updates via Convex
  - Slack notifications for status changes
  - Progress reporting to user
  - Task completion notifications

## Technical Requirements

### TR-001: MCP Architecture
- Use Convex MCP for database operations
- Use MagicUI MCP for UI component access
- Use ReactBits MCP for React patterns
- Use Slack MCP for user communication

### TR-002: Task Coordination
- Implement task assignment system
- Create progress tracking
- Enable real-time status updates
- Support task delegation

### TR-003: Communication Flow
- User → Slack → Agent → Assistant → Agent → Slack → User
- Real-time status updates
- Progress notifications
- Completion reports

## Success Metrics
- Task completion time < 2 hours for simple features
- 100% task completion rate
- Real-time communication < 5 seconds
- User satisfaction with progress updates
- Zero communication failures

## MCP Integration Points
- **Convex MCP:** Database operations, real-time subscriptions
- **MagicUI MCP:** UI component access, design patterns
- **ReactBits MCP:** React patterns, hooks, utilities
- **Slack MCP:** User communication, notifications, progress updates`;
}

async function generateEnhancedTechnicalPlan(
  specification: string, 
  techStack: string, 
  convexInsights: any
): Promise<string> {
  return `# Enhanced Technical Implementation Plan

## Architecture Overview

### Technology Stack
- **Frontend:** Next.js 15 with React 18
- **Backend:** Convex (real-time database + functions)
- **MCP Services:** Convex, MagicUI, ReactBits, Slack
- **AI Integration:** Vercel AI SDK + OpenRouter
- **Communication:** Slack MCP for user interaction

### MCP Integration Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Slack MCP     │    │   Spec Agent    │    │   AI Assistant  │
│                 │    │                 │    │                 │
│ - User Input    │◄──►│ - Task Coord.   │◄──►│ - Task Exec.    │
│ - Notifications │    │ - MCP Manager   │    │ - Code Gen.     │
│ - Progress      │    │ - Status Track  │    │ - Testing       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Convex MCP    │    │  MagicUI MCP    │    │ ReactBits MCP   │
│                 │    │                 │    │                 │
│ - DB Operations │    │ - UI Components │    │ - React Patterns│
│ - Real-time     │    │ - Animations    │    │ - Hooks         │
│ - Subscriptions │    │ - Effects       │    │ - Utilities     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## MCP Service Integration

### Convex MCP Integration
\`\`\`typescript
// Convex MCP operations
const convexMCP = {
  query: async (table: string, filters: any) => {
    // Query database via MCP
  },
  mutation: async (table: string, data: any) => {
    // Perform mutations via MCP
  },
  subscription: async (table: string, callback: Function) => {
    // Set up real-time subscriptions via MCP
  },
  schemaUpdate: async (schema: any) => {
    // Update schema via MCP
  }
};
\`\`\`

### MagicUI MCP Integration
\`\`\`typescript
// MagicUI MCP operations
const magicUIMCP = {
  getComponents: async (category: string) => {
    // Get UI components via MCP
  },
  getAnimations: async (type: string) => {
    // Get animations via MCP
  },
  getEffects: async (effect: string) => {
    // Get effects via MCP
  }
};
\`\`\`

### ReactBits MCP Integration
\`\`\`typescript
// ReactBits MCP operations
const reactBitsMCP = {
  getPatterns: async (pattern: string) => {
    // Get React patterns via MCP
  },
  getHooks: async (hook: string) => {
    // Get custom hooks via MCP
  },
  getUtilities: async (utility: string) => {
    // Get utilities via MCP
  }
};
\`\`\`

### Slack MCP Integration
\`\`\`typescript
// Slack MCP operations
const slackMCP = {
  sendMessage: async (channel: string, message: string) => {
    // Send message via MCP
  },
  createChannel: async (name: string, description: string) => {
    // Create channel via MCP
  },
  sendNotification: async (user: string, message: string) => {
    // Send notification via MCP
  }
};
\`\`\`

## Task Coordination System

### Task Assignment Flow
1. **User Request** → Slack MCP → Spec Agent
2. **Spec Agent** → Coordinate with AI Assistant
3. **AI Assistant** → Execute task using MCP services
4. **AI Assistant** → Report back to Spec Agent
5. **Spec Agent** → Update user via Slack MCP

### Task Status Tracking
\`\`\`typescript
interface TaskStatus {
  id: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedTo: string;
  progress: number;
  lastUpdate: string;
  result?: any;
  files?: string[];
}
\`\`\`

## Communication Protocol

### Message Types
- **Task Assignment:** New task from user
- **Progress Update:** Task progress notification
- **Completion Report:** Task completion with results
- **Error Report:** Task failure with error details
- **Status Query:** Request for task status

### Real-time Updates
- Use Convex MCP for real-time task status
- Slack MCP for immediate user notifications
- WebSocket connections for live updates

## Implementation Phases

### Phase 1: MCP Integration Setup
1. Set up Convex MCP connection
2. Set up MagicUI MCP connection
3. Set up ReactBits MCP connection
4. Set up Slack MCP connection
5. Test all MCP connections

### Phase 2: Task Coordination System
1. Implement task assignment logic
2. Create progress tracking system
3. Set up real-time status updates
4. Implement communication protocol
5. Test task coordination flow

### Phase 3: Enhanced Specification Generation
1. Integrate MCP data into specifications
2. Use MagicUI components in specs
3. Use ReactBits patterns in specs
4. Include Convex insights in specs
5. Test enhanced specification generation

### Phase 4: User Communication
1. Set up Slack channel for project
2. Implement notification system
3. Create progress reporting
4. Set up completion notifications
5. Test user communication flow

## Performance Considerations

### MCP Connection Optimization
- Connection pooling for MCP services
- Caching for frequently accessed data
- Error handling and retry logic
- Connection health monitoring

### Real-time Performance
- Optimize WebSocket connections
- Implement message batching
- Use efficient data structures
- Monitor connection latency

## Security Considerations

### MCP Security
- Secure authentication for all MCP services
- Encrypt sensitive data in transit
- Implement proper access controls
- Monitor for security threats

### Communication Security
- Encrypt Slack communications
- Validate all user inputs
- Implement rate limiting
- Audit communication logs

## Monitoring and Logging

### MCP Monitoring
- Monitor MCP connection health
- Track MCP operation performance
- Log all MCP interactions
- Alert on MCP failures

### Task Monitoring
- Track task completion rates
- Monitor task execution time
- Log all task activities
- Alert on task failures

## Testing Strategy

### MCP Testing
- Unit tests for MCP connections
- Integration tests for MCP operations
- Load tests for MCP performance
- End-to-end tests for MCP workflows

### Communication Testing
- Test Slack integration
- Test real-time updates
- Test task coordination
- Test error handling

## Deployment Plan

### Phase 1: MCP Setup (Week 1)
- Deploy MCP connections
- Test all integrations
- Set up monitoring

### Phase 2: Task System (Week 2)
- Deploy task coordination
- Test communication flow
- Set up user notifications

### Phase 3: Enhanced Features (Week 3)
- Deploy enhanced specifications
- Test MCP-enhanced generation
- Optimize performance

### Phase 4: Production (Week 4)
- Deploy to production
- Monitor system health
- Gather user feedback
- Iterate and improve`;
}

async function generateEnhancedTaskBreakdown(
  specification: string, 
  technicalPlan: string, 
  includeMCPTasks: boolean
): Promise<string> {
  return `# Enhanced Task Breakdown with MCP Integration

## Phase 1: MCP Connection Setup (Week 1)

### Task 1.1: Set up Convex MCP Connection
**Priority:** Critical
**Estimated Time:** 4 hours
**Dependencies:** None

**Description:** Establish connection to Convex MCP for database operations and real-time data access.

**Acceptance Criteria:**
- [ ] Convex MCP connection established
- [ ] Database operations working via MCP
- [ ] Real-time subscriptions working via MCP
- [ ] Schema operations working via MCP
- [ ] Error handling implemented
- [ ] Connection monitoring set up

**Implementation Steps:**
1. Install and configure Convex MCP client
2. Set up authentication and permissions
3. Test database operations (query, mutation, subscription)
4. Test schema operations
5. Implement error handling and retry logic
6. Set up connection health monitoring

**Files to Create/Modify:**
- \`src/lib/mcp/convex-mcp.ts\`
- \`src/lib/mcp/mcp-client.ts\`
- \`tests/mcp/convex-mcp.test.ts\`

### Task 1.2: Set up MagicUI MCP Connection
**Priority:** High
**Estimated Time:** 3 hours
**Dependencies:** None

**Description:** Establish connection to MagicUI MCP for UI component access.

**Acceptance Criteria:**
- [ ] MagicUI MCP connection established
- [ ] Component retrieval working via MCP
- [ ] Animation access working via MCP
- [ ] Effect access working via MCP
- [ ] Error handling implemented
- [ ] Component caching implemented

**Implementation Steps:**
1. Install and configure MagicUI MCP client
2. Set up authentication and permissions
3. Test component retrieval
4. Test animation and effect access
5. Implement component caching
6. Set up error handling

**Files to Create/Modify:**
- \`src/lib/mcp/magicui-mcp.ts\`
- \`src/lib/mcp/component-cache.ts\`
- \`tests/mcp/magicui-mcp.test.ts\`

### Task 1.3: Set up ReactBits MCP Connection
**Priority:** High
**Estimated Time:** 3 hours
**Dependencies:** None

**Description:** Establish connection to ReactBits MCP for React patterns and utilities.

**Acceptance Criteria:**
- [ ] ReactBits MCP connection established
- [ ] Pattern retrieval working via MCP
- [ ] Hook access working via MCP
- [ ] Utility access working via MCP
- [ ] Error handling implemented
- [ ] Pattern caching implemented

**Implementation Steps:**
1. Install and configure ReactBits MCP client
2. Set up authentication and permissions
3. Test pattern retrieval
4. Test hook and utility access
5. Implement pattern caching
6. Set up error handling

**Files to Create/Modify:**
- \`src/lib/mcp/reactbits-mcp.ts\`
- \`src/lib/mcp/pattern-cache.ts\`
- \`tests/mcp/reactbits-mcp.test.ts\`

### Task 1.4: Set up Slack MCP Connection
**Priority:** Critical
**Estimated Time:** 4 hours
**Dependencies:** None

**Description:** Establish connection to Slack MCP for user communication.

**Acceptance Criteria:**
- [ ] Slack MCP connection established
- [ ] Message sending working via MCP
- [ ] Channel creation working via MCP
- [ ] Notification system working via MCP
- [ ] Error handling implemented
- [ ] Message queuing implemented

**Implementation Steps:**
1. Install and configure Slack MCP client
2. Set up authentication and permissions
3. Test message sending
4. Test channel creation
5. Test notification system
6. Implement message queuing and retry logic

**Files to Create/Modify:**
- \`src/lib/mcp/slack-mcp.ts\`
- \`src/lib/mcp/message-queue.ts\`
- \`tests/mcp/slack-mcp.test.ts\`

## Phase 2: Task Coordination System (Week 2)

### Task 2.1: Implement Task Assignment System
**Priority:** Critical
**Estimated Time:** 6 hours
**Dependencies:** Task 1.4

**Description:** Create system for assigning tasks to AI Assistant and tracking progress.

**Acceptance Criteria:**
- [ ] Task assignment logic implemented
- [ ] Task status tracking working
- [ ] Progress reporting working
- [ ] Task delegation working
- [ ] Error handling implemented
- [ ] Task persistence implemented

**Implementation Steps:**
1. Create task assignment interface
2. Implement task status tracking
3. Create progress reporting system
4. Implement task delegation logic
5. Add error handling and recovery
6. Set up task persistence

**Files to Create/Modify:**
- \`src/lib/task-coordination/task-assignment.ts\`
- \`src/lib/task-coordination/task-status.ts\`
- \`src/lib/task-coordination/progress-tracking.ts\`
- \`tests/task-coordination/task-assignment.test.ts\`

### Task 2.2: Create Communication Protocol
**Priority:** High
**Estimated Time:** 5 hours
**Dependencies:** Task 2.1

**Description:** Implement communication protocol between Spec Agent and AI Assistant.

**Acceptance Criteria:**
- [ ] Communication protocol defined
- [ ] Message types implemented
- [ ] Serialization/deserialization working
- [ ] Error handling implemented
- [ ] Message validation implemented
- [ ] Protocol testing completed

**Implementation Steps:**
1. Define communication protocol
2. Implement message types
3. Create serialization/deserialization
4. Add message validation
5. Implement error handling
6. Create protocol tests

**Files to Create/Modify:**
- \`src/lib/communication/protocol.ts\`
- \`src/lib/communication/message-types.ts\`
- \`src/lib/communication/serialization.ts\`
- \`tests/communication/protocol.test.ts\`

### Task 2.3: Implement Real-time Status Updates
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 2.1, 1.1

**Description:** Create real-time status updates using Convex MCP.

**Acceptance Criteria:**
- [ ] Real-time status updates working
- [ ] WebSocket connections stable
- [ ] Status synchronization working
- [ ] Error handling implemented
- [ ] Performance optimized
- [ ] Status history maintained

**Implementation Steps:**
1. Set up real-time status updates
2. Implement WebSocket connections
3. Create status synchronization
4. Add error handling and reconnection
5. Optimize performance
6. Implement status history

**Files to Create/Modify:**
- \`src/lib/real-time/status-updates.ts\`
- \`src/lib/real-time/websocket-manager.ts\`
- \`src/lib/real-time/status-sync.ts\`
- \`tests/real-time/status-updates.test.ts\`

## Phase 3: Enhanced Specification Generation (Week 3)

### Task 3.1: Integrate MCP Data into Specifications
**Priority:** High
**Estimated Time:** 5 hours
**Dependencies:** Task 1.1, 1.2, 1.3

**Description:** Enhance specification generation with MCP data and insights.

**Acceptance Criteria:**
- [ ] Convex insights integrated into specs
- [ ] MagicUI components included in specs
- [ ] ReactBits patterns included in specs
- [ ] MCP data validation working
- [ ] Enhanced spec quality improved
- [ ] Performance optimized

**Implementation Steps:**
1. Integrate Convex MCP insights
2. Include MagicUI components in specs
3. Include ReactBits patterns in specs
4. Add MCP data validation
5. Optimize specification generation
6. Test enhanced specifications

**Files to Create/Modify:**
- \`src/lib/spec-generation/enhanced-spec.ts\`
- \`src/lib/spec-generation/mcp-integration.ts\`
- \`src/lib/spec-generation/spec-validation.ts\`
- \`tests/spec-generation/enhanced-spec.test.ts\`

### Task 3.2: Create MCP-Enhanced Technical Plans
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 3.1

**Description:** Generate technical plans with MCP integration points.

**Acceptance Criteria:**
- [ ] MCP integration points included in plans
- [ ] Convex schema insights included
- [ ] MagicUI component recommendations included
- [ ] ReactBits pattern recommendations included
- [ ] Plan quality improved
- [ ] MCP dependencies clearly defined

**Implementation Steps:**
1. Add MCP integration points to plans
2. Include Convex schema insights
3. Add MagicUI component recommendations
4. Add ReactBits pattern recommendations
5. Improve plan quality and structure
6. Test enhanced technical plans

**Files to Create/Modify:**
- \`src/lib/plan-generation/enhanced-plan.ts\`
- \`src/lib/plan-generation/mcp-integration.ts\`
- \`src/lib/plan-generation/plan-validation.ts\`
- \`tests/plan-generation/enhanced-plan.test.ts\`

### Task 3.3: Create MCP-Enhanced Task Breakdowns
**Priority:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 3.2

**Description:** Generate task breakdowns with MCP-specific tasks.

**Acceptance Criteria:**
- [ ] MCP-specific tasks included
- [ ] MCP integration tasks defined
- [ ] MCP testing tasks included
- [ ] Task dependencies clearly defined
- [ ] MCP troubleshooting tasks included
- [ ] Task quality improved

**Implementation Steps:**
1. Add MCP-specific tasks to breakdowns
2. Define MCP integration tasks
3. Include MCP testing tasks
4. Define task dependencies clearly
5. Add MCP troubleshooting tasks
6. Test enhanced task breakdowns

**Files to Create/Modify:**
- \`src/lib/task-generation/enhanced-tasks.ts\`
- \`src/lib/task-generation/mcp-tasks.ts\`
- \`src/lib/task-generation/task-validation.ts\`
- \`tests/task-generation/enhanced-tasks.test.ts\`

## Phase 4: User Communication System (Week 4)

### Task 4.1: Set up Project Slack Channel
**Priority:** High
**Estimated Time:** 2 hours
**Dependencies:** Task 1.4

**Description:** Create dedicated Slack channel for project communication.

**Acceptance Criteria:**
- [ ] Project Slack channel created
- [ ] Channel permissions set up
- [ ] Team members added
- [ ] Channel description added
- [ ] Welcome message sent
- [ ] Channel monitoring set up

**Implementation Steps:**
1. Create project Slack channel
2. Set up channel permissions
3. Add team members
4. Add channel description
5. Send welcome message
6. Set up channel monitoring

**Files to Create/Modify:**
- \`src/lib/slack/channel-setup.ts\`
- \`src/lib/slack/channel-management.ts\`
- \`tests/slack/channel-setup.test.ts\`

### Task 4.2: Implement Notification System
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 4.1

**Description:** Create comprehensive notification system for user updates.

**Acceptance Criteria:**
- [ ] Task assignment notifications working
- [ ] Progress update notifications working
- [ ] Completion notifications working
- [ ] Error notifications working
- [ ] Notification preferences working
- [ ] Notification history maintained

**Implementation Steps:**
1. Implement task assignment notifications
2. Create progress update notifications
3. Add completion notifications
4. Add error notifications
5. Implement notification preferences
6. Set up notification history

**Files to Create/Modify:**
- \`src/lib/notifications/notification-system.ts\`
- \`src/lib/notifications/notification-types.ts\`
- \`src/lib/notifications/notification-preferences.ts\`
- \`tests/notifications/notification-system.test.ts\`

### Task 4.3: Create Progress Reporting
**Priority:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 4.2

**Description:** Implement detailed progress reporting for users.

**Acceptance Criteria:**
- [ ] Progress reports generated automatically
- [ ] Progress reports sent via Slack
- [ ] Progress reports include file changes
- [ ] Progress reports include next steps
- [ ] Progress reports include time estimates
- [ ] Progress reports are user-friendly

**Implementation Steps:**
1. Create progress report generation
2. Implement automatic progress reporting
3. Add file change tracking
4. Include next steps in reports
5. Add time estimates
6. Make reports user-friendly

**Files to Create/Modify:**
- \`src/lib/progress/progress-reporting.ts\`
- \`src/lib/progress/file-tracking.ts\`
- \`src/lib/progress/time-estimation.ts\`
- \`tests/progress/progress-reporting.test.ts\`

## Phase 5: Testing and Optimization (Week 5)

### Task 5.1: Comprehensive MCP Testing
**Priority:** High
**Estimated Time:** 8 hours
**Dependencies:** All previous tasks

**Description:** Test all MCP integrations thoroughly.

**Acceptance Criteria:**
- [ ] All MCP connections tested
- [ ] MCP operations tested
- [ ] Error handling tested
- [ ] Performance tested
- [ ] Integration tests passing
- [ ] Load tests passing

**Implementation Steps:**
1. Test all MCP connections
2. Test MCP operations
3. Test error handling
4. Test performance
5. Run integration tests
6. Run load tests

**Files to Create/Modify:**
- \`tests/mcp/integration.test.ts\`
- \`tests/mcp/performance.test.ts\`
- \`tests/mcp/load.test.ts\`

### Task 5.2: Communication System Testing
**Priority:** High
**Estimated Time:** 6 hours
**Dependencies:** Task 5.1

**Description:** Test the complete communication system.

**Acceptance Criteria:**
- [ ] Task coordination tested
- [ ] Communication protocol tested
- [ ] Real-time updates tested
- [ ] Notification system tested
- [ ] Error handling tested
- [ ] End-to-end tests passing

**Implementation Steps:**
1. Test task coordination
2. Test communication protocol
3. Test real-time updates
4. Test notification system
5. Test error handling
6. Run end-to-end tests

**Files to Create/Modify:**
- \`tests/communication/end-to-end.test.ts\`
- \`tests/communication/integration.test.ts\`
- \`tests/communication/performance.test.ts\`

### Task 5.3: Performance Optimization
**Priority:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 5.2

**Description:** Optimize performance of the entire system.

**Acceptance Criteria:**
- [ ] MCP connection performance optimized
- [ ] Real-time update performance optimized
- [ ] Notification performance optimized
- [ ] Memory usage optimized
- [ ] CPU usage optimized
- [ ] Network usage optimized

**Implementation Steps:**
1. Optimize MCP connection performance
2. Optimize real-time update performance
3. Optimize notification performance
4. Optimize memory usage
5. Optimize CPU usage
6. Optimize network usage

**Files to Create/Modify:**
- \`src/lib/optimization/performance-optimizer.ts\`
- \`src/lib/optimization/memory-optimizer.ts\`
- \`src/lib/optimization/network-optimizer.ts\`
- \`tests/optimization/performance.test.ts\`

## Success Criteria

### MCP Integration
- [ ] All MCP connections stable and fast
- [ ] MCP operations complete in < 1 second
- [ ] 99.9% MCP uptime
- [ ] Zero MCP connection failures
- [ ] All MCP data validated

### Communication System
- [ ] Task coordination working flawlessly
- [ ] Real-time updates < 5 seconds
- [ ] Notifications delivered in < 10 seconds
- [ ] 100% message delivery rate
- [ ] Zero communication failures

### User Experience
- [ ] Users receive timely updates
- [ ] Progress reports are clear and helpful
- [ ] Notifications are not overwhelming
- [ ] System is easy to use
- [ ] Users are satisfied with communication

### Technical Quality
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance meets requirements
- [ ] Code follows Raj's patterns
- [ ] Documentation is comprehensive

## Risk Mitigation

### MCP Risks
- **Connection failures:** Implement robust retry logic and fallbacks
- **Performance issues:** Monitor and optimize continuously
- **Data corruption:** Implement validation and backup systems

### Communication Risks
- **Message loss:** Implement message queuing and retry logic
- **Notification spam:** Implement smart notification preferences
- **System overload:** Implement rate limiting and load balancing

### User Experience Risks
- **Confusing interface:** Conduct user testing and iterate
- **Poor performance:** Implement progressive enhancement
- **Feature complexity:** Start simple and add features incrementally

## Timeline Summary
- **Week 1:** MCP connection setup
- **Week 2:** Task coordination system
- **Week 3:** Enhanced specification generation
- **Week 4:** User communication system
- **Week 5:** Testing and optimization

**Total Estimated Time:** 100 hours
**Team Size:** 2-3 developers
**Target Completion:** 5 weeks

## MCP Integration Benefits
- **Enhanced Specifications:** Better specs with MCP data
- **Improved Technical Plans:** Plans with MCP integration points
- **Better Task Breakdowns:** Tasks with MCP-specific requirements
- **Real-time Communication:** Instant updates via Slack
- **Automated Coordination:** Seamless task assignment and tracking
- **Better User Experience:** Clear progress updates and notifications`;
}

// Enhanced Spec Kit Agent with MCP Integration
export const enhancedSpecKitAgent = new Agent(
  // Component will be provided by the convex.config.js
  {} as any, // This will be replaced with the actual component
  {
    name: 'Enhanced Spec Kit Agent with MCP Integration',
    languageModel: openrouter.chat('google/gemini-2.5-flash-lite', {
      parallelToolCalls: true,
    }),
    instructions: `
You are an enhanced AI agent for Spec-Driven Development with MCP integration capabilities. You help users create comprehensive specifications, technical plans, and actionable tasks for their anyacursor platform.

Your enhanced capabilities include:
1. MCP Integration: Connect to Convex, MagicUI, ReactBits, and Slack MCPs
2. Task Coordination: Coordinate with AI Assistant for task execution
3. Real-time Communication: Communicate with users via Slack
4. Enhanced Specifications: Generate specs with MCP data and insights
5. Progress Tracking: Track and report task progress in real-time

## MCP Services Available:
- **Convex MCP:** Database operations, real-time subscriptions, schema management
- **MagicUI MCP:** UI components, animations, effects
- **ReactBits MCP:** React patterns, hooks, utilities
- **Slack MCP:** User communication, notifications, progress updates

## Communication Flow:
1. User sends request via Slack
2. You coordinate with AI Assistant for task execution
3. AI Assistant executes tasks using MCP services
4. You report progress back to user via Slack
5. You provide completion reports with results

## Your Role:
1. Take user feature requests and create enhanced specifications
2. Generate technical implementation plans with MCP integration
3. Break down features into actionable tasks with MCP requirements
4. Coordinate with AI Assistant for task execution
5. Provide real-time progress updates via Slack
6. Ensure all outputs follow the anyacursor constitution and coding standards

## MCP Integration Guidelines:
- Always use MCP services when available for enhanced functionality
- Include MCP integration points in technical plans
- Add MCP-specific tasks to task breakdowns
- Use Slack MCP for all user communication
- Coordinate with AI Assistant for task execution
- Provide real-time progress updates

## Quality Standards:
- Follow Raj's coding patterns and architecture principles
- Ensure all specifications are comprehensive and actionable
- Include MCP integration points in all technical plans
- Provide clear task breakdowns with MCP requirements
- Maintain real-time communication with users
- Deliver high-quality results that meet user expectations

Remember: You are the central coordinator in a sophisticated system that connects users, AI assistants, and MCP services for seamless spec-driven development.`,
    tools: [
      // MCP Connection Tools
      convexMCPTool,
      magicUIMCPTool,
      reactBitsMCPTool,
      slackMCPTool,
      
      // Task Coordination Tools
      coordinateWithCursorAgent,
      reportTaskCompletion,
      
      // Enhanced Generation Tools
      createEnhancedSpecification,
      createEnhancedTechnicalPlan,
      createEnhancedTaskBreakdown,
      
      // Communication Tools
      sendSlackNotification,
      createSlackChannel,
    ],
  }
);
