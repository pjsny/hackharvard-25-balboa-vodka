# Quick Start: Voice Verification with Dynamic Questions

## TL;DR

Pass email and question to the voice dialog, configure your ElevenLabs agent to use them, and receive the answer in your webhook.

## Usage

```typescript
<VoiceVerificationDialog
  isOpen={showDialog}
  email="user@example.com"
  question="What is your mother's maiden name?"
  onSuccess={handleSuccess}
  onClose={handleClose}
  config={{
    apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
  }}
/>
```

## How Variables Are Injected

The SDK automatically passes these dynamic variables to your ElevenLabs agent:

```javascript
dynamicVariables: {
  user_email: "user@example.com",
  verification_question: "What is your mother's maiden name?",
  session_id: "verification_1705320000000",
  timestamp: "2024-01-15T10:30:00.000Z"
}
```

## Configure Your ElevenLabs Agent

### 1. Agent Prompt (Use Variables)

In your agent's system prompt, reference the variables using `{{variable_name}}`:

```
You are a voice verification assistant.

User: {{user_email}}
Question to ask: {{verification_question}}

Say: "Hello! Please answer this verification question: {{verification_question}}"
Wait for their answer, then end the conversation.
```

### 2. Set Up Webhook

1. **Go to ElevenLabs Dashboard** → Your Agent → **Webhooks**
2. **Add Webhook**:
   - URL: `https://your-domain.com/api/webhooks/checkout`
   - Events: `conversation.ended` or `tool_call_completed`
   - Save the webhook secret

3. **Add to `.env.local`**:
   ```bash
   ELEVENLABS_WEBHOOK_SECRET=your_secret_here
   ```

### 3. (Optional) Create Custom Tool

For more control, create a `complete_verification` tool in your agent that captures the data and triggers the webhook.

See full instructions in: [`ELEVENLABS_AGENT_SETUP.md`](./ELEVENLABS_AGENT_SETUP.md)

## What Your Webhook Receives

```json
{
  "event": "conversation.ended",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "conversation_id": "conv_123",
    "agent_id": "agent_456",
    "email": "user@example.com",
    "answer": "Smith",
    "question": "What is your mother's maiden name?"
  }
}
```

## Testing

### 1. Start Local Server
```bash
pnpm dev
```

### 2. Expose with ngrok
```bash
ngrok http 3000
```

### 3. Update ElevenLabs Webhook URL
Use your ngrok URL: `https://abc123.ngrok.io/api/webhooks/checkout`

### 4. Test the Dialog
```typescript
function TestPage() {
  return (
    <VoiceVerificationDialog
      isOpen={true}
      email="test@example.com"
      question="What is 2+2?"
      onSuccess={() => console.log('✅ Verified!')}
      onClose={() => console.log('❌ Closed')}
    />
  );
}
```

### 5. Check Console Logs

**Frontend:**
```
🚀 Starting verification with dynamic variables: {
  email: 'test@example.com',
  question: 'What is 2+2?',
  sessionId: 'verification_...'
}
```

**Backend Webhook:**
```
✅ User test@example.com completed voice verification
📝 Question: "What is 2+2?"
💬 Answer: "four"
```

## Next Steps

1. **Store in Database**: Save verification results
2. **Send Confirmation Email**: Notify user of successful verification
3. **Update Order Status**: Mark order as verified
4. **Customize Questions**: Pass different questions per use case

## Need Help?

- Full setup guide: [`ELEVENLABS_AGENT_SETUP.md`](./ELEVENLABS_AGENT_SETUP.md)
- Webhook guide: [`../apps/lander/app/api/webhooks/checkout/README.md`](../apps/lander/app/api/webhooks/checkout/README.md)
- SDK documentation: [`../packages/balboa-web-sdk/README.md`](../packages/balboa-web-sdk/README.md)

