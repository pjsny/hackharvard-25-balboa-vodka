# ElevenLabs Agent Setup Guide

## Overview

This guide shows you how to configure your ElevenLabs agent to:
1. **Receive dynamic variables** (email, question) from the frontend
2. **Ask the verification question**
3. **Capture the user's answer**
4. **Send email + answer to your webhook**

## Step 1: Create Dynamic Variables in Agent Prompt

In your ElevenLabs agent configuration, you can access dynamic variables using the `{{variable_name}}` syntax.

### Agent System Prompt Template

```
You are a voice verification assistant for Balboa. Your role is to verify the user's identity through a voice conversation.

IMPORTANT CONTEXT:
- User's email: {{user_email}}
- Verification question: {{verification_question}}
- Session ID: {{session_id}}

YOUR TASK:
1. Greet the user professionally
2. Ask them the verification question: "{{verification_question}}"
3. Listen carefully to their answer
4. When they provide an answer, confirm you received it
5. End the conversation by calling the complete_verification function

RULES:
- Be friendly but professional
- Speak clearly and wait for the user to respond
- If the user doesn't understand, repeat the question once
- Do not reveal the correct answer
- After receiving an answer, immediately call the complete_verification function
```

## Step 2: Create a Custom Tool for Verification

In your ElevenLabs agent dashboard, add a custom tool:

### Tool Name: `complete_verification`

### Tool Configuration

```json
{
  "name": "complete_verification",
  "description": "Called when the user completes voice verification by answering the question. This triggers the webhook with verification data.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_email": {
        "type": "string",
        "description": "The user's email address from conversation context"
      },
      "verification_question": {
        "type": "string",
        "description": "The verification question that was asked"
      },
      "user_answer": {
        "type": "string",
        "description": "The user's spoken answer to the verification question"
      },
      "session_id": {
        "type": "string",
        "description": "The verification session ID"
      }
    },
    "required": ["user_email", "user_answer"]
  },
  "webhook": {
    "url": "https://your-domain.com/api/webhooks/checkout",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    }
  }
}
```

### Tool Implementation Instructions

In the tool's "Instructions" field:

```
When called, this function should:
1. Extract the user_email from {{user_email}}
2. Extract the verification_question from {{verification_question}}
3. Extract the session_id from {{session_id}}
4. Use the user_answer parameter provided by the LLM
5. Send all data to the webhook endpoint
6. End the conversation after successful webhook delivery
```

## Step 3: Configure Webhook in Tool Response

### Option A: Use ElevenLabs Built-in Webhook

In your agent settings:
1. Go to **Webhooks** → **Add Webhook**
2. Set URL: `https://your-domain.com/api/webhooks/checkout`
3. Select events: `tool_call_completed`
4. The webhook will receive:

```json
{
  "event": "tool_call_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "agent_id": "agent_xxx",
    "conversation_id": "conv_xxx",
    "tool_name": "complete_verification",
    "tool_parameters": {
      "user_email": "user@example.com",
      "verification_question": "What is the secret phrase?",
      "user_answer": "Balboa at sunset",
      "session_id": "verification_123"
    }
  }
}
```

### Option B: Use Server-Side Function (Recommended)

Create a server-side function that your agent can call:

1. In ElevenLabs dashboard → **Agent** → **Tools** → **Add Server Function**
2. Configure endpoint: `https://your-domain.com/api/agent/complete-verification`
3. Method: POST
4. The agent will call this endpoint with the tool parameters

Create the endpoint in your Next.js app:

```typescript
// apps/lander/app/api/agent/complete-verification/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('✅ Verification completed:', {
      email: data.user_email,
      answer: data.user_answer,
      question: data.verification_question,
      session_id: data.session_id
    });

    // Store in database
    // await db.verifications.create({ ... });

    // Optionally trigger webhook manually
    // await triggerWebhook(data);

    return NextResponse.json({
      success: true,
      message: "Verification recorded successfully"
    });
  } catch (error) {
    console.error('Error completing verification:', error);
    return NextResponse.json(
      { error: "Failed to complete verification" },
      { status: 500 }
    );
  }
}
```

