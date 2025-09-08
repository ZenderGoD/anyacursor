# Real-Time Collaboration Technical Implementation Plan

## Architecture Overview

### Technology Stack
- **Frontend:** Next.js 15 with React 18
- **Backend:** Convex (real-time database + functions)
- **Real-time:** Convex subscriptions + WebSocket
- **Authentication:** Convex Auth
- **AI Integration:** Vercel AI SDK + OpenRouter
- **Styling:** Tailwind CSS

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   Convex API    │    │   WebSocket     │
│                 │    │                 │    │   Connection    │
│ - Chat UI       │◄──►│ - Real-time DB  │◄──►│ - Live Updates  │
│ - User Presence │    │ - Functions     │    │ - Typing Ind.   │
│ - Typing Ind.   │    │ - Subscriptions │    │ - Presence      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Database Schema Extensions

### Chat Sessions Table Updates
```typescript
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
```

### New Tables

#### User Presence Table
```typescript
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
```

#### Chat Invitations Table
```typescript
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
```

## Convex Functions

### Real-Time Subscriptions

#### Subscribe to Chat Messages
```typescript
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
```

#### Subscribe to User Presence
```typescript
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
```

### Mutations

#### Update User Presence
```typescript
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
```

#### Invite User to Chat
```typescript
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
```

## Frontend Implementation

### Real-Time Hook
```typescript
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
```

### Typing Indicator Component
```typescript
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
```

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
3. User experience improvements