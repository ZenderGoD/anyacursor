import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-slack-signature');
    const timestamp = request.headers.get('x-slack-request-timestamp');
    
    // Verify Slack request
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const expectedSignature = createHmac('sha256', signingSecret)
      .update(`v0:${timestamp}:${body}`)
      .digest('hex');
    
    const expectedSignatureWithPrefix = `v0=${expectedSignature}`;
    
    if (signature !== expectedSignatureWithPrefix) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const formData = new URLSearchParams(body);
    const text = formData.get('text');
    const userId = formData.get('user_id');
    const channelId = formData.get('channel_id');
    
    if (!text) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Please provide a technical plan or feature description. Usage: `/tasks [technical plan or feature description]`'
      });
    }
    
    // Process the tasks command
    console.log(`Processing tasks command: ${text} from user ${userId} in channel ${channelId}`);
    
    return NextResponse.json({
      response_type: 'in_channel',
      text: `📝 Processing your task breakdown request: "${text}"\n\n✅ Generating actionable task breakdown with MCP integration...`
    });
  } catch (error) {
    console.error('Slack tasks command error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
