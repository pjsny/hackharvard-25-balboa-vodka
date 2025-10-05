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

// Zod schemas for validation
const webhookVerificationSchema = z.object({
	answer: z.string().min(1, "Answer cannot be empty"),
	email: z.string().email("Invalid email address").optional(), // Optional - will be extracted from context if missing
	user_email: z.string().email("Invalid email address").optional(), // Alternative field name from ElevenLabs
	conversation_id: z.string().optional(),
});

const sessionCreationSchema = z.object({
	email: z.string().email("Invalid email address"),
});

// Combined schema that accepts either verification or session creation
const requestSchema = z.union([
	webhookVerificationSchema,
	sessionCreationSchema,
]);

// Add CORS headers - allow access from anywhere
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
	"Access-Control-Max-Age": "86400", // 24 hours
};

export async function OPTIONS(request: NextRequest) {
	// Handle preflight request - allow all origins
	return new NextResponse(null, {
		status: 200,
		headers: corsHeaders,
	});
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();


    console.log("🔍 Webhook verification request:", body);

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

		const data = validation.data;

		// CASE 1: Webhook from provider - verify answer
		// Provider sends answer and email (email might be in different fields)
		if ("answer" in data) {
			// Extract email from either 'email' or 'user_email' field
			const userEmail = data.email || data.user_email;

			console.log("🔍 Webhook verification request:", {
				answer: data.answer,
				email: userEmail,
				conversation_id: data.conversation_id,
				raw_data: data
			});

			// Email is required for webhook verification
			if (!userEmail) {
				console.error("❌ Email is required for verification. Please configure your ElevenLabs agent to send user_email.");
				console.error("📋 Received data:", data);
				return NextResponse.json(
					{
						error: "Email is required for verification",
						hint: "Configure your ElevenLabs agent to include {{user_email}} in the webhook payload"
					},
					{ status: 400, headers: corsHeaders }
				);
			}

			try {
				// 1. Find the user by email
				const [user] = await db
					.select()
					.from(users)
					.where(eq(users.email, userEmail))
					.limit(1);

				if (!user) {
					console.error("❌ User not found:", userEmail);
					return NextResponse.json(false, {
						headers: {
							...corsHeaders,
							"Content-Type": "application/json"
						}
					});
				}

				// 2. Get the user's security answer
				const [securityPair] = await db
					.select()
					.from(securityPairs)
					.where(eq(securityPairs.userId, user.id))
					.limit(1);

				if (!securityPair) {
					console.error("❌ No security pair found for user:", userEmail);
					return NextResponse.json(false, {
						headers: {
							...corsHeaders,
							"Content-Type": "application/json"
						}
					});
				}

				const expectedAnswer = securityPair.answer;
				console.log("🔐 Expected answer retrieved from database");

				// 3. Use Gemini Flash to verify the answer
				const { text } = await generateText({
					model: google("gemini-2.5-flash"),
					prompt: `You are verifying whether these two things are equivalent. The user is giving an answer to a question, and verify that this answer is the same answer as the expected answer. Allow some room for error, as shown below, but make sure the answer is close to the expected answer and what a human would say is the same.

User's Answer: "${data.answer}"
Expected Answer: "${expectedAnswer}"

## EXAMPLE OF WHAT IS EXPECTED

User's Answer: "Red"
Expected Answer: "Red"
=> true

User's Answer: "I was 12 or 11 years old. it was when i was young"
Expected Answer: "12 years old"
=> true

User's Answer: "Bought it last week"
Expected Answer: "Bought it 1000 years ago"
=> false

##

Respond with ONLY "true" or "false" (no quotes, no explanation, just the boolean value).

true = answer is valid and appropriate
false = answer is invalid, inappropriate, or evasive`,
					temperature: 0.1,
				});

				const verified = text.trim().toLowerCase() === "true";

				console.log(`✅ Verification result: ${verified}`, {
					answer: data.answer,
					email: userEmail,
					llmResponse: text
				});

				// Return simple true/false
				return NextResponse.json({verified}, {
					headers: {
						...corsHeaders,
						"Content-Type": "application/json"
					}
				});

			} catch (error) {
				console.error("❌ Error verifying answer with LLM:", error);
				// On error, return false for safety
				return NextResponse.json(false, {
					headers: {
						...corsHeaders,
						"Content-Type": "application/json"
					}
				});
			}
		}

		// Should never reach here due to Zod validation
		return NextResponse.json(
			{ error: "Invalid request format" },
			{ status: 400, headers: corsHeaders },
		);

	} catch (error) {
		console.error("Error in verify API:", error);

		return NextResponse.json(
			{
				error: "Failed to process request",
				message: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500, headers: corsHeaders },
		);
	}
}
