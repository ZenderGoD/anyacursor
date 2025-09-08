#!/bin/bash

# Setup script for MCP servers
# This script installs dependencies and starts all MCP servers

set -e

echo "🚀 Setting up MCP servers for Enhanced Spec Kit Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to MCP servers directory
cd mcp-servers

echo "📦 Installing MCP server dependencies..."
npm install

echo "✅ MCP server dependencies installed successfully!"

# Check if .env file exists
if [ ! -f "../.env.local" ]; then
    echo "⚠️  .env.local file not found. Creating template..."
    cat > ../.env.local << EOF
# Convex Configuration
CONVEX_URL=your-convex-url-here
CONVEX_AUTH_KEY=your-convex-auth-key-here

# MagicUI Configuration
MAGICUI_API_KEY=your-magicui-api-key-here

# ReactBits Configuration
REACTBITS_API_KEY=your-reactbits-api-key-here

# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_APP_TOKEN=xapp-your-slack-app-token-here
SLACK_SIGNING_SECRET=your-slack-signing-secret-here

# Agent Configuration
AGENT_MODEL=google/gemini-2.5-flash-lite
AGENT_MAX_TOKENS=8192
AGENT_TEMPERATURE=0.7
EOF
    echo "📝 Created .env.local template. Please update with your actual values."
fi

echo "🔧 MCP servers setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual API keys and tokens"
echo "2. Run 'npm run start:all' to start all MCP servers"
echo "3. Or run individual servers:"
echo "   - npm run start:convex"
echo "   - npm run start:magicui"
echo "   - npm run start:reactbits"
echo "   - npm run start:slack"
echo ""
echo "🎉 MCP servers are ready to use!"
