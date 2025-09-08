#!/usr/bin/env node

/**
 * Demo script to show the Spec Kit Agent in action
 * This simulates what the agent would do when given a feature request
 */

const fs = require('fs');
const path = require('path');

// Simulate the agent's specification generation
function generateSpecification(featureDescription, userContext = '') {
  const timestamp = new Date().toISOString();
  
  return `# Real-Time Collaboration Feature Specification

## Feature Overview
**Feature:** ${featureDescription}
**Generated:** ${timestamp}
**Context:** ${userContext || 'No additional context provided'}

## Functional Requirements

### FR-001: Multi-User Chat Sessions
- **Description:** Allow multiple users to join the same chat session
- **Acceptance Criteria:**
  - Users can invite others to existing chat sessions
  - Chat sessions support 2-10 concurrent users
  - Users can see who is currently in the chat
  - Users can leave chat sessions at any time

### FR-002: Real-Time Message Updates
- **Description:** Messages appear instantly for all users in the chat
- **Acceptance Criteria:**
  - Messages are delivered in real-time using WebSocket connections
  - Messages appear in the same order for all users
  - Failed message delivery is retried automatically
  - Message history is preserved when users join mid-conversation

### FR-003: Typing Indicators
- **Description:** Show when other users are typing
- **Acceptance Criteria:**
  - Typing indicator appears when user starts typing
  - Indicator disappears after 3 seconds of inactivity
  - Multiple typing indicators are shown for multiple users
  - Typing indicators are user-specific and identifiable

### FR-004: User Presence
- **Description:** Show online/offline status of chat participants
- **Acceptance Criteria:**
  - Users show as online when actively in the chat
  - Users show as offline when they leave or disconnect
  - Presence status updates in real-time
  - Last seen timestamp for offline users

## Technical Requirements

### TR-001: WebSocket Integration
- Use Convex real-time subscriptions for live updates
- Implement connection state management
- Handle reconnection logic for dropped connections

### TR-002: User Management
- Extend chat sessions to support multiple participants
- Implement user roles (owner, participant)
- Add user invitation system

### TR-003: Performance
- Optimize for 10+ concurrent users per chat
- Implement message batching for high-frequency updates
- Use efficient data structures for presence tracking

## User Experience

### UX-001: Visual Indicators
- Clear visual distinction between online/offline users
- Smooth animations for typing indicators
- Intuitive user invitation flow

### UX-002: Responsive Design
- Works seamlessly on desktop and mobile
- Maintains performance with multiple active users
- Graceful degradation for slow connections

## Acceptance Scenarios

### Scenario 1: Multi-User Chat Creation
1. User A creates a new chat session
2. User A invites User B and User C
3. All three users can see each other's messages
4. All users can see typing indicators
5. All users can see each other's presence status

### Scenario 2: Real-Time Updates
1. User A types a message
2. User B sees User A's typing indicator
3. User A sends the message
4. User B and User C receive the message instantly
5. Typing indicator disappears for User A

### Scenario 3: User Presence
1. User A is online in the chat
2. User B joins the chat
3. User B sees User A as online
4. User A goes offline
5. User B sees User A as offline with last seen time

## Edge Cases

### EC-001: Connection Issues
- Handle network disconnections gracefully
- Reconnect users automatically
- Show connection status to users

### EC-002: High User Load
- Support up to 10 concurrent users per chat
- Implement rate limiting for typing indicators
- Optimize message delivery for performance

### EC-003: User Permissions
- Only chat owners can invite new users
- Users can only see chats they're invited to
- Implement proper access control

## Success Metrics
- Real-time message delivery < 100ms
- Typing indicator response time < 50ms
- 99.9% uptime for WebSocket connections
- Support for 10+ concurrent users per chat
- Zero message loss during normal operation`;
}

