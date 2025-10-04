import { type NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Generate a natural, varied first message for the voice verification agent
 * Uses Gemini Flash to create unique phrasings that feel authentic
 */

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    // Validate required fields
    if (!question) {
      return NextResponse.json(
        { error: "Missing required field: question" },
        { status: 400 }
      );
    }

    console.log("🎤 Generating first message for question:", question);

    // Use Gemini Flash to generate a natural first message
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are writing the first message for a voice fraud prevention agent in an e-commerce transaction.

Context:
- A potentially fraudulent transaction has been detected
- The agent needs to verify the customer's identity via voice
- The conversation should be professional but not alarming
- Keep it brief and natural

Question to ask: "${question}"

Create ONE natural opening message that:
1. Briefly mentions fraud prevention or security (1 sentence)
2. Naturally leads into asking the question
3. Sounds human and conversational
4. Is professional but friendly
5. Total length: 1-2 sentences maximum

Examples of good messages:
- "This transaction seems suspicious. Could you quickly tell me ${question.toLowerCase()}?"
- "We've detected unusual activity. For security purposes, ${question.toLowerCase()}?"
- "Before we proceed, I need to verify something. ${question.toLowerCase()}?"

DO NOT:
- Use quotes or markdown
- Add explanations or notes
- Be overly formal or robotic
- Make it too long

Generate ONLY the message text:`,
      temperature: 0.8, // Higher temperature for natural variety
      maxTokens: 100,
    });

    const firstMessage = text.trim();

    console.log("✅ Generated first message:", firstMessage);

    return NextResponse.json({
      success: true,
      firstMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error generating first message:", error);

    // Fallback to a default message on error
    const fallbackMessage = `This transaction seems suspicious. Could you quickly tell me ${
      request.body ? JSON.parse(await request.text()).question?.toLowerCase() : "verify your identity"
    }?`;

    return NextResponse.json(
      {
        success: true,
        firstMessage: fallbackMessage,
        fallback: true,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 200 } // Still return 200 with fallback
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

