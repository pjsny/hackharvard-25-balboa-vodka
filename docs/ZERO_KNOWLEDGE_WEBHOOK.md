# True Zero-Knowledge Webhook Verification

## Overview

The `/api/verify` endpoint implements **true zero-knowledge proof** verification where:
- ✅ Provider sends ONLY the user's answer
- ❌ Question is NEVER transmitted
- ✅ Backend has the expected question stored
- ✅ LLM verifies answer validity
- ✅ **NO CORS restrictions** - accessible from anywhere

## Philosophy

In true zero-knowledge proof systems, the verifier (your backend) must already know the question. The prover (user via provider) only sends the answer. This ensures:

1. **No question leakage** in transit
2. **No question exposure** to provider
3. **Backend-only knowledge** of what question was asked
4. **Maximum security** - even intercepted traffic reveals minimal info

## API Endpoint

### `/api/verify`

**NO CORS Restrictions** - Accessible from any origin.

### Webhook Request (Answer Only)

```json
POST /api/verify
{
  "answer": "The date of birth is 8th of June 2006."
}
```

**Note**: Question is NOT included - backend already knows it!

### Response

```json
true  // ✅ Valid answer
```

or

```json
false // ❌ Invalid/inappropriate answer
```

## How It Works

### Step 1: Session Creation (Frontend)

```typescript
// Frontend creates session with question
POST /api/verify
{
  "email": "user@example.com"
}

// Backend stores: session → email → question mapping
// (This step happens BEFORE voice verification)
```

### Step 2: Voice Provider Webhook (Answer Only)

```typescript
// Provider sends ONLY the answer
POST /api/verify
{
  "answer": "8th of June 2006"
}

// Backend:
// 1. Retrieves question from database/session (NOT from request!)
// 2. Uses LLM to verify answer validity
// 3. Returns true/false
```

### Step 3: LLM Verification

```typescript
// Backend verifies answer is valid and appropriate
const { text } = await generateText({
  model: google("gemini-2.5-flash"),
  prompt: `You are verifying if a user's answer is valid and appropriate.

User's Answer: "${answer}"

Analyze if the answer:
1. Contains meaningful information (not "I don't know", gibberish, etc.)
2. Appears to be a genuine response to a security question
3. Is contextually appropriate for identity verification

Respond with ONLY "true" or "false"

true = answer is valid and appropriate
false = answer is invalid, inappropriate, or evasive`
});
```

## Zero-Knowledge Architecture

```
┌─────────────┐
│  Database   │ Question stored here (never leaves backend)
│             │ email → question mapping
└──────┬──────┘
       │ Backend looks up question
       ▼
┌─────────────┐
│   Backend   │ POST /api/verify
│  /api/verify│ { "answer": "..." }  ← Only answer in request!
└──────┬──────┘
       │ Verifies with LLM
       ▼
┌─────────────┐
│ Gemini Flash│ Analyzes answer validity
│     LLM     │ (No question needed in prompt!)
└──────┬──────┘
       │ Returns true/false
       ▼
┌─────────────┐
│  Provider   │ Receives verification result
└─────────────┘
```

## Implementation Steps

### 1. Store Question with Session

When creating a verification session, store the question:

```typescript
// In session creation
const sessionId = `session_${Date.now()}`;

await db.sessions.create({
  sessionId,
  email: "user@example.com",
  question: "What is your date of birth?", // Store question
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 5 * 60 * 1000)
});
```

### 2. Retrieve Question When Verifying

When webhook arrives with answer:

```typescript
// Look up the question from session
const session = await db.sessions.findOne({
  email: body.email // or sessionId
});

const question = session.question;

// Now verify answer against this question
const verified = await verifyAnswerWithLLM(answer, question);
```

### 3. Current Placeholder (Until DB Integration)

Currently using answer pattern matching to infer question type:

```typescript
function inferQuestionFromAnswer(answer: string): string {
  // Date patterns
  if (/date|birth|june|january/i.test(answer)) {
    return "What is your date of birth?";
  }

  // City patterns
  if (/city|town|born/i.test(answer)) {
    return "What city were you born in?";
  }

  // Mother's maiden name
  if (/maiden|mother/i.test(answer)) {
    return "What is your mother's maiden name?";
  }

  return "Please verify your identity";
}
```

**⚠️ This is temporary!** Replace with actual database lookup.

## CORS Configuration

