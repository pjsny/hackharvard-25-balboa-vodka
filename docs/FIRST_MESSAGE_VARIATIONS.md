# Agent First Message Variations

## Overview

The voice verification agent uses varied first messages to make the interaction feel more natural and less predictable. The agent will randomly select one of several phrasings when asking the verification question.

## Current Variations (Hardcoded)

The system currently uses 5 hardcoded variations:

1. **"This transaction seems suspicious. Could you quickly tell me {question}?"**
   - Direct and urgent
   - Sets clear context about fraud prevention

2. **"We've detected unusual activity. For security purposes, {question}?"**
   - Emphasizes security detection
   - Professional tone

3. **"To verify this transaction, I need to ask: {question}?"**
   - Clear verification purpose
   - Straightforward approach

4. **"Before we proceed, can you help me verify something? {question}?"**
   - Polite and collaborative
   - Less alarming tone

5. **"For fraud prevention, please answer this quick question: {question}?"**
   - Emphasizes fraud prevention
   - Sets expectation of quick interaction

## How It Works

### In the Code

```typescript
const generateFirstMessage = (q?: string): string => {
  const variations = [
    (q: string) => `This transaction seems suspicious. Could you quickly tell me ${q.toLowerCase()}?`,
    (q: string) => `We've detected unusual activity. For security purposes, ${q.toLowerCase()}?`,
    (q: string) => `To verify this transaction, I need to ask: ${q.toLowerCase()}?`,
    (q: string) => `Before we proceed, can you help me verify something? ${q.toLowerCase()}?`,
    (q: string) => `For fraud prevention, please answer this quick question: ${q.toLowerCase()}?`,
  ];

  // Random selection
  const selectedIndex = Math.floor(Math.random() * variations.length);
  const selectedVariation = variations[selectedIndex];

  return q ? selectedVariation(q) : "Default message";
};
```

### Example Usage

```typescript
<VoiceVerificationDialog
  question="What city were you born in"
  email="user@example.com"
  // Agent will say ONE of these randomly:
  // - "This transaction seems suspicious. Could you quickly tell me what city were you born in?"
  // - "We've detected unusual activity. For security purposes, what city were you born in?"
  // - etc.
/>
```

## Examples with Real Questions

### Question: "What is your mother's maiden name"

**Possible First Messages:**
1. "This transaction seems suspicious. Could you quickly tell me what is your mother's maiden name?"
2. "We've detected unusual activity. For security purposes, what is your mother's maiden name?"
3. "To verify this transaction, I need to ask: what is your mother's maiden name?"
4. "Before we proceed, can you help me verify something? what is your mother's maiden name?"
5. "For fraud prevention, please answer this quick question: what is your mother's maiden name?"

### Question: "What was the name of your first pet"

**Possible First Messages:**
1. "This transaction seems suspicious. Could you quickly tell me what was the name of your first pet?"
2. "We've detected unusual activity. For security purposes, what was the name of your first pet?"
3. "To verify this transaction, I need to ask: what was the name of your first pet?"
4. "Before we proceed, can you help me verify something? what was the name of your first pet?"
5. "For fraud prevention, please answer this quick question: what was the name of your first pet?"

## Future Enhancement: LLM-Generated Variations

### Option 1: Generate on Server (Recommended)

Create an API endpoint that generates variations using Gemini:

```typescript
// /api/generate-first-message/route.ts
export async function POST(request: NextRequest) {
  const { question } = await request.json();

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    prompt: `Generate a natural, professional first message for a voice verification agent.

    Context: This is for fraud prevention in e-commerce transactions.
    Question to ask: "${question}"

    Create a message that:
    - Mentions fraud/security concern briefly
    - Naturally leads into the question
    - Is professional but friendly
    - Is 1-2 sentences max

    Examples:
    - "This transaction seems suspicious. Could you quickly tell me ${question}?"
    - "We've detected unusual activity. For security purposes, ${question}?"

    Generate ONE variation (just the message, no quotes):`,
    temperature: 0.8, // Higher for variety
  });

  return NextResponse.json({ firstMessage: text.trim() });
}
```

### Option 2: Generate on Client (Less Secure)

```typescript
// In component
const [firstMessage, setFirstMessage] = useState<string>("");

useEffect(() => {
  if (question) {
    fetch('/api/generate-first-message', {
      method: 'POST',
      body: JSON.stringify({ question })
    })
    .then(r => r.json())
    .then(data => setFirstMessage(data.firstMessage));
  }
}, [question]);
```

### Option 3: Pre-generate and Cache

```typescript
// Generate 100 variations at build time
// Store in database or JSON file
// Randomly select from cache at runtime
```

## Best Practices

### ✅ **DO:**
- Keep messages professional yet friendly
- Mention fraud/security context
- Keep it brief (1-2 sentences)
- Make question flow naturally
- Vary the phrasing to feel authentic

### ❌ **DON'T:**
- Sound too robotic or scripted
- Be overly alarming or scary
- Use complex language
- Make messages too long
- Use the same variation every time

## Testing Variations

```typescript
// Test all variations
const question = "What is your mother's maiden name";

for (let i = 0; i < 10; i++) {
  const message = generateFirstMessage(question);
  console.log(`Variation ${i + 1}:`, message);
}
```

## Configuration

### Add More Variations

Edit `BalboaVerificationPopup.tsx`:

```typescript
const variations = [
  // Existing variations...

  // Add new ones:
  (q: string) => `Quick security check: ${q.toLowerCase()}?`,
  (q: string) => `I need to verify your identity. ${q.toLowerCase()}?`,
  (q: string) => `To protect your account, ${q.toLowerCase()}?`,
];
```

### Remove Variations

Simply comment out or delete unwanted variations from the array.

### A/B Testing

Track which variations lead to better completion rates:

```typescript
const selectedIndex = Math.floor(Math.random() * variations.length);

// Log for analytics
console.log('First message variation:', selectedIndex);

// Send to analytics
analytics.track('verification_started', {
  variation: selectedIndex,
  question: question
});
```

## Summary

**Current Implementation:**
- ✅ 5 hardcoded variations
- ✅ Random selection
- ✅ Professional tone
- ✅ Natural phrasing

**Future Enhancement:**
- 🔄 LLM-generated variations (more natural)
- 🔄 A/B testing (optimize for conversion)
- 🔄 Localization (multiple languages)
- 🔄 Context-aware (vary by risk level)

The hardcoded variations provide a good balance between naturalness and performance! 🎉

