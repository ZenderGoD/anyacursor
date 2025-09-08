#!/bin/bash

# Slack Bot Setup Script
# This script helps set up the Slack bot for the Enhanced Spec Kit Agent

set -e

echo "🤖 Setting up Slack Bot for Enhanced Spec Kit Agent..."

# Check if required environment variables are set
if [ -z "$SLACK_BOT_TOKEN" ]; then
    echo "❌ SLACK_BOT_TOKEN environment variable is not set."
    echo "Please set it with your Slack bot token (starts with xoxb-)"
    exit 1
fi

if [ -z "$SLACK_APP_TOKEN" ]; then
    echo "❌ SLACK_APP_TOKEN environment variable is not set."
    echo "Please set it with your Slack app token (starts with xapp-)"
    exit 1
fi

if [ -z "$SLACK_SIGNING_SECRET" ]; then
    echo "❌ SLACK_SIGNING_SECRET environment variable is not set."
    echo "Please set it with your Slack app signing secret"
    exit 1
fi

echo "✅ Slack environment variables are set!"

# Create Slack bot configuration
echo "📝 Creating Slack bot configuration..."

cat > slack-bot-config.json << EOF
{
  "botToken": "$SLACK_BOT_TOKEN",
  "appToken": "$SLACK_APP_TOKEN",
  "signingSecret": "$SLACK_SIGNING_SECRET",
  "channels": {
    "main": "#anyacursor-dev",
    "progress": "#anyacursor-progress",
    "completed": "#anyacursor-completed"
  },
  "slashCommands": {
    "specify": {
      "command": "/specify",
      "description": "Generate specification for a feature",
      "usage": "Describe the feature you want to build"
    },
    "plan": {
      "command": "/plan",
      "description": "Generate technical plan from specification",
      "usage": "Provide specification or feature description"
    },
    "tasks": {
      "command": "/tasks",
      "description": "Generate task breakdown from plan",
      "usage": "Provide technical plan or feature description"
    },
    "status": {
      "command": "/status",
      "description": "Check task status and progress",
      "usage": "Get current status of all tasks"
    }
  },
  "permissions": [
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
  ]
}
EOF

echo "✅ Slack bot configuration created!"

# Test Slack connection
echo "🔍 Testing Slack connection..."

# Create a simple test script
cat > test-slack-connection.js << 'EOF'
const { WebClient } = require('@slack/web-api');

async function testConnection() {
  const token = process.env.SLACK_BOT_TOKEN;
  const slack = new WebClient(token);
  
  try {
    const result = await slack.auth.test();
    console.log('✅ Slack connection successful!');
    console.log(`Bot user: ${result.user}`);
    console.log(`Team: ${result.team}`);
    console.log(`URL: ${result.url}`);
  } catch (error) {
    console.error('❌ Slack connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
EOF

# Install Slack SDK if not already installed
if ! npm list @slack/web-api &> /dev/null; then
    echo "📦 Installing Slack SDK..."
    npm install @slack/web-api
fi

# Run the test
echo "🧪 Testing Slack connection..."
node test-slack-connection.js

# Clean up test file
rm test-slack-connection.js

echo ""
echo "🎉 Slack bot setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your Slack app has the required permissions"
echo "2. Set up event subscriptions in your Slack app settings"
echo "3. Configure slash commands in your Slack app"
echo "4. Start the Enhanced Spec Kit Agent with MCP integration"
echo ""
echo "🔗 Useful links:"
echo "- Slack API Dashboard: https://api.slack.com/apps"
echo "- Bot Permissions: https://api.slack.com/methods/auth.test"
echo "- Event Subscriptions: https://api.slack.com/events"
echo ""
echo "💡 You can now communicate with the Enhanced Spec Kit Agent via Slack!"
