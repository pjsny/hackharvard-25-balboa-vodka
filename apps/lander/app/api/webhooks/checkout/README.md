# ElevenLabs Webhook Integration Guide

## Overview

This webhook endpoint receives events from ElevenLabs agents when users complete voice verification. It captures the user's email and their verification answer.

## How It Works

### 1. Frontend: Passing User Email to Agent

When starting a voice verification, pass the user's email in the session configuration:

```typescript
// In BalboaVerificationPopup or your component
const sessionOptions = {
  agentId: 'your-agent-id',
  connectionType: 'websocket',
  userId: sessionId,
  // Custom data that will be accessible to the agent
  clientTools: {
    custom_llm_extra_body: {
      email: 'user@example.com',
      session_id: sessionId,
      timestamp: new Date().toISOString()
    }
  }
};

await conversation.startSession(sessionOptions);
```

### 2. ElevenLabs Agent: Configure to Send Email in Webhook

You need to configure your ElevenLabs agent to extract and send the email in webhook payloads. Here's how:

#### Option A: Agent Prompt Configuration (Recommended)

Update your agent's system prompt to include:

```
When the user completes verification, you must extract and store:
1. The user's email from the conversation context
2. Their answer to the verification question

Use the `store_verification` tool to save this data.
```

#### Option B: Agent Custom Variables

1. Go to your ElevenLabs Agent dashboard
2. Navigate to **Agent Settings** → **Custom Variables**
3. Add variables:
   - `user_email` - Will store the user's email
   - `verification_answer` - Will store their answer

4. Configure your agent's conversation flow to extract these values

#### Option C: Use Agent Tools/Functions

Create a custom tool in your agent that captures the data:

```json
{
  "name": "complete_verification",
  "description": "Called when user completes voice verification",
  "parameters": {
    "type": "object",
    "properties": {
      "email": {
        "type": "string",
        "description": "User's email address"
      },
      "answer": {
        "type": "string",
        "description": "User's verification answer"
      }
    },
    "required": ["email", "answer"]
  }
}
```

### 3. Webhook Configuration in ElevenLabs

1. Go to **ElevenLabs Dashboard** → **Agent Settings** → **Webhooks**
2. Add a new webhook:
   - **URL**: `https://your-domain.com/api/webhooks/checkout`
   - **Events**: Select `conversation.ended`, `question.completed`, `scenario.completed`
   - **Secret**: Generate a webhook secret and save it
3. Save the webhook secret to your `.env.local`:
   ```bash
   ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### 4. Backend: Webhook Endpoint

The webhook endpoint at `/api/webhooks/checkout` expects this payload structure:

```typescript
{
  "event": "conversation.ended",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "agent_id": "agent_xxx",
    "conversation_id": "conv_xxx",
    "user_id": "verification_xxx",
    "email": "user@example.com",  // Required
    "answer": "Balboa at sunset",  // Required
    "question": "Please repeat the secret phrase",
    "scenario": "voice_verification"
  }
}
```

### 5. How the Agent Sends Email to Webhook

The agent needs to be configured to include the email in the webhook payload. Here are the methods:

#### Method 1: Extract from Conversation Context (Best)

Configure your agent's prompt to:

```
At the start of the conversation, ask: "To begin verification, please confirm your email address."

After the user provides their email, store it in memory and use it throughout the conversation.

When sending webhook data, always include:
- email: [the user's confirmed email]
- answer: [their verification response]
```

#### Method 2: Pass via Client-Side Metadata

The email is already being passed via `custom_llm_extra_body` in the session options. Configure your agent to:

1. Access custom metadata from the conversation context
2. Include it in webhook payloads

In your agent configuration, enable "Send conversation metadata in webhooks"

#### Method 3: Agent Knowledge Base

Store a mapping of `conversation_id` → `email` in your agent's knowledge base or database, then have the agent look it up when sending webhooks.

## Complete Flow Diagram

```
User → Frontend Component (with email)
  ↓
  Pass email via sessionOptions.clientTools
  ↓
ElevenLabs Agent (receives email in context)
  ↓
  User completes verification
  ↓
ElevenLabs Agent (extracts answer)
  ↓
  Triggers webhook with email + answer
  ↓
Your Backend Webhook (/api/webhooks/checkout)
  ↓
  Validates signature
  ↓
  Stores verification result in database
  ↓
  Returns success
```

## Testing

### 1. Test Webhook Locally with ngrok

```bash
# Install ngrok
brew install ngrok

# Start your local server
pnpm dev

# Expose your local webhook endpoint
ngrok http 3000

# Use the ngrok URL in ElevenLabs webhook configuration
# Example: https://abc123.ngrok.io/api/webhooks/checkout
```

### 2. Test Payload

Send a test POST request:

```bash
curl -X POST http://localhost:3000/api/webhooks/checkout \
  -H "Content-Type: application/json" \
  -H "x-elevenlabs-signature: your_signature_here" \
  -d '{
    "event": "conversation.ended",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
      "conversation_id": "test_conv_123",
      "agent_id": "test_agent",
      "email": "test@example.com",
      "answer": "Balboa at sunset"
    }
  }'
```

### 3. Check Logs

Monitor your console output to see:
```
Question/Scenario completed: {
  conversation_id: 'conv_xxx',
  email: 'user@example.com',
  answer: 'Balboa at sunset',
  ...
}
```

## Troubleshooting

### Issue: Email not included in webhook

**Solution 1**: Make sure the agent is configured to extract and send the email. Update the agent's system prompt.

**Solution 2**: Verify `clientTools.custom_llm_extra_body` is being passed in `startSession()`.

**Solution 3**: Check ElevenLabs agent logs to see what data is being sent to webhooks.

### Issue: Webhook not receiving events

**Solution 1**: Verify webhook URL is correct and accessible from internet (use ngrok for local testing).

**Solution 2**: Check ElevenLabs dashboard for webhook delivery logs and errors.

**Solution 3**: Ensure you selected the correct event types (`conversation.ended`, etc.).

### Issue: Invalid signature error

**Solution**: Make sure `ELEVENLABS_WEBHOOK_SECRET` matches the secret in ElevenLabs dashboard.

## Next Steps

After the webhook receives the data:

1. **Store in Database**:
   ```typescript
   await db.verifications.create({
     email: data.email,
     answer: data.answer,
     conversation_id: data.conversation_id,
     verified: true,
     timestamp: new Date()
   });
   ```

2. **Send Confirmation Email**:
   ```typescript
   await sendEmail({
     to: data.email,
     subject: 'Voice Verification Complete',
     body: 'Your identity has been verified successfully.'
   });
   ```

3. **Update Order Status**:
   ```typescript
   await updateOrderStatus(data.email, 'verified');
   ```

## Security Best Practices

1. **Always validate webhook signatures**
2. **Use HTTPS in production**
3. **Store webhook secret securely** (environment variables)
4. **Rate limit webhook endpoint**
5. **Log all webhook events for auditing**
6. **Validate email format before processing**
7. **Sanitize user input (email, answer)**

## Environment Variables Required

```bash
# .env.local
ELEVENLABS_API_KEY=your_api_key
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id
```

## Support

For more information:
- [ElevenLabs Webhooks Documentation](https://elevenlabs.io/docs/conversational-ai/webhooks)
- [ElevenLabs Agent Configuration](https://elevenlabs.io/docs/conversational-ai/agents)