## Step 4: Example Conversation Flow

Here's how the conversation will work:

### 1. Frontend Starts Conversation
```typescript
<VoiceVerificationDialog
  isOpen={true}
  email="john@example.com"
  question="What is your mother's maiden name?"
  onSuccess={handleSuccess}
  onClose={handleClose}
  config={{
    apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
  }}
/>
```

### 2. Agent Receives Dynamic Variables
```
user_email: "john@example.com"
verification_question: "What is your mother's maiden name?"
session_id: "verification_1705320000000"
```

### 3. Agent Conversation
```
Agent: "Hello! To verify your identity, please answer this question: What is your mother's maiden name?"
User: "Smith"
Agent: "Thank you. I've recorded your answer."
[Agent calls complete_verification tool]
```

### 4. Webhook Receives Data
```json
{
  "event": "conversation.ended",
  "data": {
    "email": "john@example.com",
    "answer": "Smith",
    "question": "What is your mother's maiden name?",
    "conversation_id": "conv_xxx"
  }
}
```

## Step 5: Alternative Agent Prompt (Simpler)

If you don't want to use custom tools, you can use a simpler approach with the default webhook:

```
You are a voice verification assistant for Balboa.

User Email: {{user_email}}
Verification Question: {{verification_question}}

YOUR SCRIPT:
1. Say: "Hello! For security verification, please answer this question: {{verification_question}}"
2. Wait for their answer
3. Say: "Thank you, I've recorded your answer as: [repeat their answer]"
4. Immediately end the conversation

IMPORTANT:
- After the user answers, end the conversation immediately
- The webhook will capture: user_email={{user_email}}, answer=[their spoken response]
```

Then configure a `conversation.ended` webhook that includes conversation metadata.

## Step 6: Testing

### Test with Frontend Component

```typescript
import { VoiceVerificationDialog } from '@balboa/web';

function TestVerification() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Test Verification
      </button>

      <VoiceVerificationDialog
        isOpen={showDialog}
        email="test@example.com"
        question="What is the secret code?"
        onSuccess={() => {
          console.log('✅ Verification successful!');
          setShowDialog(false);
        }}
        onClose={() => setShowDialog(false)}
        config={{
          apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY,
          agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
        }}
      />
    </>
  );
}
```

### Test Webhook Locally

```bash
# Terminal 1: Start your app
pnpm dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# Use ngrok URL in ElevenLabs webhook config
# https://abc123.ngrok.io/api/webhooks/checkout
```

### Verify Logs

Check your console for:
```
🚀 Starting verification with dynamic variables: {
  email: 'test@example.com',
  question: 'What is the secret code?',
  sessionId: 'verification_1705320000000'
}
```

And in your webhook:
```
Question/Scenario completed: {
  email: 'test@example.com',
  answer: 'user response here',
  question: 'What is the secret code?'
}
```

## Step 7: Webhook Payload Update

Update your webhook handler to extract data from the tool call:

```typescript
// apps/lander/app/api/webhooks/checkout/route.ts

async function handleToolCallCompleted(data: any) {
  const params = data.tool_parameters;

  console.log("Tool call completed:", {
    email: params.user_email,
    answer: params.user_answer,
    question: params.verification_question,
    session_id: params.session_id
  });

  // Validate required fields
  if (!params.user_email || !params.user_answer) {
    throw new Error("Missing required fields");
  }

  // Store in database
  // await db.verifications.create({ ... });

  return {
    success: true,
    email: params.user_email,
    verified: true
  };
}

// Add to switch statement in handleAgentEvent
case "tool_call_completed":
  await handleToolCallCompleted(event.data);
  break;
```

## Summary

**Frontend → Agent:**
- Email via `dynamicVariables.user_email`
- Question via `dynamicVariables.verification_question`

**Agent → Webhook:**
- Captures user's spoken answer
- Sends email + answer + question to webhook

**Webhook → Database:**
- Stores verification result
- Marks user as verified

This creates a complete, secure voice verification flow! 🎉

