# MCP Setup Guide for Enhanced Spec Kit Agent

## 🎯 Overview

This guide will help you set up the complete MCP (Model Context Protocol) integration for the Enhanced Spec Kit Agent, enabling communication between the agent and Convex, MagicUI, ReactBits, and Slack services.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Convex project set up
- Slack workspace with admin permissions
- API keys for MagicUI and ReactBits (optional)

## 🚀 Quick Start

### 1. Environment Setup

First, update your `.env.local` file with the required environment variables:

```bash
# Convex Configuration
CONVEX_URL=https://your-convex-deployment.convex.cloud
CONVEX_AUTH_KEY=your-convex-auth-key

# MagicUI Configuration (Optional)
MAGICUI_API_KEY=your-magicui-api-key

# ReactBits Configuration (Optional)
REACTBITS_API_KEY=your-reactbits-api-key

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_APP_TOKEN=xapp-your-slack-app-token
SLACK_SIGNING_SECRET=your-slack-signing-secret

# Agent Configuration
AGENT_MODEL=google/gemini-2.5-flash-lite
AGENT_MAX_TOKENS=8192
AGENT_TEMPERATURE=0.7
```

### 2. Install Dependencies

The MCP servers are already set up. To install dependencies:

```bash
cd mcp-servers
npm install
```

### 3. Start MCP Servers

Start all MCP servers:

```bash
npm run start:all
```

Or start individual servers:

```bash
# Convex MCP Server
npm run start:convex

# MagicUI MCP Server
npm run start:magicui

# ReactBits MCP Server
npm run start:reactbits

# Slack MCP Server
npm run start:slack
```

## 🔧 Detailed Setup

### Convex MCP Server

The Convex MCP server provides access to your Convex database operations.

**Features:**
- Execute Convex queries
- Run Convex mutations
- Get schema information
- Access real-time capabilities
- Get table information

**Available Tools:**
- `convex_query` - Execute a Convex query
- `convex_mutation` - Execute a Convex mutation
- `convex_get_schema` - Get current schema
- `convex_get_realtime_capabilities` - Get real-time info
- `convex_get_table_info` - Get table details

### MagicUI MCP Server

The MagicUI MCP server provides access to UI components, animations, and effects.

**Features:**
- Get available components
- Access animations and effects
- Get text animations
- Access button components
- Get background components

**Available Tools:**
- `magicui_get_components` - Get available components
- `magicui_get_component` - Get specific component
- `magicui_get_animations` - Get animations
- `magicui_get_effects` - Get effects
- `magicui_get_text_animations` - Get text animations
- `magicui_get_buttons` - Get button components
- `magicui_get_backgrounds` - Get background components

### ReactBits MCP Server

The ReactBits MCP server provides access to React patterns, hooks, and utilities.

**Features:**
- Get React patterns
- Access custom hooks
- Get utility functions
- Access best practices
- Get performance patterns

**Available Tools:**
- `reactbits_get_patterns` - Get available patterns
- `reactbits_get_pattern` - Get specific pattern
- `reactbits_get_hooks` - Get available hooks
- `reactbits_get_hook` - Get specific hook
- `reactbits_get_utilities` - Get utilities
- `reactbits_get_best_practices` - Get best practices

### Slack MCP Server

The Slack MCP server provides access to Slack API for messaging and notifications.

**Features:**
- Send messages to channels
- Send direct messages
- Create channels
- Get channel/user information
- Send notifications
- Update messages

**Available Tools:**
- `slack_send_message` - Send message to channel
- `slack_send_dm` - Send direct message
- `slack_create_channel` - Create new channel
- `slack_get_channel_info` - Get channel info
- `slack_get_user_info` - Get user info
- `slack_list_channels` - List channels
- `slack_send_notification` - Send notification
- `slack_update_message` - Update message

## 🤖 Slack Bot Setup

### 1. Create Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Enter app name: "Spec Kit Agent Bot"
5. Select your workspace
6. Click "Create App"

### 2. Configure Bot Permissions

1. Go to "OAuth & Permissions"
2. Add the following Bot Token Scopes:
   - `app_mentions:read`
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `groups:history`
   - `groups:read`
   - `im:history`
   - `im:read`
   - `mpim:history`
   - `mpim:read`
   - `users:read`
   - `users:read.email`

3. Click "Install to Workspace"
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 3. Set Up Event Subscriptions

1. Go to "Event Subscriptions"
2. Toggle "Enable Events" to On
3. Set Request URL: `https://your-domain.com/slack/events`

