# 🚀 Slack Setup Guide for Enhanced Spec Kit Agent

## 📋 **Step-by-Step Setup Process**

### **Step 1: Create Slack App**

1. **Go to Slack API Dashboard:**
   - Visit: https://api.slack.com/apps
   - Click **"Create New App"**
   - Choose **"From scratch"**

2. **Configure Basic App Settings:**
   - **App Name:** `Enhanced Spec Kit Agent`
   - **Development Slack Workspace:** Select your workspace
   - Click **"Create App"**

### **Step 2: Configure Bot Permissions**

1. **Go to "OAuth & Permissions"** in the left sidebar

2. **Add Bot Token Scopes:**
   ```
   app_mentions:read
   channels:history
   channels:read
   chat:write
   groups:history
   groups:read
   im:history
   im:read
   mpim:history
   mpim:read
   users:read
   users:read.email
   ```

3. **Click "Install to Workspace"**
4. **Copy the Bot User OAuth Token** (starts with `xoxb-`)

### **Step 3: Get App Token and Signing Secret**

1. **Go to "Basic Information"** in the left sidebar
2. **Copy the App Token** (starts with `xapp-`)
3. **Copy the Signing Secret**

### **Step 4: Update Environment Variables**

Update your `.env.local` file with the actual Slack tokens:

```bash
# Replace these with your actual tokens
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token-here
SLACK_APP_TOKEN=xapp-your-actual-app-token-here
SLACK_SIGNING_SECRET=your-actual-signing-secret-here
```

### **Step 5: Set Up Event Subscriptions**

1. **Go to "Event Subscriptions"** in the left sidebar
2. **Toggle "Enable Events" to On**
3. **Set Request URL:** `http://localhost:3000/slack/events`
4. **Add Bot Events:**
   ```
   app_mention
   message.channels
   message.groups
   message.im
   message.mpim
   ```

### **Step 6: Configure Slash Commands**

Create these slash commands in your Slack app:

#### **`/specify`**
- **Command:** `/specify`
- **Request URL:** `http://localhost:3000/slack/specify`
- **Short Description:** `Generate specification for a feature`
- **Usage Hint:** `Describe the feature you want to build`

#### **`/plan`**
- **Command:** `/plan`
- **Request URL:** `http://localhost:3000/slack/plan`
- **Short Description:** `Generate technical plan from specification`
- **Usage Hint:** `Provide specification or feature description`

#### **`/tasks`**
- **Command:** `/tasks`
- **Request URL:** `http://localhost:3000/slack/tasks`
- **Short Description:** `Generate task breakdown from plan`
- **Usage Hint:** `Provide technical plan or feature description`

#### **`/status`**
- **Command:** `/status`
- **Request URL:** `http://localhost:3000/slack/status`
- **Short Description:** `Check task status and progress`
- **Usage Hint:** `Get current status of all tasks`

### **Step 7: Install Dependencies and Start Services**

1. **Install Slack webhook dependencies:**
   ```bash
   npm install express node-fetch nodemon --save
   ```

2. **Start the Slack webhook server:**
   ```bash
   node slack-webhook-server.js
   ```

3. **Start MCP servers (in another terminal):**
   ```bash
   cd mcp-servers
   npm run start:all
   ```

### **Step 8: Test the Integration**

1. **Invite the bot to a channel:**
   - Go to your Slack workspace
   - Invite `@Enhanced Spec Kit Agent` to a channel

2. **Test the bot:**
   ```
   @SpecKitBot /specify Build a real-time chat feature
   ```

3. **Try other commands:**
   ```
   @SpecKitBot /plan Create a user authentication system
   @SpecKitBot /tasks Implement a dashboard with charts
   @SpecKitBot /status
   ```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Invalid Slack signature" error:**
   - Check that `SLACK_SIGNING_SECRET` is set correctly
   - Ensure the webhook server is running

2. **"Bot not responding":**
   - Verify `SLACK_BOT_TOKEN` is correct
   - Check that the bot is invited to the channel
   - Ensure event subscriptions are enabled

3. **"Slash commands not working":**
   - Verify the Request URLs are set correctly
   - Check that the webhook server is running on port 3000
   - Ensure the bot has the required permissions

### **Testing Commands:**

```bash
# Test Slack connection
node -e "
const fetch = require('node-fetch');
fetch('https://slack.com/api/auth.test', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.SLACK_BOT_TOKEN,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log);
"

# Test webhook server
curl http://localhost:3000/health
```

## 📱 **Usage Examples**

### **Basic Commands:**
```
@SpecKitBot /specify Build a real-time collaboration feature
@SpecKitBot /plan Create a user dashboard with analytics
@SpecKitBot /tasks Implement a payment processing system
@SpecKitBot /status
```

### **Direct Messages:**
```
/specify Build a chat interface with typing indicators
/plan Create a real-time notification system
/tasks Implement a file upload feature
/status
```

### **Channel Mentions:**
```
@SpecKitBot Build a real-time collaboration feature for the chat interface
@SpecKitBot Create a user authentication system with OAuth
@SpecKitBot Implement a dashboard with real-time data visualization
```

## 🎉 **Success!**

Once everything is set up, you'll have:

- ✅ **Slack bot** responding to commands
- ✅ **Enhanced Spec Kit Agent** processing requests
- ✅ **MCP services** providing data and components
- ✅ **Real-time progress updates** via Slack
- ✅ **Complete workflow** from user request to task execution

## 📚 **Additional Resources**

- [Slack API Documentation](https://api.slack.com)
- [Slack App Configuration](https://api.slack.com/apps)
- [Webhook Server Code](slack-webhook-server.js)
- [MCP Setup Guide](MCP-SETUP-GUIDE.md)

---

🎯 **You're now ready to communicate with the Enhanced Spec Kit Agent via Slack!**
