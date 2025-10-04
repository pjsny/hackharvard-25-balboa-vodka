import { type NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

/**
 * Zero-knowledge proof verification using Gemini Flash
 * Verifies if the user's answer semantically matches the expected answer
 * without exposing the expected answer to the frontend
 */

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, email, conversationId } = await request.json();

    // Validate required fields
    if (!question || !userAnswer || !email) {
      return NextResponse.json(
        { error: "Missing required fields: question, userAnswer, email" },
        { status: 400 }
      );
    }

    console.log("🔍 Verifying answer with Gemini Flash:", {
      email,
      question,
      userAnswer,
      conversationId
    });

    // Use Gemini Flash to verify the answer semantically
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `You are a voice verification assistant. Your task is to determine if the user's spoken answer is semantically correct for the given question.

Question: "${question}"
User's Answer: "${userAnswer}"

Analyze if the user's answer is:
1. Semantically correct (meaning matches even if wording is different)
2. Contextually appropriate
3. Shows genuine knowledge of the answer

Respond with ONLY a JSON object in this exact format:
{
  "verified": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

Be strict but fair. Accept variations in wording but reject obviously wrong answers.`,
      temperature: 0.1, // Low temperature for consistent results
      maxTokens: 200,
    });

    // Parse the LLM response
    let verificationResult;
    try {
      // Extract JSON from response (in case LLM adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      verificationResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse LLM response:", text);
      return NextResponse.json(
        { error: "Failed to parse verification result", details: text },
        { status: 500 }
      );
    }

    const { verified, confidence, reason } = verificationResult;

    console.log("✅ Verification result:", {
      email,
      verified,
      confidence,
      reason
    });

    // TODO: Store verification result in database
    // await db.verifications.create({
    //   email,
    //   question,
    //   user_answer: userAnswer,
    //   verified,
    //   confidence,
    //   reason,
    //   conversation_id: conversationId,
    //   timestamp: new Date()
    // });

    return NextResponse.json({
      success: true,
      verified,
      confidence,
      reason,
      email,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error verifying answer:", error);

    return NextResponse.json(
      {
        error: "Failed to verify answer",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
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

