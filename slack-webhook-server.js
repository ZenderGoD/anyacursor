#!/usr/bin/env node

/**
 * Slack Webhook Server for Enhanced Spec Kit Agent
 * Handles Slack events and slash commands
 */

const express = require('express');
const { createHmac } = require('crypto');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Verify Slack requests
const verifySlackRequest = (req, res, next) => {
  const signature = req.headers['x-slack-signature'];
  const timestamp = req.headers['x-slack-request-timestamp'];
  const body = JSON.stringify(req.body);
  
  const signingSecret = process.env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    console.error('SLACK_SIGNING_SECRET not set');
    return res.status(500).send('Server configuration error');
  }
  
  const expectedSignature = createHmac('sha256', signingSecret)
    .update(`v0:${timestamp}:${body}`)
    .digest('hex');
  
  const expectedSignatureWithPrefix = `v0=${expectedSignature}`;
  
  if (signature !== expectedSignatureWithPrefix) {
    console.error('Invalid Slack signature');
    return res.status(401).send('Unauthorized');
  }
  
  next();
};

// Handle Slack events
app.post('/slack/events', verifySlackRequest, (req, res) => {
  const { type, event, challenge } = req.body;
  
  // Handle URL verification
  if (type === 'url_verification') {
    console.log('Slack URL verification:', challenge);
    return res.send(challenge);
  }
  
  // Handle events
  if (type === 'event_callback' && event) {
    handleSlackEvent(event);
  }
  
  res.status(200).send('OK');
});

// Handle slash commands
app.post('/slack/specify', verifySlackRequest, (req, res) => {
  const { text, user_id, channel_id } = req.body;
  
  if (!text) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Please provide a description of the feature you want to build. Usage: `/specify Build a real-time chat feature`'
    });
  }
  
  // Process the specify command
  processSpecifyCommand(text, user_id, channel_id);
  
  res.json({
    response_type: 'in_channel',
    text: `🤖 Processing your specification request: "${text}"\n\n📊 Gathering MCP data and generating enhanced specification...`
  });
});

app.post('/slack/plan', verifySlackRequest, (req, res) => {
  const { text, user_id, channel_id } = req.body;
  
  if (!text) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Please provide a specification or feature description. Usage: `/plan [specification or feature description]`'
    });
  }
  
  // Process the plan command
  processPlanCommand(text, user_id, channel_id);
  
  res.json({
    response_type: 'in_channel',
    text: `📋 Processing your technical plan request: "${text}"\n\n🔧 Generating technical implementation plan with MCP integration...`
  });
});

app.post('/slack/tasks', verifySlackRequest, (req, res) => {
  const { text, user_id, channel_id } = req.body;
  
  if (!text) {
    return res.json({
      response_type: 'ephemeral',
      text: 'Please provide a technical plan or feature description. Usage: `/tasks [technical plan or feature description]`'
    });
  }
  
  // Process the tasks command
  processTasksCommand(text, user_id, channel_id);
  
  res.json({
    response_type: 'in_channel',
    text: `📝 Processing your task breakdown request: "${text}"\n\n✅ Generating actionable task breakdown with MCP integration...`
  });
});

app.post('/slack/status', verifySlackRequest, (req, res) => {
  const { user_id, channel_id } = req.body;
  
  // Process the status command
  processStatusCommand(user_id, channel_id);
  
  res.json({
    response_type: 'in_channel',
    text: `📊 Checking task status and progress...\n\n🔄 Retrieving current task information...`
  });
});