// Simulate the agent's technical plan generation
function generateTechnicalPlan(specification, techStack = 'Vercel AI SDK + Convex + OpenRouter') {
  return `# Real-Time Collaboration Technical Implementation Plan

## Architecture Overview

### Technology Stack
- **Frontend:** Next.js 15 with React 18
- **Backend:** Convex (real-time database + functions)
- **Real-time:** Convex subscriptions + WebSocket
- **Authentication:** Convex Auth
- **AI Integration:** Vercel AI SDK + OpenRouter
- **Styling:** Tailwind CSS

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Convex API    │    │   WebSocket     │
│                 │    │                 │    │   Connection    │
│ - Chat UI       │◄──►│ - Real-time DB  │◄──►│ - Live Updates  │
│ - User Presence │    │ - Functions     │    │ - Typing Ind.   │
│ - Typing Ind.   │    │ - Subscriptions │    │ - Presence      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## Database Schema Extensions

### Chat Sessions Table Updates
\`\`\`typescript
chatSessions: defineTable({
  title: v.string(),
  type: v.union(v.literal('text'), v.literal('text-to-image'), v.literal('image-to-image')),
  slug: v.string(),
  ownerId: v.id('users'),
  // NEW: Multi-user support
  participants: v.array(v.id('users')),
  maxParticipants: v.optional(v.number()),
  isPublic: v.optional(v.boolean()),
  // NEW: Real-time metadata
  activeUsers: v.array(v.id('users')),
  lastActivity: v.number(),
})
  .index('by_slug', ['slug'])
  .index('by_owner', ['ownerId'])
  .index('by_participant', ['participants'])
  .index('by_activity', ['lastActivity']);
\`\`\`

### New Tables

#### User Presence Table
\`\`\`typescript
userPresence: defineTable({
  userId: v.id('users'),
  chatSessionId: v.id('chatSessions'),
  status: v.union(v.literal('online'), v.literal('offline'), v.literal('away')),
  lastSeen: v.number(),
  isTyping: v.boolean(),
  typingSince: v.optional(v.number()),
})
  .index('by_user_chat', ['userId', 'chatSessionId'])
  .index('by_chat', ['chatSessionId'])
  .index('by_status', ['status']);
\`\`\`

#### Chat Invitations Table
\`\`\`typescript
chatInvitations: defineTable({
  chatSessionId: v.id('chatSessions'),
  invitedUserId: v.id('users'),
  invitedBy: v.id('users'),
  status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined')),
  expiresAt: v.number(),
})
  .index('by_invited_user', ['invitedUserId'])
  .index('by_chat', ['chatSessionId'])
  .index('by_status', ['status']);
\`\`\`

## Convex Functions

### Real-Time Subscriptions

#### Subscribe to Chat Messages
\`\`\`typescript
export const subscribeToChatMessages = query({
  args: { chatSessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');
    
    // Check if user is participant
    const session = await ctx.db.get(args.chatSessionId);
    if (!session?.participants.includes(userId)) {
      throw new ConvexError('ACCESS_DENIED');
    }
    
    return ctx.db
      .query('chatMessages')
      .withIndex('by_chat_session', (q) => q.eq('chatSessionId', args.chatSessionId))
      .order('desc');
  },
});
\`\`\`

#### Subscribe to User Presence
\`\`\`typescript
export const subscribeToUserPresence = query({
  args: { chatSessionId: v.id('chatSessions') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');
    
    return ctx.db
      .query('userPresence')
      .withIndex('by_chat', (q) => q.eq('chatSessionId', args.chatSessionId));
  },
});
\`\`\`

### Mutations

#### Update User Presence
\`\`\`typescript
export const updateUserPresence = mutation({
  args: {
    chatSessionId: v.id('chatSessions'),
    status: v.union(v.literal('online'), v.literal('offline'), v.literal('away')),
    isTyping: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');
    
    const existing = await ctx.db
      .query('userPresence')
      .withIndex('by_user_chat', (q) => 
        q.eq('userId', userId).eq('chatSessionId', args.chatSessionId)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        isTyping: args.isTyping ?? false,
        typingSince: args.isTyping ? Date.now() : undefined,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert('userPresence', {
        userId,
        chatSessionId: args.chatSessionId,
        status: args.status,
        isTyping: args.isTyping ?? false,
        typingSince: args.isTyping ? Date.now() : undefined,
        lastSeen: Date.now(),
      });
    }
  },
});
\`\`\`

#### Invite User to Chat
\`\`\`typescript
export const inviteUserToChat = mutation({
  args: {
    chatSessionId: v.id('chatSessions'),
    invitedUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError('UNAUTHORIZED');
    
    // Check if user is owner
    const session = await ctx.db.get(args.chatSessionId);
    if (session?.ownerId !== userId) {
      throw new ConvexError('ACCESS_DENIED');
    }
    
    // Create invitation
    await ctx.db.insert('chatInvitations', {
      chatSessionId: args.chatSessionId,
      invitedUserId: args.invitedUserId,
      invitedBy: userId,
      status: 'pending',
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    // Add to participants
    await ctx.db.patch(args.chatSessionId, {
      participants: [...(session.participants || []), args.invitedUserId],
    });
  },
});
\`\`\`

## Frontend Implementation

### Real-Time Hook
\`\`\`typescript
export function useRealtimeChat(chatSessionId: Id<'chatSessions'>) {
  const messages = useQuery(api.chat.subscribeToChatMessages, { chatSessionId });
  const presence = useQuery(api.chat.subscribeToUserPresence, { chatSessionId });
  const updatePresence = useMutation(api.chat.updateUserPresence);
  
  // Auto-update presence on mount/unmount
  useEffect(() => {
    updatePresence({ chatSessionId, status: 'online' });
    
    return () => {
      updatePresence({ chatSessionId, status: 'offline' });
    };
  }, [chatSessionId, updatePresence]);
  
  return { messages, presence, updatePresence };
}
\`\`\`

### Typing Indicator Component
\`\`\`typescript
export function TypingIndicator({ chatSessionId }: { chatSessionId: Id<'chatSessions'> }) {
  const { presence } = useRealtimeChat(chatSessionId);
  const [isTyping, setIsTyping] = useState(false);
  const updatePresence = useMutation(api.chat.updateUserPresence);
  
  const typingUsers = presence?.filter(p => p.isTyping) || [];
  
  const handleTyping = useCallback(
    debounce((typing: boolean) => {
      updatePresence({ chatSessionId, isTyping: typing });
    }, 300),
    [chatSessionId, updatePresence]
  );
  
  return (
    <div className="typing-indicator">
      {typingUsers.map(user => (
        <div key={user.userId} className="typing-user">
          {user.userId} is typing...
        </div>
      ))}
    </div>
  );
}
\`\`\`

## Performance Optimizations

### Message Batching
- Batch multiple messages within 100ms
- Use Convex's built-in batching for efficient updates
- Implement client-side message queuing

### Presence Optimization
- Update presence every 30 seconds when active
- Use heartbeat mechanism for connection monitoring
- Implement presence cleanup for inactive users

### Connection Management
- Auto-reconnect on connection loss
- Exponential backoff for reconnection attempts
- Graceful degradation for offline scenarios

## Security Considerations

### Access Control
- Verify user permissions for all chat operations
- Implement rate limiting for presence updates
- Validate all user inputs and actions

### Data Privacy
- Encrypt sensitive chat data
- Implement proper user data isolation
- Follow GDPR compliance for user data

## Testing Strategy

### Unit Tests
- Test all Convex functions individually
- Mock WebSocket connections for testing
- Test presence update logic

### Integration Tests
- Test real-time message delivery
- Test typing indicator functionality
- Test user invitation flow

### Performance Tests
- Load test with 10+ concurrent users
- Test message delivery latency
- Test presence update performance

## Deployment Plan

### Phase 1: Core Infrastructure
1. Extend database schema
2. Implement basic Convex functions
3. Add real-time subscriptions

### Phase 2: Frontend Integration
1. Update chat interface components
2. Add typing indicators
3. Implement user presence display

### Phase 3: Advanced Features
1. User invitation system
2. Chat session management
3. Performance optimizations

### Phase 4: Polish & Testing
1. Comprehensive testing
2. Performance optimization
3. User experience improvements`;
}

