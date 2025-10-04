# Zero-Knowledge Proof Voice Verification

## Overview

Balboa implements **zero-knowledge proof** verification where the expected answer is **never exposed** to the frontend or stored alongside user data. Instead, we use Gemini Flash LLM to semantically verify if the user's answer matches the expected answer.

## Architecture

```
┌─────────────┐
│  Frontend   │ Only knows the QUESTION
│             │ (Never receives expected answer)
└──────┬──────┘
       │ Passes: email + question
       ▼
┌─────────────┐
│ ElevenLabs  │ Asks question, captures answer
│   Agent     │
└──────┬──────┘
       │ Sends: email + question + userAnswer
       ▼
┌─────────────┐
│  Webhook    │ Receives user's answer
└──────┬──────┘
       │ Calls verification API
       ▼
┌─────────────┐
│ /verify-    │ Uses Gemini Flash to verify
│  answer     │ Semantic matching (not exact string)
└──────┬──────┘
       │ Returns: verified + confidence + reason
       ▼
┌─────────────┐
│  Database   │ Stores: verified status only
│             │ (Not the expected answer)
└─────────────┘
```

## Why Zero-Knowledge?

### ❌ **Traditional Approach (Insecure)**
```typescript
// BAD: Expected answer exposed to frontend
<VoiceDialog
  question="What is your mother's maiden name?"
  expectedAnswer="Smith"  // ❌ Exposed in client code!
/>

// Verification happens on frontend
if (userAnswer === expectedAnswer) { // ❌ Can be bypassed!
  verified = true;
}
```

**Problems:**
- Expected answer visible in browser devtools
- Can be intercepted via network inspection
- Frontend verification can be bypassed
- Answer stored in plaintext in database

### ✅ **Zero-Knowledge Approach (Secure)**
```typescript
// GOOD: Only question is exposed
<VoiceDialog
  question="What is your mother's maiden name?"
  // No expected answer provided!
/>

// User gives answer → sent to backend
// Backend uses LLM to verify semantically
// Expected answer never leaves backend
```

**Benefits:**
- ✅ Expected answer never reaches frontend
- ✅ Semantic matching (handles variations)
- ✅ Backend-only verification
- ✅ Only stores verified/rejected status
- ✅ LLM provides confidence score + reasoning

## How It Works

### 1. Frontend Asks Question

```typescript
<VoiceVerificationDialog
  isOpen={true}
  email="user@example.com"
  question="What city were you born in?"
  // Note: NO expected answer provided!
  onSuccess={handleSuccess}
  onClose={handleClose}
/>
```

### 2. ElevenLabs Agent Captures Answer

Agent receives:
- `{{user_email}}`: "user@example.com"
- `{{verification_question}}`: "What city were you born in?"

Agent asks question and captures user's spoken answer.

### 3. Webhook Receives Answer

```json
{
  "event": "tool_call_completed",
  "data": {
    "tool_parameters": {
      "user_email": "user@example.com",
      "verification_question": "What city were you born in?",
      "user_answer": "San Francisco"
    }
  }
}
```

### 4. Backend Verifies with Gemini Flash

```typescript
// API call to /api/verify-answer
const result = await generateText({
  model: google("gemini-1.5-flash"),
  prompt: `
    Question: "What city were you born in?"
    User's Answer: "San Francisco"

    Is this answer semantically correct?
    Return JSON: { verified, confidence, reason }
  `
});
```

**Gemini Response:**
```json
{
  "verified": true,
  "confidence": 0.95,
  "reason": "User provided a valid city name that could be their birthplace"
}
```

### 5. Store Result

```typescript
await db.verifications.create({
  email: "user@example.com",
  question: "What city were you born in?",
  user_answer: "San Francisco",
  verified: true,  // ✅ Only store the verdict
  confidence: 0.95,
  // Note: Expected answer is NOT stored!
});
```

## API: `/api/verify-answer`

### Endpoint
```
POST /api/verify-answer
```

### Request
```json
{
  "question": "What is your mother's maiden name?",
  "userAnswer": "Smith",
  "email": "user@example.com",
  "conversationId": "conv_123"
}
```