// Event handlers
function handleSlackEvent(event) {
  console.log('Received Slack event:', event.type);
  
  switch (event.type) {
    case 'app_mention':
      handleAppMention(event);
      break;
    case 'message':
      handleMessage(event);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
}

function handleAppMention(event) {
  const { text, user, channel } = event;
  console.log(`App mentioned by ${user} in ${channel}: ${text}`);
  
  // Extract the actual request from the mention
  const request = text.replace(/<@[^>]+>/g, '').trim();
  
  if (request) {
    // Process the mention as a general request
    processGeneralRequest(request, user, channel);
  }
}

function handleMessage(event) {
  const { text, user, channel, subtype } = event;
  
  // Ignore bot messages and other subtypes
  if (subtype || user === 'USLACKBOT') {
    return;
  }
  
  console.log(`Message from ${user} in ${channel}: ${text}`);
  
  // Check if message is directed at the bot
  if (text.includes('@SpecKitBot') || text.includes('specify') || text.includes('plan') || text.includes('tasks')) {
    processGeneralRequest(text, user, channel);
  }
}

// Command processors
function processSpecifyCommand(text, userId, channelId) {
  console.log(`Processing specify command: ${text}`);
  
  // Run the Enhanced Spec Kit Agent
  runEnhancedAgent('specify', text, userId, channelId);
}

function processPlanCommand(text, userId, channelId) {
  console.log(`Processing plan command: ${text}`);
  
  // Run the Enhanced Spec Kit Agent
  runEnhancedAgent('plan', text, userId, channelId);
}

function processTasksCommand(text, userId, channelId) {
  console.log(`Processing tasks command: ${text}`);
  
  // Run the Enhanced Spec Kit Agent
  runEnhancedAgent('tasks', text, userId, channelId);
}

function processStatusCommand(userId, channelId) {
  console.log(`Processing status command for user: ${userId}`);
  
  // Run the Enhanced Spec Kit Agent
  runEnhancedAgent('status', '', userId, channelId);
}

function processGeneralRequest(text, userId, channelId) {
  console.log(`Processing general request: ${text}`);
  
  // Run the Enhanced Spec Kit Agent
  runEnhancedAgent('general', text, userId, channelId);
}

// Run the Enhanced Spec Kit Agent
function runEnhancedAgent(command, text, userId, channelId) {
  console.log(`Running Enhanced Spec Kit Agent with command: ${command}`);
  
  // Spawn the Enhanced Spec Kit Agent process
  const agentProcess = spawn('node', ['scripts/demo-enhanced-agent.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      SLACK_USER_ID: userId,
      SLACK_CHANNEL_ID: channelId,
      SLACK_COMMAND: command,
      SLACK_TEXT: text
    }
  });
  
  let output = '';
  let error = '';
  
  agentProcess.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  agentProcess.stderr.on('data', (data) => {
    error += data.toString();
  });
  
  agentProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Enhanced Spec Kit Agent completed successfully');
      console.log('Output:', output);
      
      // Send results back to Slack
      sendSlackMessage(channelId, `✅ Enhanced Spec Kit Agent completed!\n\n${output}`);
    } else {
      console.error('Enhanced Spec Kit Agent failed with code:', code);
      console.error('Error:', error);
      
      // Send error back to Slack
      sendSlackMessage(channelId, `❌ Enhanced Spec Kit Agent failed: ${error}`);
    }
  });
  
  agentProcess.on('error', (err) => {
    console.error('Failed to start Enhanced Spec Kit Agent:', err);
    sendSlackMessage(channelId, `❌ Failed to start Enhanced Spec Kit Agent: ${err.message}`);
  });
}

// Send message to Slack
function sendSlackMessage(channel, text) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  
  if (!botToken) {
    console.error('SLACK_BOT_TOKEN not set');
    return;
  }
  
  const payload = {
    channel: channel,
    text: text,
    username: 'SpecKitBot',
    icon_emoji: ':robot_face:'
  };
  
  fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data.ok) {
      console.log('Message sent to Slack successfully');
    } else {
      console.error('Failed to send message to Slack:', data.error);
    }
  })
  .catch(error => {
    console.error('Error sending message to Slack:', error);
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Enhanced Spec Kit Agent Slack Webhook Server'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enhanced Spec Kit Agent Slack Webhook Server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/slack/events`);
  console.log(`🔧 Slash Commands:`);
  console.log(`   /specify: http://localhost:${PORT}/slack/specify`);
  console.log(`   /plan: http://localhost:${PORT}/slack/plan`);
  console.log(`   /tasks: http://localhost:${PORT}/slack/tasks`);
  console.log(`   /status: http://localhost:${PORT}/slack/status`);
  console.log(`\n💡 Make sure to update your Slack app URLs with these endpoints!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Enhanced Spec Kit Agent Slack Webhook Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Enhanced Spec Kit Agent Slack Webhook Server...');
  process.exit(0);
});
