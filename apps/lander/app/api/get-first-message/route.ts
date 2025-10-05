import { type NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { db } from "~/lib/db";
import { users, securityPairs } from "~/db/schema";
import { eq } from "drizzle-orm";

// Initialize Google AI with API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generate a natural, varied first message for the voice verification agent
 * Fetches the user's security question from the database
 * Uses Gemini Flash to create unique phrasings that feel authentic
 */

// Zod schema for request validation
const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// CORS headers - allow access from anywhere
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // 24 hours
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      console.error("❌ Validation failed:", validation.error.format());
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.format()
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { email } = validation.data;

    console.log("🔍 Fetching security question for email:", email);

    // 1. Find the user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error("❌ User not found:", email);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log("✅ User found:", { id: user.id, email: user.email });

    // 2. Get the user's security question/answer pair
    const [securityPair] = await db
      .select()
      .from(securityPairs)
      .where(eq(securityPairs.userId, user.id))
      .limit(1);

    if (!securityPair) {
      console.error("❌ No security pair found for user:", email);
      return NextResponse.json(
        { error: "No security question configured for this user" },
        { status: 404, headers: corsHeaders }
      );
    }

    const question = securityPair.question;
    console.log("🔐 Security question retrieved:", question);

    // 3. Use Gemini Flash to generate a natural first message
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
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
    });

    const firstMessage = text.trim();

    console.log("✅ Generated first message:", firstMessage);

    return NextResponse.json({
      success: true,
      firstMessage,
      timestamp: new Date().toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("❌ Error generating first message:", error);

    return NextResponse.json(
      {
        error: "Failed to generate first message",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

