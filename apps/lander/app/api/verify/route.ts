import { type NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

// Simple email validation function
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

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
		const { email, answer } = body;

		// CASE 1: Webhook from provider - verify answer
		// Provider sends ONLY the answer, backend has the question stored/known
		if (answer) {
			console.log("🔍 Webhook verification request:", { answer });

			try {
				// TODO: Retrieve the actual question from your database/session
				// For now, we'll use a stored question or expected format
				// In production, you would:
				// 1. Look up the question from session/database using email or session ID
				// 2. Use that question for verification

				// Example: const question = await db.sessions.findOne({ email }).question;

				// For now, we'll infer the question type from the answer format
				// This is a placeholder - replace with your actual logic
				const question = inferQuestionFromAnswer(answer);

				console.log("📋 Inferred question for verification:", question);

				// Use Gemini Flash to verify the answer
				const { text } = await generateText({
					model: google("gemini-1.5-flash"),
					prompt: `You are verifying if a user's answer is valid and appropriate.

User's Answer: "${answer}"

Analyze if the answer:
1. Contains meaningful information (not "I don't know", gibberish, etc.)
2. Appears to be a genuine response to a security question
3. Is contextually appropriate for identity verification

Respond with ONLY "true" or "false" (no quotes, no explanation, just the boolean value).

true = answer is valid and appropriate
false = answer is invalid, inappropriate, or evasive`,
					temperature: 0.1,
					maxTokens: 10,
				});

				const verified = text.trim().toLowerCase() === "true";

				console.log(`✅ Verification result: ${verified}`, {
					answer,
					llmResponse: text
				});

				// Return simple true/false
				return NextResponse.json(verified, {
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

		// CASE 2: Session creation from frontend
		if (email) {
			// Validate email
			if (typeof email !== "string" || !isValidEmail(email)) {
				return NextResponse.json(
					{ error: "Invalid email address" },
					{ status: 400, headers: corsHeaders },
				);
			}

			// Create verification session
			console.log("Creating verification session for email:", email);

			const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const secureToken = {
				sessionId: sessionId,
				expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
			};

			// TODO: Store the question in database with the session
			// await db.sessions.create({
			//   sessionId,
			//   email,
			//   question: "What is your date of birth?", // Store the actual question
			//   createdAt: new Date()
			// });

			return NextResponse.json(
				{
					verified: false,
					sessionId: sessionId,
					token: Buffer.from(JSON.stringify(secureToken)).toString("base64"),
					transcript: "Voice verification session created - ready to start",
					status: "ready",
				},
				{ headers: corsHeaders },
			);
		}

		// Neither email nor answer provided
		return NextResponse.json(
			{ error: "Missing required field: email or answer" },
			{ status: 400, headers: corsHeaders },
		);

	} catch (error) {
		console.error("Error in verify API:", error);

		return NextResponse.json(
			{ error: "Failed to process request" },
			{ status: 500, headers: corsHeaders },
		);
	}
}

// Helper function to infer question type from answer format
// This is a placeholder - in production, retrieve the actual question from database
function inferQuestionFromAnswer(answer: string): string {
	// Normalize answer for pattern matching
	const normalized = answer.toLowerCase();

	// Date patterns
	if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b|\bdate of birth\b/i.test(answer)) {
		return "What is your date of birth?";
	}

	// City/location patterns
	if (/\bcity\b|\btown\b|\bborn in\b|\blive in\b/i.test(answer)) {
		return "What city were you born in?";
	}

	// Name patterns (mother's maiden name, first pet, etc.)
	if (/\bmaiden name\b|\bmother'?s\b/i.test(answer)) {
		return "What is your mother's maiden name?";
	}

	if (/\bpet\b|\bdog\b|\bcat\b/i.test(answer)) {
		return "What was the name of your first pet?";
	}

	// Default fallback
	return "Please verify your identity";
}
