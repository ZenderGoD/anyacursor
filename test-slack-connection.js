// Using built-in fetch in Node.js 18+

async function testSlackConnection() {
  const token = process.env.SLACK_BOT_TOKEN;
  
  if (!token) {
    console.error('❌ SLACK_BOT_TOKEN not set');
    return;
  }
  
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
    }
  } catch (error) {
    console.error('❌ Slack connection failed:', error.message);
  }
}

testSlackConnection();
