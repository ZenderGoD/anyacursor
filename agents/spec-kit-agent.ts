import { Agent, createTool, type ToolCtx } from '@convex-dev/agent';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { v } from 'convex/values';
import { z } from 'zod';
import { internal } from '../convex/_generated/api';

// Tool definitions first
export const createSpecification = createTool({
  description: 'Create a comprehensive specification for a feature request',
  args: z.object({
    featureDescription: z.string(),
    userContext: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args: { featureDescription: string; userContext?: string }) => {
    const { featureDescription, userContext } = args;
    
    // Generate specification using the cursor spec template
    const spec = await generateSpecification(featureDescription, userContext);
    
    // TODO: Save to memory for reference when specKit mutations are implemented
    // await ctx.runMutation(internal.specKit.mutations.saveSpecification, {
    //   content: spec,
    //   featureDescription,
    //   status: 'draft',
    // });
    
    return {
      success: true,
      message: 'Specification created successfully',
      spec: spec,
    };
  },
});

export const createTechnicalPlan = createTool({
  description: 'Create a technical implementation plan from a specification',
  args: z.object({
    specification: z.string(),
    techStack: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args: { specification: string; techStack?: string }) => {
    const { specification, techStack = 'Vercel AI SDK + Convex + OpenRouter' } = args;
    
    // Generate technical plan using the AI SDK plan template
    const plan = await generateTechnicalPlan(specification, techStack);
    
    // TODO: Save to memory for reference when specKit mutations are implemented
    // await ctx.runMutation(internal.specKit.mutations.saveTechnicalPlan, {
    //   content: plan,
    //   specification,
    //   status: 'draft',
    // });
    
    return {
      success: true,
      message: 'Technical plan created successfully',
      plan: plan,
    };
  },
});

export const createTaskBreakdown = createTool({
  description: 'Break down a technical plan into actionable tasks',
  args: z.object({
    technicalPlan: z.string(),
    estimatedEffort: z.string().optional(),
  }),
  handler: async (ctx: ToolCtx, args: { technicalPlan: string; estimatedEffort?: string }) => {
    const { technicalPlan, estimatedEffort = '3-4 days' } = args;
    
    // Generate task breakdown using the AI SDK tasks template
    const tasks = await generateTaskBreakdown(technicalPlan, estimatedEffort);
    
    // TODO: Save to memory for reference when specKit mutations are implemented
    // await ctx.runMutation(internal.specKit.mutations.saveTaskBreakdown, {
    //   content: tasks,
    //   technicalPlan,
    //   status: 'ready',
    // });
    
    return {
      success: true,
      message: 'Task breakdown created successfully',
      tasks: tasks,
    };
  },
});

// Helper functions for generating content
async function generateSpecification(featureDescription: string, userContext?: string): Promise<string> {
  const template = `
# Feature Specification: ${extractFeatureName(featureDescription)}

**Feature Branch**: \`${generateBranchName(featureDescription)}\`  
**Created**: ${new Date().toISOString().split('T')[0]}  
**Status**: Draft  
**Input**: User description: "${featureDescription}"

## Execution Flow (main)
\`\`\`
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: cursor types, AI models, user interactions, data flow
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (cursor-specific data)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
\`\`\`

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY for cursor generation
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers
- 🎯 Consider cursor-specific requirements (formats, sizes, performance)

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
${generateUserStory(featureDescription)}

### Acceptance Scenarios
${generateAcceptanceScenarios(featureDescription)}

### Edge Cases
${generateEdgeCases(featureDescription)}

## Requirements *(mandatory)*

### Functional Requirements
${generateFunctionalRequirements(featureDescription)}

### Key Entities *(include if feature involves data)*
${generateKeyEntities(featureDescription)}

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---
`;

  return template;
}

async function generateTechnicalPlan(specification: string, techStack: string): Promise<string> {
  const template = `
# Technical Implementation Plan: ${extractFeatureName(specification)}

**Feature**: ${extractFeatureName(specification)}  
**Created**: ${new Date().toISOString().split('T')[0]}  
**Status**: Draft  
**Tech Stack**: ${techStack}

## Architecture Overview

### Frontend Components (Raj's Pattern)
${generateFrontendComponents(specification)}

### Backend Architecture (Raj's Pattern)
${generateBackendArchitecture(specification)}

### AI Integration (Vercel AI SDK + Raj's Pattern)
${generateAIIntegration(specification)}

## Implementation Phases

### Phase 1: Core Infrastructure
${generatePhase1(specification)}

### Phase 2: Enhanced User Experience
${generatePhase2(specification)}

### Phase 3: Performance & Scale
${generatePhase3(specification)}

## Technical Decisions

### Database Design (Raj's Pattern)
\`\`\`typescript
${generateDatabaseDesign(specification)}
\`\`\`

### AI SDK Tool Definitions (Raj's Pattern)
\`\`\typescript
${generateAISDKTools(specification)}
\`\`\`

### Frontend Chat Interface (Raj's Pattern)
\`\`\`typescript
${generateFrontendInterface(specification)}
\`\`\`

## Security & Validation (Raj's Pattern)
${generateSecurityValidation(specification)}

## Testing Strategy
${generateTestingStrategy(specification)}

## Deployment Considerations
${generateDeploymentConsiderations(specification)}

---

## Next Steps
1. Review and approve this technical plan
2. Use \`/tasks\` command to break down into actionable tasks
3. Begin implementation with Phase 1 components
4. Set up monitoring and testing infrastructure
`;

  return template;
}

async function generateTaskBreakdown(technicalPlan: string, estimatedEffort: string): Promise<string> {
  const template = `
# Implementation Tasks: ${extractFeatureName(technicalPlan)}

**Feature**: ${extractFeatureName(technicalPlan)}  
**Created**: ${new Date().toISOString().split('T')[0]}  
**Status**: Ready for Implementation  
**Estimated Effort**: ${estimatedEffort}

## Task Breakdown

### 🏗️ Phase 1: Core Infrastructure (Day 1-2)

#### Task 1.1: Database Schema Updates (Raj's Pattern)
**Priority**: High | **Effort**: 2-3 hours | **Dependencies**: None

${generateTask1_1(technicalPlan)}

#### Task 1.2: Vercel AI SDK Setup (Raj's Pattern)
**Priority**: High | **Effort**: 3-4 hours | **Dependencies**: Task 1.1

${generateTask1_2(technicalPlan)}

#### Task 1.3: Basic Chat Interface (Raj's Pattern)
**Priority**: Medium | **Effort**: 3-4 hours | **Dependencies**: Task 1.2

${generateTask1_3(technicalPlan)}

### 🎨 Phase 2: Enhanced User Experience (Day 2-3)

#### Task 2.1: Advanced Tool Calling (Raj's Pattern)
**Priority**: High | **Effort**: 3-4 hours | **Dependencies**: Task 1.3

${generateTask2_1(technicalPlan)}

#### Task 2.2: Cursor Management Tools (Raj's Pattern)
**Priority**: Medium | **Effort**: 4-5 hours | **Dependencies**: Task 2.1

${generateTask2_2(technicalPlan)}

### ⚡ Phase 3: Performance & Polish (Day 3-4)

#### Task 3.1: Performance Optimization (Raj's Pattern)
**Priority**: Medium | **Effort**: 2-3 hours | **Dependencies**: Task 2.2

${generateTask3_1(technicalPlan)}

#### Task 3.2: Error Handling & Validation (Raj's Pattern)
**Priority**: High | **Effort**: 2-3 hours | **Dependencies**: Task 3.1

${generateTask3_2(technicalPlan)}

### 🧪 Testing & Documentation (Day 4)

#### Task 4.1: Testing (Raj's Pattern)
**Priority**: High | **Effort**: 2-3 hours | **Dependencies**: Task 3.2

${generateTask4_1(technicalPlan)}

#### Task 4.2: Documentation & Deployment (Raj's Pattern)
**Priority**: Medium | **Effort**: 1-2 hours | **Dependencies**: Task 4.1

${generateTask4_2(technicalPlan)}

## Implementation Notes

### Development Order
${generateDevelopmentOrder(technicalPlan)}

### Risk Mitigation
${generateRiskMitigation(technicalPlan)}

### Success Metrics
${generateSuccessMetrics(technicalPlan)}

---

## Ready to Start?
All tasks are properly scoped and dependencies are clear. Begin with Task 1.1 and work through the phases systematically.
`;

  return template;
}

// Helper functions for content generation
function extractFeatureName(text: string): string {
  // Extract feature name from text
  const words = text.split(' ');
  return words.slice(0, 3).join(' ').replace(/[^a-zA-Z0-9\s]/g, '');
}

function generateBranchName(featureDescription: string): string {
  const words = featureDescription.toLowerCase().split(' ').slice(0, 3);
  return `001-${words.join('-')}`;
}

function generateUserStory(featureDescription: string): string {
  return `A user wants to ${featureDescription.toLowerCase()}, allowing them to create and manage cursor designs through a conversational AI interface.`;
}

function generateAcceptanceScenarios(featureDescription: string): string {
  return `1. **Given** a user wants to generate a cursor, **When** they describe their needs to the AI, **Then** the system generates the cursor and provides real-time updates
2. **Given** a user has generated cursors, **When** they ask to manage their collection, **Then** the system shows their cursors and allows updates
3. **Given** a user generates a cursor, **When** the generation fails, **Then** they receive clear error messages and can retry`;
}

function generateEdgeCases(featureDescription: string): string {
  return `- What happens when AI generation fails or times out?
- How does the system handle different cursor formats and sizes?
- What if users exceed generation limits or storage quotas?
- How are cursor variants managed and organized?`;
}

function generateFunctionalRequirements(featureDescription: string): string {
  return `- **FR-001**: System MUST provide a conversational AI interface for cursor generation
- **FR-002**: System MUST support multiple cursor formats (cur, ani, png) and sizes (16x16, 32x32, 64x64)
- **FR-003**: Users MUST be able to manage their cursor collection through natural language
- **FR-004**: System MUST provide real-time updates during cursor generation
- **FR-005**: System MUST handle generation failures gracefully with user-friendly messages`;
}

function generateKeyEntities(featureDescription: string): string {
  return `- **Cursor**: Represents a cursor design with metadata, format, and generation status
- **Cursor Variant**: Represents different versions of a cursor design
- **Generation Request**: Tracks the AI generation process and status
- **Chat Message**: Represents user interactions with the AI assistant`;
}

function generateFrontendComponents(specification: string): string {
  return `- **CursorChatInterface**: Main chat interface for AI interactions
- **ToolCallDisplay**: Component for displaying AI tool calls and results
- **CursorPreview**: Real-time preview of generated cursors
- **GenerationStatus**: Status indicators for ongoing generation processes`;
}

function generateBackendArchitecture(specification: string): string {
  return `- **Convex Mutations**: Handle cursor creation and status updates
- **Convex Actions**: Manage AI generation workflows and external API calls
- **Convex Queries**: Real-time data fetching for cursors and generation status
- **Storage Integration**: Convex storage for generated cursor files`;
}

function generateAIIntegration(specification: string): string {
  return `- **Vercel AI SDK**: Tool calling and chat interface
- **OpenRouter API**: Multi-model AI generation capabilities
- **Tool Definitions**: Cursor generation and management tools
- **Streaming Responses**: Real-time AI responses with tool calls`;
}

function generatePhase1(specification: string): string {
  return `1. **Database Schema Updates**
   - Add cursor-related tables with proper indexes
   - Add generation tracking tables
   - Update existing schema for cursor relationships

2. **AI SDK Integration**
   - Set up Vercel AI SDK with OpenRouter
   - Create cursor generation tools
   - Implement streaming chat interface

3. **Basic UI Components**
   - AI chat interface with tool calling
   - Cursor generation form
   - Simple cursor display`;
}

function generatePhase2(specification: string): string {
  return `1. **Real-time Updates**
   - WebSocket integration for live generation status
   - Optimistic UI updates
   - Error handling and retry mechanisms

2. **Advanced Features**
   - Multi-step tool calling
   - Cursor variant management
   - Generation history and analytics`;
}

function generatePhase3(specification: string): string {
  return `1. **Optimization**
   - Cursor file optimization and caching
   - Query performance improvements
   - Rate limiting and cost controls

2. **Advanced AI Features**
   - Prompt suggestions and templates
   - Style transfer capabilities
   - Quality scoring and filtering`;
}

function generateDatabaseDesign(specification: string): string {
  return `// Convex Schema Additions
cursors: defineTable({
  name: v.string(),
  prompt: v.string(),
  format: v.union(v.literal('cur'), v.literal('ani'), v.literal('png')),
  size: v.union(v.literal('16x16'), v.literal('32x32'), v.literal('64x64')),
  ownerId: v.id('users'),
  status: v.union(
    v.literal('pending'),
    v.literal('processing'),
    v.literal('completed'),
    v.literal('failed')
  ),
})
  .index('by_owner', ['ownerId'])
  .index('by_status', ['status'])`;
}

function generateAISDKTools(specification: string): string {
  return `const tools = {
  generateCursor: tool({
    description: 'Generate a new cursor design from a text prompt',
    inputSchema: z.object({
      prompt: z.string().describe('The prompt describing the cursor design'),
      format: z.enum(['cur', 'ani', 'png']).describe('The cursor format'),
      size: z.enum(['16x16', '32x32', '64x64']).describe('The cursor size'),
    }),
    execute: async ({ prompt, format, size }) => {
      // Implementation following Raj's patterns
    },
  }),
} satisfies ToolSet;`;
}

function generateFrontendInterface(specification: string): string {
  return `export default function CursorChatPage() {
  const { messages, sendMessage, isLoading } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Chat interface implementation */}
    </div>
  );
}`;
}

function generateSecurityValidation(specification: string): string {
  return `### Input Validation
- Prompt length and content validation
- Rate limiting per user
- Cost controls and usage tracking
- Proper error handling without exposing internals

### Authentication (Raj's Pattern)
- Verify user permissions for cursor access
- Validate ownership before generation
- Track generation costs per user
- Implement proper session management`;
}

function generateTestingStrategy(specification: string): string {
  return `### Unit Tests
- Tool function validation
- AI generation utilities
- Component rendering and interactions

### Integration Tests
- End-to-end chat workflow
- Tool calling mechanisms
- Error handling scenarios
- Performance under load`;
}

function generateDeploymentConsiderations(specification: string): string {
  return `### Environment Variables
- OpenRouter API key configuration
- Generation cost limits
- Rate limiting parameters
- Storage configuration

### Monitoring
- Generation success rates
- API response times
- Cost tracking and alerts
- User engagement metrics`;
}

function generateTask1_1(technicalPlan: string): string {
  return `- [ ] Update \`convex/schema.ts\` with cursor-related tables:
  - [ ] Add \`cursors\` table with proper validators
  - [ ] Add \`cursor_variants\` table for tracking
  - [ ] Create indexes for efficient queries
- [ ] Run schema migration and verify in Convex dashboard
- [ ] Update TypeScript types in \`_generated/dataModel.d.ts\`

**Acceptance Criteria (Raj's Standards)**:
- New tables appear in Convex dashboard
- TypeScript compilation passes
- Indexes are properly configured
- No manual timestamp fields (use Convex's _creationTime)`;
}

function generateTask1_2(technicalPlan: string): string {
  return `- [ ] Install Vercel AI SDK dependencies:
  - [ ] \`@ai-sdk/react\` for frontend chat interface
  - [ ] \`@ai-sdk/openrouter\` for OpenRouter integration
  - [ ] \`ai\` for core AI SDK functionality
- [ ] Create \`app/api/chat/route.ts\`:
  - [ ] Set up OpenRouter integration
  - [ ] Define cursor generation tools
  - [ ] Implement streaming response
- [ ] Add proper error handling and logging (no console.log)

**Acceptance Criteria (Raj's Standards)**:
- AI SDK properly configured
- OpenRouter integration working
- Tool definitions follow Raj's patterns
- Authentication checks first in all functions
- Streaming responses work correctly`;
}

function generateTask1_3(technicalPlan: string): string {
  return `- [ ] Create \`app/page.tsx\`:
  - [ ] Implement \`useChat\` hook
  - [ ] Add message rendering with tool calls
  - [ ] Handle loading states and errors
- [ ] Create tool call UI components:
  - [ ] \`CursorGenerationToolCall\` component
  - [ ] \`CursorVariantsToolCall\` component
  - [ ] \`UpdateCursorToolCall\` component
- [ ] Add proper TypeScript types for chat messages

**Acceptance Criteria (Raj's Standards)**:
- Chat interface renders correctly
- Tool calls display properly
- Loading states work as expected
- Error handling is user-friendly
- Components follow Raj's structure pattern`;
}

function generateTask2_1(technicalPlan: string): string {
  return `- [ ] Implement multi-step tool calling:
  - [ ] Allow sequential tool execution
  - [ ] Handle tool dependencies
  - [ ] Add proper error recovery
- [ ] Enhance tool call UI:
  - [ ] Show tool execution progress
  - [ ] Display tool results
  - [ ] Handle tool failures gracefully
- [ ] Add tool call validation:
  - [ ] Input schema validation
  - [ ] Output format validation
  - [ ] Error message formatting

**Acceptance Criteria (Raj's Standards)**:
- Multi-step tool calling works correctly
- Tool execution progress is visible
- Error recovery is robust
- UI updates are smooth
- No unnecessary re-renders`;
}

function generateTask2_2(technicalPlan: string): string {
  return `- [ ] Implement cursor generation tool:
  - [ ] Create cursor record in database
  - [ ] Schedule AI generation
  - [ ] Track generation status
- [ ] Implement cursor variants tool:
  - [ ] Fetch cursor variants
  - [ ] Display variant information
  - [ ] Handle variant selection
- [ ] Implement cursor update tool:
  - [ ] Update cursor metadata
  - [ ] Validate user permissions
  - [ ] Handle update conflicts

**Acceptance Criteria (Raj's Standards)**:
- Cursor generation works end-to-end
- Variants are fetched correctly
- Updates are applied properly
- Permission checks are enforced
- Error handling is comprehensive`;
}

function generateTask3_1(technicalPlan: string): string {
  return `- [ ] Optimize chat interface:
  - [ ] Implement message virtualization
  - [ ] Add proper memoization
  - [ ] Optimize re-renders
- [ ] Optimize tool calling:
  - [ ] Add request debouncing
  - [ ] Implement response caching
  - [ ] Add loading state optimization
- [ ] Optimize database queries:
  - [ ] Add proper indexes
  - [ ] Implement query result limits
  - [ ] Add query performance monitoring

**Acceptance Criteria (Raj's Standards)**:
- Chat interface is responsive
- Tool calls are fast
- Database queries are optimized
- Memory usage is efficient
- No performance bottlenecks`;
}

function generateTask3_2(technicalPlan: string): string {
  return `- [ ] Comprehensive error handling:
  - [ ] Network error recovery
  - [ ] API rate limit handling
  - [ ] Tool execution failures
  - [ ] User-friendly error messages
- [ ] Input validation:
  - [ ] Tool parameter validation
  - [ ] Rate limiting per user
  - [ ] Cost controls and warnings
- [ ] Add retry mechanisms:
  - [ ] Automatic retry for transient failures
  - [ ] Manual retry for user-initiated failures
  - [ ] Exponential backoff for API calls

**Acceptance Criteria (Raj's Standards)**:
- All error cases are handled gracefully
- Users receive clear feedback
- System recovers from failures automatically
- No crashes or unhandled exceptions
- Follows Raj's error classification system`;
}

function generateTask4_1(technicalPlan: string): string {
  return `- [ ] Unit tests:
  - [ ] Test tool functions
  - [ ] Test AI SDK integration
  - [ ] Test component rendering
- [ ] Integration tests:
  - [ ] Test end-to-end chat workflow
  - [ ] Test tool calling mechanisms
  - [ ] Test error scenarios
- [ ] Manual testing:
  - [ ] Test with various user inputs
  - [ ] Test error conditions
  - [ ] Test performance with many messages

**Acceptance Criteria (Raj's Standards)**:
- All tests pass
- Coverage above 80%
- No critical bugs found
- Performance meets requirements
- TypeScript compilation passes`;
}

function generateTask4_2(technicalPlan: string): string {
  return `- [ ] Update documentation:
  - [ ] Add feature documentation
  - [ ] Update API documentation
  - [ ] Add troubleshooting guide
- [ ] Deployment preparation:
  - [ ] Verify environment variables
  - [ ] Test in staging environment
  - [ ] Prepare deployment checklist
- [ ] User acceptance testing:
  - [ ] Test with real users
  - [ ] Gather feedback
  - [ ] Address any issues

**Acceptance Criteria (Raj's Standards)**:
- Documentation is complete and accurate
- Feature works in staging environment
- Users can successfully use the feature
- No critical issues remain
- Follows Raj's deployment patterns`;
}

function generateDevelopmentOrder(technicalPlan: string): string {
  return `1. Start with Task 1.1 (Database Schema) - foundation for everything else
2. Parallel development of Task 1.2 (AI SDK Setup) and Task 1.3 (Chat Interface)
3. Sequential development of Phase 2 tasks
4. Final optimization and testing in Phase 3`;
}

function generateRiskMitigation(technicalPlan: string): string {
  return `- **AI SDK Reliability**: Implement proper error handling and fallback options
- **Performance**: Monitor chat performance and optimize early
- **User Experience**: Test with real users early and often
- **Cost Control**: Implement usage limits and monitoring`;
}

function generateSuccessMetrics(technicalPlan: string): string {
  return `- Chat response time < 2 seconds
- Tool execution success rate > 95%
- User satisfaction score > 4.5/5
- Zero critical bugs in production`;
}

// Agent definition after all tools and helpers
export const specKitAgent = new Agent(
  // Component will be provided by the convex.config.js
  {} as any, // This will be replaced with the actual component
  {
    name: 'Spec Kit Agent',
    languageModel: openrouter.chat('google/gemini-2.5-flash-lite', {
      parallelToolCalls: true,
    }),
    instructions: `
You are a specialized AI agent for Spec-Driven Development. You help users create comprehensive specifications, technical plans, and actionable tasks for their anyacursor platform.

Your role is to:
1. Take user feature requests and create detailed specifications
2. Generate technical implementation plans with Vercel AI SDK + Convex
3. Break down features into actionable tasks following Raj's patterns
4. Ensure all outputs follow the anyacursor constitution and coding standards

OUTPUT POLICY:
- Always use the appropriate tool for each step
- Provide clear, actionable outputs
- Follow Raj's coding patterns and anyacursor constitution
- Focus on cursor generation and AI integration features

REDACTION AND PRIVACY:
- Never reveal internal IDs or sensitive information
- Focus on user-facing features and business value
- Use placeholder values for technical details when appropriate
`,
    tools: {
      createSpecification,
      createTechnicalPlan,
      createTaskBreakdown,
    },
  }
);
