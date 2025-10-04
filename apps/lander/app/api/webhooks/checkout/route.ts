import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ElevenLabs webhook event for completed question/scenario
interface ElevenLabsWebhookEvent {
  event: string;
  timestamp: string;
  data: {
    agent_id?: string;
    conversation_id?: string;
    user_id?: string;
    message_id?: string;
    status?: string;
    error?: string;
    // Custom fields for your use case
    email?: string;
    answer?: string;
    question?: string;
    scenario?: string;
    [key: string]: any;
  };
}

// Webhook signature validation
function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch (error) {
    console.error("Error validating webhook signature:", error);
    return false;
  }
}

// Handle ElevenLabs agent events - focused on question/scenario completion
async function handleAgentEvent(event: ElevenLabsWebhookEvent) {
  console.log(`Processing ElevenLabs event: ${event.event}`, {
    timestamp: event.timestamp,
    data: event.data
  });

  switch (event.event) {
    case "question.completed":
    case "scenario.completed":
    case "conversation.ended":
      await handleQuestionCompleted(event.data);
      break;

    case "tool_call_completed":
      await handleToolCallCompleted(event.data);
      break;

    case "agent.error":
      await handleAgentError(event.data);
      break;

    default:
      console.log(`Event type ${event.event} - not processing`);
  }
}

// Event handlers
async function handleQuestionCompleted(data: any) {
  console.log("Question/Scenario completed:", {
    conversation_id: data.conversation_id,
    agent_id: data.agent_id,
    user_id: data.user_id,
    email: data.email,
    answer: data.answer,
    question: data.question,
    scenario: data.scenario
  });

  // Validate required fields
  if (!data.email || !data.answer) {
    console.error("Missing required fields: email or answer");
    throw new Error("Missing required fields: email or answer");
  }

  // TODO: Store the completed question/scenario response in your database
  // Example: await db.questionResponses.create({
  //   conversation_id: data.conversation_id,
  //   agent_id: data.agent_id,
  //   user_id: data.user_id,
  //   email: data.email,
  //   answer: data.answer,
  //   question: data.question,
  //   scenario: data.scenario,
  //   completed_at: new Date(),
  //   verified: true
  // });

  // TODO: Add any additional processing you need:
  // - Send confirmation email to user
  // - Update user profile with their response
  // - Trigger follow-up actions
  // - Send data to external systems
  // - Mark the verification session as completed

  console.log(`Successfully processed completed question for ${data.email}`);
  console.log(`User ${data.email} has completed voice verification with answer: "${data.answer}"`);
}

async function handleToolCallCompleted(data: any) {
  console.log("Tool call completed:", {
    tool_name: data.tool_name,
    tool_parameters: data.tool_parameters,
    conversation_id: data.conversation_id,
    agent_id: data.agent_id
  });

  // Extract parameters from the tool call
  const params = data.tool_parameters || {};

  // If this is the complete_verification tool
  if (data.tool_name === "complete_verification") {
    const email = params.user_email;
    const answer = params.user_answer;
    const question = params.verification_question;
    const sessionId = params.session_id;

    console.log("Verification completed via tool call:", {
      email,
      answer,
      question,
      sessionId
    });

    // Validate required fields
    if (!email || !answer || !question) {
      console.error("Missing required fields: email, answer, or question");
      throw new Error("Missing required fields: email, answer, or question");
    }

    // Zero-knowledge proof: Verify answer using LLM (Gemini Flash)
    // The correct answer is never sent to the frontend or stored with the user
    console.log("🔍 Verifying answer with Gemini Flash...");

    try {
      const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BALBOA_API_URL || 'http://localhost:3000'}/api/verify-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          userAnswer: answer,
          email,
          conversationId: data.conversation_id
        })
      });

      if (!verifyResponse.ok) {
        throw new Error(`Verification API returned ${verifyResponse.status}`);
      }

      const verificationResult = await verifyResponse.json();

      console.log("✅ Verification result:", {
        email,
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        reason: verificationResult.reason
      });

      // TODO: Store the verification result in your database
      // Example: await db.verifications.create({
      //   email,
      //   question,
      //   user_answer: answer,
      //   verified: verificationResult.verified,
      //   confidence: verificationResult.confidence,
      //   reason: verificationResult.reason,
      //   session_id: sessionId,
      //   conversation_id: data.conversation_id,
      //   agent_id: data.agent_id,
      //   completed_at: new Date()
      // });

      if (verificationResult.verified) {
        console.log(`✅ User ${email} PASSED voice verification`);
        console.log(`📝 Question: "${question}"`);
        console.log(`💬 Answer: "${answer}"`);
        console.log(`🎯 Confidence: ${(verificationResult.confidence * 100).toFixed(1)}%`);
      } else {
        console.log(`❌ User ${email} FAILED voice verification`);
        console.log(`📝 Question: "${question}"`);
        console.log(`💬 Answer: "${answer}"`);
        console.log(`🚫 Reason: ${verificationResult.reason}`);
      }

    } catch (error) {
      console.error("Error verifying answer with LLM:", error);
      // Don't throw - we still want to process the webhook
      // But log the error for monitoring
      console.error("Failed to verify answer, manual review may be required");
    }
  }
}

async function handleAgentError(data: any) {
  console.error("Agent error:", {
    agent_id: data.agent_id,
    conversation_id: data.conversation_id,
    error: data.error
  });
  // TODO: Log error in your database and potentially alert administrators
  // Example: await db.errors.create({
  //   agent_id: data.agent_id,
  //   conversation_id: data.conversation_id,
  //   error_message: data.error,
  //   timestamp: new Date()
  // });
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature validation
    const body = await request.text();

    // Get the webhook signature from headers
    const signature = request.headers.get("x-elevenlabs-signature");
    const webhookSecret = process.env.ELEVENLABS_WEBHOOK_SECRET;

    // Validate webhook signature if secret is configured
    if (webhookSecret && signature) {
      if (!validateWebhookSignature(body, signature, webhookSecret)) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else if (webhookSecret) {
      console.warn("Webhook secret configured but no signature provided");
    }

    // Parse the webhook payload
    const event: ElevenLabsWebhookEvent = JSON.parse(body);

    // Validate required fields
    if (!event.event || !event.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: event, timestamp" },
        { status: 400 }
      );
    }

    // For question/scenario completion events, validate email and answer
    if (["question.completed", "scenario.completed", "conversation.ended"].includes(event.event)) {
      if (!event.data.email || !event.data.answer) {
        return NextResponse.json(
          { error: "Missing required fields: email and answer" },
          { status: 400 }
        );
      }
    }

    // Process the event
    await handleAgentEvent(event);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Event ${event.event} processed successfully`,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing ElevenLabs webhook:", error);

    return NextResponse.json(
      {
        error: "Failed to process webhook",
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
      "Access-Control-Allow-Headers": "Content-Type, X-ElevenLabs-Signature",
    },
  });
}