// Simulate the agent's task breakdown generation
function generateTaskBreakdown(specification, technicalPlan) {
  return `# Real-Time Collaboration Task Breakdown

## Phase 1: Database Schema & Core Functions (Week 1)

### Task 1.1: Extend Chat Sessions Schema
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** None

**Description:** Update the chatSessions table to support multiple participants and real-time features.

**Acceptance Criteria:**
- [ ] Add participants array field to chatSessions
- [ ] Add maxParticipants optional field
- [ ] Add isPublic optional field
- [ ] Add activeUsers array field
- [ ] Add lastActivity timestamp field
- [ ] Create new indexes for efficient querying
- [ ] Update TypeScript types

**Implementation Steps:**
1. Update \`convex/schema.ts\` with new fields
2. Create migration script for existing data
3. Update Convex function types
4. Test schema changes locally

**Files to Modify:**
- \`convex/schema.ts\`
- \`convex/_generated/dataModel.d.ts\`

### Task 1.2: Create User Presence Table
**Priority:** High
**Estimated Time:** 3 hours
**Dependencies:** Task 1.1

**Description:** Create a new table to track user presence and typing status in chat sessions.

**Acceptance Criteria:**
- [ ] Create userPresence table with required fields
- [ ] Add proper indexes for efficient querying
- [ ] Define TypeScript types
- [ ] Test table creation

**Implementation Steps:**
1. Add userPresence table to schema
2. Define proper indexes
3. Update generated types
4. Test with sample data

**Files to Create/Modify:**
- \`convex/schema.ts\`
- \`convex/_generated/dataModel.d.ts\`

### Task 1.3: Create Chat Invitations Table
**Priority:** Medium
**Estimated Time:** 2 hours
**Dependencies:** Task 1.1

**Description:** Create a table to manage chat invitations and user access control.

**Acceptance Criteria:**
- [ ] Create chatInvitations table
- [ ] Add proper indexes
- [ ] Define TypeScript types
- [ ] Test invitation flow

**Implementation Steps:**
1. Add chatInvitations table to schema
2. Define indexes for efficient querying
3. Update generated types
4. Test invitation creation

**Files to Create/Modify:**
- \`convex/schema.ts\`
- \`convex/_generated/dataModel.d.ts\`

### Task 1.4: Implement Real-Time Subscriptions
**Priority:** High
**Estimated Time:** 6 hours
**Dependencies:** Task 1.1, 1.2

**Description:** Create Convex queries for real-time message and presence updates.

**Acceptance Criteria:**
- [ ] Create subscribeToChatMessages query
- [ ] Create subscribeToUserPresence query
- [ ] Implement proper access control
- [ ] Test real-time updates
- [ ] Handle edge cases (user leaves, etc.)

**Implementation Steps:**
1. Create subscription queries in \`convex/chat.ts\`
2. Implement access control logic
3. Add error handling
4. Test with multiple users
5. Optimize query performance

**Files to Create/Modify:**
- \`convex/chat.ts\`
- \`convex/_generated/api.d.ts\`

## Phase 2: Presence Management (Week 2)

### Task 2.1: Implement Presence Mutations
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 1.2

**Description:** Create mutations to update user presence and typing status.

**Acceptance Criteria:**
- [ ] Create updateUserPresence mutation
- [ ] Handle online/offline/away status
- [ ] Implement typing indicator logic
- [ ] Add proper validation
- [ ] Test presence updates

**Implementation Steps:**
1. Create updateUserPresence mutation
2. Implement typing indicator logic
3. Add input validation
4. Test with multiple users
5. Add error handling

**Files to Create/Modify:**
- \`convex/chat.ts\`
- \`convex/_generated/api.d.ts\`

### Task 2.2: Create User Invitation System
**Priority:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 1.3

**Description:** Implement system for inviting users to chat sessions.

**Acceptance Criteria:**
- [ ] Create inviteUserToChat mutation
- [ ] Create acceptInvitation mutation
- [ ] Create declineInvitation mutation
- [ ] Implement invitation expiration
- [ ] Add proper access control
- [ ] Test invitation flow

**Implementation Steps:**
1. Create invitation mutations
2. Implement access control
3. Add expiration logic
4. Test invitation flow
5. Add error handling

**Files to Create/Modify:**
- \`convex/chat.ts\`
- \`convex/_generated/api.d.ts\`

### Task 2.3: Implement Presence Cleanup
**Priority:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 2.1

**Description:** Create system to clean up inactive user presence records.

**Acceptance Criteria:**
- [ ] Create cleanupPresence mutation
- [ ] Implement automatic cleanup
- [ ] Handle edge cases
- [ ] Test cleanup logic

**Implementation Steps:**
1. Create cleanup mutation
2. Implement automatic cleanup
3. Test with various scenarios
4. Add monitoring

**Files to Create/Modify:**
- \`convex/chat.ts\`
- \`convex/_generated/api.d.ts\`

## Phase 3: Frontend Integration (Week 3)

### Task 3.1: Create Real-Time Hook
**Priority:** High
**Estimated Time:** 4 hours
**Dependencies:** Task 1.4, 2.1

**Description:** Create React hook for managing real-time chat state.

**Acceptance Criteria:**
- [ ] Create useRealtimeChat hook
- [ ] Implement presence management
- [ ] Add typing indicator logic
- [ ] Handle connection states
- [ ] Test with multiple users

**Implementation Steps:**
1. Create hook in \`src/hooks/use-realtime-chat.ts\`
2. Implement presence management
3. Add typing indicator logic
4. Test with multiple users
5. Add error handling

**Files to Create:**
- \`src/hooks/use-realtime-chat.ts\`

### Task 3.2: Update Chat Interface Component
**Priority:** High
**Estimated Time:** 6 hours
**Dependencies:** Task 3.1

**Description:** Update the existing chat interface to support real-time features.

**Acceptance Criteria:**
- [ ] Integrate real-time hook
- [ ] Add typing indicators
- [ ] Show user presence
- [ ] Handle multiple users
- [ ] Test real-time updates

**Implementation Steps:**
1. Update \`src/components/chat/chat-interface.tsx\`
2. Integrate real-time hook
3. Add typing indicators
4. Show user presence
5. Test with multiple users

**Files to Modify:**
- \`src/components/chat/chat-interface.tsx\`

### Task 3.3: Create Typing Indicator Component
**Priority:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 3.1

**Description:** Create a component to show when users are typing.

**Acceptance Criteria:**
- [ ] Create TypingIndicator component
- [ ] Show multiple typing users
- [ ] Add smooth animations
- [ ] Handle edge cases
- [ ] Test typing indicators

**Implementation Steps:**
1. Create \`src/components/chat/typing-indicator.tsx\`
2. Implement typing logic
3. Add animations
4. Test with multiple users
5. Add error handling

**Files to Create:**
- \`src/components/chat/typing-indicator.tsx\`

### Task 3.4: Create User Presence Component
**Priority:** Medium
**Estimated Time:** 3 hours
**Dependencies:** Task 3.1

**Description:** Create a component to show user presence status.

**Acceptance Criteria:**
- [ ] Create UserPresence component
- [ ] Show online/offline status
- [ ] Display last seen time
- [ ] Handle multiple users
- [ ] Test presence display

**Implementation Steps:**
1. Create \`src/components/chat/user-presence.tsx\`
2. Implement presence display
3. Add last seen logic
4. Test with multiple users
5. Add error handling

**Files to Create:**
- \`src/components/chat/user-presence.tsx\`

## Phase 4: User Management (Week 4)

### Task 4.1: Create User Invitation UI
**Priority:** Medium
**Estimated Time:** 5 hours
**Dependencies:** Task 2.2

**Description:** Create UI for inviting users to chat sessions.

**Acceptance Criteria:**
- [ ] Create invitation modal
- [ ] Add user search functionality
- [ ] Implement invitation sending
- [ ] Show invitation status
- [ ] Test invitation flow

**Implementation Steps:**
1. Create \`src/components/chat/invite-user-modal.tsx\`
2. Add user search
3. Implement invitation logic
4. Test invitation flow
5. Add error handling

**Files to Create:**
- \`src/components/chat/invite-user-modal.tsx\`

### Task 4.2: Update Chat List Page
**Priority:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 4.1

**Description:** Update the chat list to show multi-user chats and invitations.

**Acceptance Criteria:**
- [ ] Show participant count
- [ ] Display invitation status
- [ ] Add invitation actions
- [ ] Test chat list updates

**Implementation Steps:**
1. Update \`src/app/chat/page.tsx\`
2. Add participant display
3. Add invitation actions
4. Test chat list
5. Add error handling

**Files to Modify:**
- \`src/app/chat/page.tsx\`

### Task 4.3: Create Chat Settings Page
**Priority:** Low
**Estimated Time:** 4 hours
**Dependencies:** Task 4.1

**Description:** Create a page for managing chat settings and participants.

**Acceptance Criteria:**
- [ ] Create chat settings page
- [ ] Show participant list
- [ ] Add remove participant functionality
- [ ] Test settings management

**Implementation Steps:**
1. Create \`src/app/chat/[slug]/settings/page.tsx\`
2. Add participant management
3. Test settings page
4. Add error handling

**Files to Create:**
- \`src/app/chat/[slug]/settings/page.tsx\`

## Phase 5: Testing & Optimization (Week 5)

### Task 5.1: Comprehensive Testing
**Priority:** High
**Estimated Time:** 8 hours
**Dependencies:** All previous tasks

**Description:** Test all real-time collaboration features thoroughly.

**Acceptance Criteria:**
- [ ] Test with 10+ concurrent users
- [ ] Test message delivery latency
- [ ] Test typing indicators
- [ ] Test user presence
- [ ] Test invitation flow
- [ ] Test edge cases

**Implementation Steps:**
1. Create test scenarios
2. Test with multiple users
3. Measure performance
4. Fix any issues
5. Document test results

**Files to Create:**
- \`tests/realtime-collaboration.test.ts\`
- \`tests/performance.test.ts\`

### Task 5.2: Performance Optimization
**Priority:** High
**Estimated Time:** 6 hours
**Dependencies:** Task 5.1

**Description:** Optimize performance for real-time features.

**Acceptance Criteria:**
- [ ] Optimize message delivery
- [ ] Optimize presence updates
- [ ] Optimize typing indicators
- [ ] Test performance improvements
- [ ] Document optimizations

**Implementation Steps:**
1. Profile current performance
2. Identify bottlenecks
3. Implement optimizations
4. Test improvements
5. Document changes

**Files to Modify:**
- Various performance-critical files

### Task 5.3: Error Handling & Edge Cases
**Priority:** Medium
**Estimated Time:** 4 hours
**Dependencies:** Task 5.1

**Description:** Implement comprehensive error handling for edge cases.

**Acceptance Criteria:**
- [ ] Handle connection failures
- [ ] Handle user disconnections
- [ ] Handle invitation errors
- [ ] Handle presence errors
- [ ] Test error scenarios

**Implementation Steps:**
1. Identify edge cases
2. Implement error handling
3. Test error scenarios
4. Add user feedback
5. Document error handling

**Files to Modify:**
- Various error-prone files

## Success Criteria

### Performance Metrics
- [ ] Message delivery latency < 100ms
- [ ] Typing indicator response time < 50ms
- [ ] Support for 10+ concurrent users
- [ ] 99.9% uptime for real-time features
- [ ] Zero message loss during normal operation

### User Experience
- [ ] Smooth real-time updates
- [ ] Intuitive typing indicators
- [ ] Clear user presence display
- [ ] Easy user invitation process
- [ ] Responsive design on all devices

### Technical Quality
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Proper error handling
- [ ] Clean code following Raj's patterns
- [ ] Comprehensive documentation

## Risk Mitigation

### Technical Risks
- **WebSocket connection issues:** Implement robust reconnection logic
- **Performance degradation:** Monitor and optimize continuously
- **Data consistency:** Use Convex's built-in consistency guarantees

### User Experience Risks
- **Confusing UI:** Conduct user testing and iterate
- **Poor performance:** Implement progressive enhancement
- **Feature complexity:** Start simple and add features incrementally

## Timeline Summary
- **Week 1:** Database schema and core functions
- **Week 2:** Presence management and invitations
- **Week 3:** Frontend integration
- **Week 4:** User management features
- **Week 5:** Testing and optimization

**Total Estimated Time:** 80 hours
**Team Size:** 2-3 developers
**Target Completion:** 5 weeks`;
}

