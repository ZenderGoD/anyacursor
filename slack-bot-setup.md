# Slack Bot Setup for Enhanced Spec Kit Agent

## Overview
This guide will help you set up a Slack bot that integrates with the Enhanced Spec Kit Agent to enable seamless communication between users, the agent, and the AI Assistant.

## Prerequisites
- Slack workspace with admin permissions
- Node.js and npm installed
- Convex project set up
- MCP servers configured

## Step 1: Create Slack App

### 1.1 Create New Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter app name: "Spec Kit Agent Bot"
5. Select your workspace
6. Click "Create App"

### 1.2 Configure App Settings
1. Go to "Basic Information"
2. Add app description: "AI-powered spec generation and task coordination bot"
3. Upload app icon (optional)
4. Note down the "App-Level Token" (starts with `xapp-`)

## Step 2: Configure Bot Permissions

### 2.1 OAuth & Permissions
1. Go to "OAuth & Permissions"
2. Add the following Bot Token Scopes:
   - `app_mentions:read` - Listen for mentions
   - `channels:history` - Read channel messages
   - `channels:read` - List channels
   - `chat:write` - Send messages
   - `groups:history` - Read private channel messages
   - `groups:read` - List private channels
   - `im:history` - Read direct messages
   - `im:read` - List direct messages
   - `mpim:history` - Read group messages
   - `mpim:read` - List group messages
   - `users:read` - Read user information
   - `users:read.email` - Read user email addresses

### 2.2 Install App to Workspace
1. Click "Install to Workspace"
2. Review permissions and click "Allow"
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

## Step 3: Configure Event Subscriptions

### 3.1 Enable Events
1. Go to "Event Subscriptions"
2. Toggle "Enable Events" to On
3. Set Request URL: `https://your-domain.com/slack/events`

### 3.2 Subscribe to Bot Events
Add the following Bot Events:
- `app_mention` - When the bot is mentioned
- `message.channels` - Messages in public channels
- `message.groups` - Messages in private channels
- `message.im` - Direct messages to the bot
- `message.mpim` - Group messages

## Step 4: Configure Interactivity & Shortcuts

### 4.1 Enable Interactivity
1. Go to "Interactivity & Shortcuts"
2. Toggle "Interactivity" to On
3. Set Request URL: `https://your-domain.com/slack/interactive`

### 4.2 Add Slash Commands
Create the following slash commands:

#### `/specify`
- Command: `/specify`
- Request URL: `https://your-domain.com/slack/specify`
- Short Description: "Generate specification for a feature"
- Usage Hint: "Describe the feature you want to build"

#### `/plan`
- Command: `/plan`
- Request URL: `https://your-domain.com/slack/plan`
- Short Description: "Generate technical plan from specification"
- Usage Hint: "Provide specification or feature description"

#### `/tasks`
- Command: `/tasks`
- Request URL: `https://your-domain.com/slack/tasks`
- Short Description: "Generate task breakdown from plan"
- Usage Hint: "Provide technical plan or feature description"

#### `/status`
- Command: `/status`
- Request URL: `https://your-domain.com/slack/status`
- Short Description: "Check task status and progress"
- Usage Hint: "Get current status of all tasks"

## Step 5: Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_APP_TOKEN=xapp-your-app-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here

# Convex Configuration
CONVEX_DEPLOYMENT=your-convex-deployment
CONVEX_AUTH_KEY=your-convex-auth-key

# MCP Configuration
MAGICUI_API_KEY=your-magicui-api-key
REACTBITS_API_KEY=your-reactbits-api-key

