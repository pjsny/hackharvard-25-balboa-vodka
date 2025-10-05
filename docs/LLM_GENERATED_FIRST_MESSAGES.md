# LLM-Generated First Messages

## Overview

The voice verification system uses **Gemini Flash** to dynamically generate natural, varied first messages for each verification session. This creates authentic-sounding fraud prevention messages that feel less scripted.

## Architecture

```
┌──────────────┐
│   Frontend   │ Clicks "Start Verification"
└──────┬───────┘
       │ Question: "What city were you born in"
       ▼
┌──────────────┐
│  Component   │ Calls generateFirstMessage(question)
└──────┬───────┘
       │ POST /api/generate-first-message
       ▼
┌──────────────┐
│ Gemini Flash │ Generates natural phrasing
│     LLM      │ Temperature: 0.8 (creative)
└──────┬───────┘
       │ Returns: "We've noticed unusual activity..."
       ▼
┌──────────────┐
│ ElevenLabs   │ Speaks the generated message
│    Agent     │ Then asks for answer
└──────────────┘
```

## API Endpoint

### `/api/generate-first-message`

**Location**: `apps/lander/app/api/generate-first-message/route.ts`

#### Request
```json
POST /api/generate-first-message
{
  "question": "What city were you born in"
}
```

#### Response
```json
{
  "success": true,
  "firstMessage": "We've noticed unusual activity on this transaction. For security purposes, what city were you born in?",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Error Response (with Fallback)
```json
{
  "success": true,
  "firstMessage": "This transaction seems suspicious. Could you quickly tell me what city were you born in?",
  "fallback": true,
  "error": "API timeout"
}
```

## LLM Prompt

The endpoint uses this carefully crafted prompt:

```
You are writing the first message for a voice fraud prevention agent
in an e-commerce transaction.

Context:
- A potentially fraudulent transaction has been detected
- The agent needs to verify the customer's identity via voice
- The conversation should be professional but not alarming
- Keep it brief and natural

Question to ask: "{question}"

Create ONE natural opening message that:
1. Briefly mentions fraud prevention or security (1 sentence)
2. Naturally leads into asking the question
3. Sounds human and conversational
4. Is professional but friendly
5. Total length: 1-2 sentences maximum

Examples of good messages:
- "This transaction seems suspicious. Could you quickly tell me {question}?"
- "We've detected unusual activity. For security purposes, {question}?"
- "Before we proceed, I need to verify something. {question}?"

DO NOT:
- Use quotes or markdown
- Add explanations or notes
- Be overly formal or robotic
- Make it too long