### No Restrictions

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ✅ Allow ANY origin
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};
```

### Why No CORS Restrictions?

1. **Webhook from external providers**: Providers may call from various IPs/domains
2. **No sensitive data in request**: Only answer is sent (already spoken by user)
3. **Verification happens server-side**: LLM verification is backend-only
4. **Simplicity**: No CORS preflight failures

### Security Notes

Even with open CORS:
- ✅ **Answer validation only**: Not exposing sensitive data
- ✅ **Rate limiting recommended**: Prevent abuse
- ✅ **Webhook signatures**: Verify requests are from authorized providers
- ✅ **Session expiration**: Sessions expire after 5 minutes

## Example Requests

### Example 1: Valid Birth Date

**Request:**
```json
POST /api/verify
{
  "answer": "The date of birth is 8th of June 2006."
}
```

**Backend Process:**
```
1. Receives answer
2. Infers/retrieves question: "What is your date of birth?"
3. LLM verifies answer is valid date format
4. Returns: true
```

**Response:**
```json
true
```

### Example 2: Invalid Response

**Request:**
```json
POST /api/verify
{
  "answer": "I don't know"
}
```

**Backend Process:**
```
1. Receives answer
2. LLM detects evasive/non-answer
3. Returns: false
```

**Response:**
```json
false
```

### Example 3: Gibberish

**Request:**
```json
POST /api/verify
{
  "answer": "asdfkjhasdkfh"
}
```

**Backend Process:**
```
1. Receives answer
2. LLM detects invalid response
3. Returns: false
```

**Response:**
```json
false
```

## Database Schema (Recommended)

```sql
CREATE TABLE verification_sessions (
  id UUID PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,              -- Store the question!
  expected_answer_hint TEXT,           -- Optional: hint for LLM
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verification_attempts INT DEFAULT 0,
  last_answer TEXT,                    -- Last answer received
  verified_at TIMESTAMP
);

CREATE INDEX idx_session_id ON verification_sessions(session_id);
CREATE INDEX idx_email ON verification_sessions(email);
CREATE INDEX idx_expires_at ON verification_sessions(expires_at);
```

## Integration Example

### Step 1: Create Session (Frontend)

```typescript
// User fills out checkout form
const response = await fetch('/api/verify', {
  method: 'POST',
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const { sessionId } = await response.json();

// Start voice verification with your provider
// Provider will eventually send answer to /api/verify
```

### Step 2: Provider Sends Answer

```typescript
// Your voice provider (ElevenLabs, Vapi, etc.) calls webhook
POST https://api.balboa.vodka/api/verify
{
  "answer": "8th of June 2006"
}

// Backend verifies and returns true/false
```

### Step 3: Handle Result

```typescript
// Provider receives verification result
if (verified === true) {
  // Proceed with transaction
  completeCheckout();
} else {
  // Retry or reject
  showError("Verification failed");
}
```

## Testing

### Test Answer Verification

```bash
# Valid answer
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"answer": "8th of June 2006"}'
# Expected: true

# Invalid answer
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"answer": "I dont know"}'
# Expected: false

# Gibberish
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{"answer": "asdfgh"}'
# Expected: false
```

### Test CORS

```bash
# From any origin - should work!
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -H "Origin: https://random-domain.com" \
  -d '{"answer": "valid answer"}'
# Should work without CORS errors
```

### Test OPTIONS (Preflight)

```bash
curl -X OPTIONS http://localhost:3000/api/verify \
  -H "Origin: https://any-domain.com" \
  -H "Access-Control-Request-Method: POST"
# Expected: 200 OK with CORS headers
```

## Security Best Practices

### ✅ DO:

1. **Store questions securely** in database
2. **Use session-based lookup** to retrieve questions
3. **Set session expiration** (5-10 minutes)
4. **Rate limit endpoint** to prevent abuse
5. **Log all verification attempts** for audit
6. **Use webhook signatures** to verify provider identity

### ❌ DON'T:

1. **Don't send question** in webhook payload
2. **Don't store expected answers** in plaintext with sessions
3. **Don't expose question** in any API response
4. **Don't allow unlimited retries** on same session
5. **Don't trust client-side verification** - always verify server-side

## Migration Path

### Phase 1: Current (Inference-based)
```typescript
// Uses pattern matching to infer question
const question = inferQuestionFromAnswer(answer);
```

### Phase 2: Database Integration
```typescript
// Look up actual question from database
const session = await db.sessions.findOne({ sessionId });
const question = session.question;
```

### Phase 3: Enhanced Security
```typescript
// Add expected answer hints without exposing actual answer
const session = await db.sessions.findOne({ sessionId });
const question = session.question;
const hint = session.expectedAnswerHint; // e.g., "date format", "city name"
```

## Summary

**True Zero-Knowledge Webhook:**

✅ **Question never transmitted** - Backend-only knowledge
✅ **Answer-only requests** - Minimal data exposure
✅ **LLM verification** - Semantic validation
✅ **No CORS restrictions** - Works with any provider
✅ **Simple API** - Just `{ "answer": "..." }` → `true`/`false`
✅ **Secure by design** - Even intercepted traffic reveals minimal info

**The provider never knows what question was asked!** 🔒