# Agent Configuration
AGENT_MODEL=google/gemini-2.5-flash-lite
AGENT_MAX_TOKENS=8192
AGENT_TEMPERATURE=0.7
```

## Step 6: Create Slack Integration API Routes

### 6.1 Events Endpoint
Create `src/app/api/slack/events/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { enhancedSpecKitAgent } from '@/agents/enhanced-spec-kit-agent';

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // Handle URL verification
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge });
  }
  
  // Handle events
  if (body.type === 'event_callback') {
    const event = body.event;
    
    if (event.type === 'app_mention') {
      // Process mention with enhanced agent
      const response = await enhancedSpecKitAgent.run({
        input: event.text,
        userId: event.user,
        channel: event.channel,
      });
      
      // Send response back to Slack
      // Implementation depends on your Slack client
    }
  }
  
  return NextResponse.json({ status: 'ok' });
}
```

### 6.2 Interactive Endpoint
Create `src/app/api/slack/interactive/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const payload = JSON.parse(body.get('payload') as string);
  
  // Handle interactive components
  if (payload.type === 'block_actions') {
    // Handle button clicks, select menus, etc.
  }
  
  return NextResponse.json({ status: 'ok' });
}
```

### 6.3 Slash Commands
Create `src/app/api/slack/specify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { enhancedSpecKitAgent } from '@/agents/enhanced-spec-kit-agent';

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const text = body.get('text') as string;
  const userId = body.get('user_id') as string;
  const channelId = body.get('channel_id') as string;
  
  // Generate specification using enhanced agent
  const result = await enhancedSpecKitAgent.run({
    input: text,
    userId,
    channel: channelId,
    action: 'create_specification',
  });
  
  return NextResponse.json({
    response_type: 'in_channel',
    text: `Specification generated for: ${text}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Specification Generated*\n\n${result.spec}`,
        },
      },
    ],
  });
}
```

## Step 7: Create Communication Flow

### 7.1 Task Coordination
The enhanced agent will:
1. Receive user request via Slack
2. Coordinate with AI Assistant for task execution
3. Provide real-time progress updates
4. Report completion with results

### 7.2 Progress Updates
Set up automatic progress updates:
- Task assignment notifications
- Progress milestone updates
- Completion reports
- Error notifications

### 7.3 Channel Management
Create dedicated channels:
- `#anyacursor-dev` - Main development channel
- `#anyacursor-progress` - Progress updates
- `#anyacursor-completed` - Completed tasks

## Step 8: Testing

### 8.1 Test Bot Installation
1. Invite the bot to a test channel
2. Send a test message: `@SpecKitBot hello`
3. Verify the bot responds

### 8.2 Test Slash Commands
1. Try `/specify Build a todo app`
2. Try `/plan Generate plan for todo app`
3. Try `/tasks Break down todo app tasks`
4. Try `/status Check current tasks`

### 8.3 Test MCP Integration
1. Verify Convex MCP connection
2. Test MagicUI component access
3. Test ReactBits pattern access
4. Test Slack notification system

## Step 9: Deployment

### 9.1 Deploy to Production
1. Deploy your Next.js app to Vercel/Netlify
2. Update Slack app URLs to production URLs
3. Test all functionality in production

### 9.2 Monitor and Maintain
1. Set up monitoring for bot health
2. Monitor MCP connection status
3. Track user satisfaction
4. Iterate based on feedback

## Usage Examples

### Example 1: Generate Specification
```
User: @SpecKitBot /specify Build a real-time chat app with typing indicators

Bot: 🤖 Generating specification for real-time chat app...
     ✅ Specification created with MCP integration
     📋 Technical plan generated
     📝 Task breakdown created
     🔗 View details: [link to generated files]
```

### Example 2: Check Status
```
User: @SpecKitBot /status

Bot: 📊 Current Task Status:
     ✅ Task 1.1: Database schema setup (Completed)
     🔄 Task 1.2: MCP integration (In Progress - 60%)
     ⏳ Task 1.3: Frontend components (Pending)
     
     📈 Overall Progress: 40% complete
     ⏱️ Estimated completion: 2 days
```

### Example 3: Progress Update
```
Bot: 🔔 Progress Update:
     ✅ Task 1.2 completed: MCP integration setup
     📁 Files created: 3 new files
     🔄 Next: Starting Task 1.3 - Frontend components
     ⏱️ ETA: 4 hours
```

## Troubleshooting

### Common Issues
1. **Bot not responding**: Check token permissions and event subscriptions
2. **MCP connection failed**: Verify MCP server configuration
3. **Slash commands not working**: Check request URLs and permissions
4. **Progress updates missing**: Verify real-time event handling

### Debug Mode
Enable debug mode by setting:
```bash
DEBUG=true
SLACK_DEBUG=true
MCP_DEBUG=true
```

## Security Considerations

1. **Token Security**: Never commit tokens to version control
2. **Request Validation**: Validate all incoming Slack requests
3. **Rate Limiting**: Implement rate limiting for bot responses
4. **User Permissions**: Verify user permissions for sensitive operations

## Support

For issues or questions:
1. Check the logs in your deployment platform
2. Verify Slack app configuration
3. Test MCP connections individually
4. Contact support with specific error messages

This setup creates a powerful communication system where users can interact with the Enhanced Spec Kit Agent via Slack, and the agent coordinates with AI Assistants to execute tasks while providing real-time progress updates.