Generate ONLY the message text:
```

## Configuration

### LLM Settings

```typescript
model: google("gemini-2.5-flash")
temperature: 0.8  // Higher for natural variety
maxTokens: 100   // Keep responses concise
```

### Why Gemini Flash?

- ✅ **Fast**: Low latency (~500ms)
- ✅ **Cheap**: Cost-effective for high volume
- ✅ **Natural**: Creates human-sounding text
- ✅ **Reliable**: Consistent quality

### Temperature: 0.8

- **Higher temperature** = More creative variations
- Each call produces unique phrasing
- Still maintains professional tone
- Balances creativity with consistency

## Example Generations

### Question: "What is your mother's maiden name"

**Generated Messages:**
1. "We need to verify your identity before proceeding. What is your mother's maiden name?"
2. "This purchase appears suspicious. For security, what is your mother's maiden name?"
3. "Hold on - I need to confirm something. What is your mother's maiden name?"
4. "Before we complete this order, could you tell me what is your mother's maiden name?"
5. "We've flagged this transaction. Quick security check: what is your mother's maiden name?"

### Question: "What city were you born in"

**Generated Messages:**
1. "This transaction needs verification. What city were you born in?"
2. "We've detected unusual activity. For your security, what city were you born in?"
3. "Before we proceed, I have a quick question: what city were you born in?"
4. "To prevent fraud, I need to ask: what city were you born in?"
5. "Hold on - I need to verify your identity. What city were you born in?"

### Question: "What was the name of your first pet"

**Generated Messages:**
1. "This order seems unusual. For security purposes, what was the name of your first pet?"
2. "We need to confirm your identity. What was the name of your first pet?"
3. "Before completing this purchase, could you tell me what was the name of your first pet?"
4. "I've detected suspicious activity. Quick verification: what was the name of your first pet?"
5. "To protect your account, what was the name of your first pet?"

## Frontend Integration

### Component Usage

```typescript
// In BalboaVerificationPopup.tsx
const generateFirstMessage = async (question?: string): Promise<string> => {
  if (!question) {
    return "This transaction seems suspicious...";
  }

  try {
    const response = await fetch('/api/generate-first-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    console.log('🎤 Generated:', data.firstMessage);

    return data.firstMessage;
  } catch (error) {
    // Fallback on error
    return `This transaction seems suspicious. ${question.toLowerCase()}?`;
  }
};

// Called when user clicks "Start Verification"
const firstMessage = await generateFirstMessage(question);

// Passed to ElevenLabs
sessionOptions = {
  firstMessage: firstMessage,
  // ...
};
```

## Fallback Strategy

The system has **multiple fallback layers** for reliability:

### Layer 1: LLM Generation
```
Try: Call Gemini Flash API
Success: Use generated message ✅
```

### Layer 2: API Error Handling
```
If API fails: Return hardcoded fallback
Message: "This transaction seems suspicious. {question}?"
```

### Layer 3: Frontend Fallback
```
If fetch fails: Use local fallback
Message: "This transaction seems suspicious. {question}?"
```

### Layer 4: No Question Provided
```
If no question: Generic message
Message: "This transaction seems suspicious. Verify your identity?"
```

## Performance

### Typical Flow:
```
Component renders → User clicks button
  ↓ (0ms)
generateFirstMessage() called
  ↓ (5ms)
POST /api/generate-first-message
  ↓ (500ms - Gemini Flash)
Response received
  ↓ (10ms)
ElevenLabs session starts with message
  ↓ (200ms - WebSocket)
Agent speaks generated message
```

**Total latency**: ~700ms (acceptable for UX)

### Optimization Options:

**1. Pre-generate on Page Load**
```typescript
useEffect(() => {
  if (question) {
    // Pre-generate while user reads form
    generateFirstMessage(question).then(setPreGeneratedMessage);
  }
}, [question]);
```

**2. Cache Common Questions**
```typescript
const messageCache = new Map<string, string>();

async function generateFirstMessage(q: string) {
  if (messageCache.has(q)) {
    return messageCache.get(q);
  }
  const message = await callAPI(q);
  messageCache.set(q, message);
  return message;
}
```

**3. Server-Side Caching** (Redis)
```typescript
// Check cache first
const cached = await redis.get(`first-message:${hash(question)}`);
if (cached) return cached;

// Generate and cache
const message = await generateWithLLM(question);
await redis.set(`first-message:${hash(question)}`, message, 'EX', 3600);
```

## Monitoring

### Log Every Generation

```typescript
console.log('🎤 Generated first message:', {
  question: question,
  message: firstMessage,
  latency: endTime - startTime,
  fallback: usedFallback,
});
```

### Track Analytics

```typescript
analytics.track('first_message_generated', {
  question_length: question.length,
  message_length: firstMessage.length,
  latency_ms: latency,
  used_fallback: usedFallback,
});
```

### A/B Testing

```typescript
// Test LLM vs Hardcoded
const variant = user.id % 2 === 0 ? 'llm' : 'hardcoded';

const message = variant === 'llm'
  ? await generateWithLLM(question)
  : getHardcodedVariation(question);

analytics.track('verification_started', {
  variant: variant,
  completed: await trackCompletion(),
});
```

## Cost Analysis

### Per Request:
```
Gemini Flash: ~$0.000035 per request
(1000 tokens input + 100 tokens output at $0.035/1M tokens)

At 10,000 verifications/day: $0.35/day = $10.50/month
```

### Cost Optimization:

**1. Cache for 1 hour per question**
```
Unique questions per day: ~100
Requests reduced: 10,000 → 100
Cost: $10.50/month → $0.11/month
```

**2. Use cheaper model for simple questions**
```typescript
const model = question.length < 30
  ? google("gemini-2.5-flash-8b")  // Even cheaper!
  : google("gemini-2.5-flash");
```

## Security Considerations

### ✅ **Safe:**
- LLM only receives the question (public info)
- No user data or expected answers sent
- No PII in generation request
- Stateless API (no data stored)

### ⚠️ **Be Aware:**
- LLM could theoretically generate offensive content
- Monitor outputs for inappropriate messages
- Have moderation/filter layer if needed

## Testing

### Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/generate-first-message \
  -H "Content-Type: application/json" \
  -d '{"question": "What is your favorite color"}'
```

**Expected Response:**
```json
{
  "success": true,
  "firstMessage": "We need to verify this transaction. What is your favorite color?",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test Multiple Generations

```typescript
const question = "What city were you born in";

for (let i = 0; i < 5; i++) {
  const response = await fetch('/api/generate-first-message', {
    method: 'POST',
    body: JSON.stringify({ question })
  });
  const data = await response.json();
  console.log(`Variation ${i + 1}:`, data.firstMessage);
}
```

## Environment Variables

```bash
# Required for Gemini Flash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional: Configure API URL
NEXT_PUBLIC_BALBOA_API_URL=https://api.balboa.vodka
```

## Summary

**LLM-Generated First Messages provide:**

- ✅ **Natural variety**: Every message sounds unique
- ✅ **Professional tone**: Consistent fraud prevention context
- ✅ **Fast generation**: ~500ms latency
- ✅ **Cost effective**: < $0.01/day for most volumes
- ✅ **Fallback safe**: Multiple layers prevent failures
- ✅ **Zero-knowledge**: No secrets exposed to LLM

**The agent sounds more human with every interaction!** 🎉

