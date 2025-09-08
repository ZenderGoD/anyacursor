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
    const userId = formData.get('user_id');
    const channelId = formData.get('channel_id');
    
    // Process the status command
    console.log(`Processing status command from user ${userId} in channel ${channelId}`);
    
    return NextResponse.json({
      response_type: 'in_channel',
      text: `📊 Checking task status and progress...\n\n🔄 Retrieving current task information...`
    });
  } catch (error) {
    console.error('Slack status command error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