4. Add the following Bot Events:
   - `app_mention`
   - `message.channels`
   - `message.groups`
   - `message.im`
   - `message.mpim`

### 4. Add Slash Commands

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

## 🧪 Testing MCP Connections

### Test Individual MCP Servers

```bash
# Test Convex MCP Server
cd mcp-servers
node convex-mcp-server.js

# Test MagicUI MCP Server
node magicui-mcp-server.js

# Test ReactBits MCP Server
node reactbits-mcp-server.js

# Test Slack MCP Server
node slack-mcp-server.js
```

### Test Slack Bot Connection

```bash
# Set environment variables
export SLACK_BOT_TOKEN="xoxb-your-token"
export SLACK_APP_TOKEN="xapp-your-token"
export SLACK_SIGNING_SECRET="your-secret"

# Run Slack bot setup script
./scripts/setup-slack-bot.sh
```

## 🔄 Communication Flow

The complete communication flow works as follows:

```
User (Slack) → Slack MCP → Enhanced Agent → MCP Services → AI Assistant → Enhanced Agent → Slack MCP → User
```

### Example Workflow

1. **User sends request via Slack:**
   ```
   @SpecKitBot /specify Build a real-time chat feature
   ```

2. **Enhanced Agent processes request:**
   - Gathers data from Convex MCP (schema insights)
   - Gets components from MagicUI MCP
   - Gets patterns from ReactBits MCP
   - Generates enhanced specification

3. **Agent coordinates with AI Assistant:**
   - Assigns task to AI Assistant
   - Provides specification and technical plan
   - Sets up progress tracking

4. **AI Assistant executes task:**
   - Uses MCP services for implementation
   - Reports progress back to agent
   - Provides completion results

5. **Agent reports back to user:**
   - Sends progress updates via Slack
   - Provides completion report
   - Includes generated files and metrics

## 📊 Monitoring and Debugging

### MCP Server Logs

Each MCP server logs to stderr. Monitor logs for debugging:

```bash
# Monitor all MCP servers
npm run start:all 2>&1 | tee mcp-servers.log

# Monitor individual server
npm run start:convex 2>&1 | tee convex-mcp.log
```

### Health Checks

The MCP servers include health check endpoints. You can test connectivity:

```bash
# Test MCP server health
curl -X POST http://localhost:3000/mcp/health \
  -H "Content-Type: application/json" \
  -d '{"server": "convex"}'
```

### Error Handling

Common issues and solutions:

1. **MCP Server Not Starting:**
   - Check environment variables
   - Verify dependencies are installed
   - Check port availability

2. **Slack Bot Not Responding:**
   - Verify bot token permissions
   - Check event subscription URLs
   - Ensure bot is invited to channels

3. **Convex Connection Failed:**
   - Verify CONVEX_URL is correct
   - Check CONVEX_AUTH_KEY
   - Ensure Convex deployment is active

## 🚀 Production Deployment

### Environment Variables

Set up production environment variables:

```bash
# Production Convex
CONVEX_URL=https://your-prod-deployment.convex.cloud
CONVEX_AUTH_KEY=your-prod-auth-key

# Production Slack
SLACK_BOT_TOKEN=xoxb-your-prod-bot-token
SLACK_APP_TOKEN=xapp-your-prod-app-token
SLACK_SIGNING_SECRET=your-prod-signing-secret
```

### Process Management

Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start MCP servers with PM2
pm2 start mcp-servers/convex-mcp-server.js --name "convex-mcp"
pm2 start mcp-servers/magicui-mcp-server.js --name "magicui-mcp"
pm2 start mcp-servers/reactbits-mcp-server.js --name "reactbits-mcp"
pm2 start mcp-servers/slack-mcp-server.js --name "slack-mcp"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Load Balancing

For high availability, set up load balancing:

```bash
# Use nginx for load balancing
upstream mcp_servers {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
    server localhost:3004;
}

server {
    listen 80;
    location /mcp/ {
        proxy_pass http://mcp_servers;
    }
}
```

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Slack API Documentation](https://api.slack.com)
- [MagicUI Documentation](https://magicui.design)
- [ReactBits Documentation](https://reactbits.dev)

## 🆘 Support

If you encounter issues:

1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Test individual MCP servers
4. Check Slack bot permissions
5. Verify Convex deployment status

For additional help, refer to the troubleshooting section in the main documentation or create an issue in the project repository.

---

🎉 **Congratulations!** You now have a complete MCP integration setup for the Enhanced Spec Kit Agent. You can communicate with the agent via Slack and it will coordinate with AI Assistants using all the MCP services to execute tasks and provide real-time progress updates.