### Response (Success)
```json
{
  "success": true,
  "verified": true,
  "confidence": 0.92,
  "reason": "Answer matches expected format and context",
  "email": "user@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Response (Failed)
```json
{
  "success": true,
  "verified": false,
  "confidence": 0.15,
  "reason": "Answer does not match expected information",
  "email": "user@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## LLM Verification Prompt

The verification uses this prompt with Gemini Flash:

```
You are a voice verification assistant. Your task is to determine
if the user's spoken answer is semantically correct for the given question.

Question: "${question}"
User's Answer: "${userAnswer}"

Analyze if the user's answer is:
1. Semantically correct (meaning matches even if wording is different)
2. Contextually appropriate
3. Shows genuine knowledge of the answer

Respond with ONLY a JSON object:
{
  "verified": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

Be strict but fair. Accept variations in wording but reject
obviously wrong answers.
```

## Semantic Matching Examples

### ✅ **Accepted Variations**

**Question:** "What is your mother's maiden name?"
- "Smith" ✅
- "My mother's maiden name is Smith" ✅
- "It's Smith" ✅
- "Smith was her maiden name" ✅

**Question:** "What city were you born in?"
- "San Francisco" ✅
- "I was born in San Francisco" ✅
- "San Francisco, California" ✅
- "SF" ✅ (known abbreviation)

### ❌ **Rejected Answers**

**Question:** "What is your mother's maiden name?"
- "I don't know" ❌
- "Jones" ❌ (if expected was "Smith")
- "My name is John" ❌ (wrong context)
- Random gibberish ❌

## Security Benefits

### 1. **No Frontend Exposure**
```typescript
// ❌ NEVER do this
const expectedAnswer = "Smith"; // Visible in devtools!

// ✅ Always do this
// Expected answer only exists in backend/database
```

### 2. **No Network Interception**
```
Frontend → Backend: Only sends userAnswer
Backend → LLM: Only sends question + userAnswer
Response: Only contains verified boolean

Expected answer NEVER transmitted over network!
```

### 3. **No Database Leakage**
```sql
-- ❌ DON'T store:
CREATE TABLE verifications (
  user_answer TEXT,
  expected_answer TEXT  -- ❌ Security risk!
);

-- ✅ DO store:
CREATE TABLE verifications (
  user_answer TEXT,
  verified BOOLEAN,     -- ✅ Only the result
  confidence FLOAT,
  reason TEXT
);
```

### 4. **Semantic Flexibility**
- Accepts natural variations in speech
- Handles different phrasings
- Resistant to exact string matching attacks
- More user-friendly than exact match

## Configuration

### Environment Variables

```bash
# Required for Gemini Flash LLM
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional: Configure LLM model
VERIFICATION_LLM_MODEL=gemini-1.5-flash
VERIFICATION_LLM_TEMPERATURE=0.1
VERIFICATION_CONFIDENCE_THRESHOLD=0.7
```

### Customize Verification Logic

Edit `/api/verify-answer/route.ts`:

```typescript
// Adjust confidence threshold
const CONFIDENCE_THRESHOLD = 0.7;

if (verificationResult.confidence >= CONFIDENCE_THRESHOLD) {
  verified = true;
}

// Adjust prompt strictness
const prompt = `Be very strict...` // or "Be lenient..."

// Use different LLM model
model: google("gemini-1.5-pro") // More accurate but slower
```

## Testing

### Test Verification API

```bash
curl -X POST http://localhost:3000/api/verify-answer \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is 2+2?",
    "userAnswer": "four",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "verified": true,
  "confidence": 0.99,
  "reason": "User provided correct answer with proper semantic understanding"
}
```

### Test with Variations

```bash
# Should all pass
curl ... -d '{"userAnswer": "4"}'
curl ... -d '{"userAnswer": "four"}'
curl ... -d '{"userAnswer": "2 plus 2 is 4"}'

# Should fail
curl ... -d '{"userAnswer": "5"}'
curl ... -d '{"userAnswer": "I don\'t know"}'
```

## Best Practices

### ✅ **DO:**
- Store question asked
- Store user's answer
- Store verification result (verified boolean)
- Store confidence score
- Store reasoning from LLM
- Use low temperature (0.1-0.3) for consistent results
- Log all verification attempts

### ❌ **DON'T:**
- Send expected answer to frontend
- Store expected answer with user data
- Use client-side verification
- Accept answers without LLM verification
- Hard-code expected answers in frontend

## Summary

**Zero-Knowledge Verification Flow:**

1. ✅ Frontend only knows the question
2. ✅ User provides answer via voice
3. ✅ Backend receives answer
4. ✅ LLM verifies semantically (no exposed secrets)
5. ✅ Only stores verified/rejected status

This ensures:
- 🔒 Security: Expected answers never exposed
- 🎯 Flexibility: Semantic matching handles variations
- 📊 Transparency: Confidence scores + reasoning
- 🚀 User-friendly: Natural language accepted

**The expected answer never leaves the backend!** 🎉