// Main demo function
function runSpecAgentDemo() {
  console.log('🤖 Spec Kit Agent Demo - Real-Time Collaboration Feature\n');
  
  const featureDescription = "Add a real-time collaboration feature to the chat interface where multiple users can join the same chat session and see each other typing indicators and messages in real-time. Include user presence, typing indicators, and live message updates.";
  
  console.log('📝 Step 1: Generating Specification...');
  const specification = generateSpecification(featureDescription, 'Building on existing chat interface with Convex real-time capabilities');
  
  console.log('✅ Specification generated successfully!\n');
  
  console.log('📋 Step 2: Generating Technical Plan...');
  const technicalPlan = generateTechnicalPlan(specification, 'Vercel AI SDK + Convex + OpenRouter + Real-time WebSocket');
  
  console.log('✅ Technical plan generated successfully!\n');
  
  console.log('📋 Step 3: Generating Task Breakdown...');
  const taskBreakdown = generateTaskBreakdown(specification, technicalPlan);
  
  console.log('✅ Task breakdown generated successfully!\n');
  
  // Save outputs to files
  const timestamp = new Date().toISOString().split('T')[0];
  const basePath = `generated-specs/realtime-collaboration-${timestamp}`;
  
  fs.writeFileSync(`${basePath}-spec.md`, specification);
  fs.writeFileSync(`${basePath}-plan.md`, technicalPlan);
  fs.writeFileSync(`${basePath}-tasks.md`, taskBreakdown);
  
  console.log('💾 Files saved:');
  console.log(`   - ${basePath}-spec.md`);
  console.log(`   - ${basePath}-plan.md`);
  console.log(`   - ${basePath}-tasks.md`);
  
  console.log('\n🎉 Spec Kit Agent Demo Complete!');
  console.log('\nThe agent has generated:');
  console.log('   ✅ Comprehensive specification with functional requirements');
  console.log('   ✅ Detailed technical implementation plan');
  console.log('   ✅ Actionable task breakdown with timelines');
  console.log('\nThis demonstrates how the Spec Kit Agent automates the entire');
  console.log('specification → plan → tasks workflow for any feature request!');
}

// Run the demo
runSpecAgentDemo();
