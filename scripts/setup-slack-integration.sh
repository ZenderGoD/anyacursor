#!/bin/bash

# Slack Integration Setup Script for Enhanced Spec Kit Agent
# This script helps set up the complete Slack integration

set -e

echo "🤖 Setting up Slack Integration for Enhanced Spec Kit Agent..."

# Check if required environment variables are set
if [ -z "$SLACK_BOT_TOKEN" ]; then
    echo "❌ SLACK_BOT_TOKEN environment variable is not set."
    echo "Please set it with your Slack bot token (starts with xoxb-)"
    echo "You can get this from your Slack app's OAuth & Permissions page"
    exit 1
fi

if [ -z "$SLACK_APP_TOKEN" ]; then
    echo "❌ SLACK_APP_TOKEN environment variable is not set."
    echo "Please set it with your Slack app token (starts with xapp-)"
    echo "You can get this from your Slack app's Basic Information page"
    exit 1
fi

if [ -z "$SLACK_SIGNING_SECRET" ]; then
    echo "❌ SLACK_SIGNING_SECRET environment variable is not set."
    echo "Please set it with your Slack app signing secret"
    echo "You can get this from your Slack app's Basic Information page"
    exit 1
fi

echo "✅ Slack environment variables are set!"

# Install webhook server dependencies
echo "📦 Installing Slack webhook server dependencies..."
if [ ! -f "slack-webhook-package.json" ]; then
    echo "❌ slack-webhook-package.json not found"
    exit 1
fi

# Copy package.json to the root
cp slack-webhook-package.json package-slack.json

# Install dependencies
npm install express node-fetch nodemon --save

echo "✅ Dependencies installed!"

# Create Slack app configuration
echo "📝 Creating Slack app configuration..."

cat > slack-app-config.json << EOF
{
  "appName": "Enhanced Spec Kit Agent",
  "botToken": "$SLACK_BOT_TOKEN",
  "appToken": "$SLACK_APP_TOKEN",
  "signingSecret": "$SLACK_SIGNING_SECRET",
  "webhookUrl": "http://localhost:3000/slack/events",
  "slashCommands": {
    "specify": {
      "command": "/specify",
      "url": "http://localhost:3000/slack/specify",
      "description": "Generate specification for a feature"
    },
    "plan": {
      "command": "/plan",
      "url": "http://localhost:3000/slack/plan",
      "description": "Generate technical plan from specification"
    },
    "tasks": {
      "command": "/tasks",
      "url": "http://localhost:3000/slack/tasks",
      "description": "Generate task breakdown from plan"
    },
    "status": {
      "command": "/status",
      "url": "http://localhost:3000/slack/status",
      "description": "Check task status and progress"
    }
  },
  "botScopes": [
    "app_mentions:read",
    "channels:history",
    "channels:read",
    "chat:write",
    "groups:history",
    "groups:read",
    "im:history",
    "im:read",
    "mpim:history",
    "mpim:read",
    "users:read",
    "users:read.email"
  ],
  "events": [
    "app_mention",
    "message.channels",
    "message.groups",
    "message.im",
    "message.mpim"
  ]
}
EOF

echo "✅ Slack app configuration created!"

# Test Slack connection
echo "🔍 Testing Slack connection..."

# Create a simple test script
cat > test-slack-connection.js << 'EOF'
const fetch = require('node-fetch');

async function testSlackConnection() {
  const token = process.env.SLACK_BOT_TOKEN;
  
  try {
    const response = await fetch('https://slack.com/api/auth.test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Slack connection successful!');
      console.log(`Bot user: ${result.user}`);
      console.log(`Team: ${result.team}`);
      console.log(`URL: ${result.url}`);
    } else {
      console.error('❌ Slack connection failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Slack connection failed:', error.message);
    process.exit(1);
  }
}

testSlackConnection();
EOF

# Run the test
echo "🧪 Testing Slack connection..."
node test-slack-connection.js

# Clean up test file
rm test-slack-connection.js

echo ""
echo "🎉 Slack integration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your Slack app URLs in the Slack API dashboard:"
echo "   - Event Subscriptions URL: http://localhost:3000/slack/events"
echo "   - Slash Commands URLs:"
echo "     * /specify: http://localhost:3000/slack/specify"
echo "     * /plan: http://localhost:3000/slack/plan"
echo "     * /tasks: http://localhost:3000/slack/tasks"
echo "     * /status: http://localhost:3000/slack/status"
echo ""
echo "2. Start the Slack webhook server:"
echo "   node slack-webhook-server.js"
echo ""
echo "3. Start the MCP servers:"
echo "   cd mcp-servers && npm run start:all"
echo ""
echo "4. Test the integration:"
echo "   - Invite the bot to a channel"
echo "   - Try: @SpecKitBot /specify Build a real-time chat feature"
echo ""
echo "🔗 Useful links:"
echo "- Slack API Dashboard: https://api.slack.com/apps"
echo "- Your app configuration: slack-app-config.json"
echo "- Webhook server: slack-webhook-server.js"
echo ""
echo "💡 You can now communicate with the Enhanced Spec Kit Agent via Slack!"
