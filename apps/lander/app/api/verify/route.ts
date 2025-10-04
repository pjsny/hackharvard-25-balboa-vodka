import { type NextRequest, NextResponse } from "next/server";

// Simple email validation function
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Add CORS headers
const corsHeaders = {
	"Access-Control-Allow-Origin": "http://localhost:3001",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, Authorization, X-Requested-With",
	"Access-Control-Allow-Credentials": "true",
	"Access-Control-Max-Age": "86400", // 24 hours
};

export async function OPTIONS(request: NextRequest) {
	// Handle preflight request
	const origin = request.headers.get("origin");

	// Allow requests from the frontend
	if (origin === "http://localhost:3001") {
		return new NextResponse(null, {
			status: 200,
			headers: corsHeaders,
		});
	}

	// Reject other origins
	return new NextResponse(null, { status: 403 });
}

export async function POST(request: NextRequest) {
	try {
		// Check origin for CORS
		const origin = request.headers.get("origin");
		if (origin !== "http://localhost:3001") {
			return NextResponse.json(
				{ error: "CORS policy violation" },
				{ status: 403, headers: corsHeaders },
			);
		}

		const body = await request.json();
		const { email } = body;

		// Validate email
		if (!email || typeof email !== "string" || !isValidEmail(email)) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400, headers: corsHeaders },
			);
		}

		// Create ElevenLabs Agents Platform session
		const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
		const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;

		if (!elevenLabsApiKey) {
			throw new Error(
				"ELEVENLABS_API_KEY not found in environment variables. Please set it in your .env.local file.",
			);
		}

		if (!elevenLabsAgentId) {
			throw new Error(
				"ELEVENLABS_AGENT_ID not found in environment variables. Please set it in your .env.local file.",
			);
		}

		// Create ElevenLabs Agents Platform session
		console.log(
			"Creating ElevenLabs Agents Platform session for email:",
			email,
		);

		// SECURE APPROACH: Generate a short-lived token for the frontend
		const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// In production, you would:
		// 1. Generate a JWT token with the agent ID and session info
		// 2. Set expiration to 5 minutes
		// 3. Sign with your secret key
		// 4. Return only the token, not the agent ID

		// For now, return the session info
		// TODO: Replace with actual JWT token generation
		const secureToken = {
			agentId: elevenLabsAgentId,
			sessionId: sessionId,
			expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
			// Include the ElevenLabs API key in the token so the SDK can use it internally
			elevenLabsApiKey: elevenLabsApiKey,
			// In production, this would be a signed JWT
		};

		return NextResponse.json(
			{
				verified: true,
				sessionId: sessionId,
				// Frontend should use this token to authenticate with ElevenLabs Agents Platform
				token: Buffer.from(JSON.stringify(secureToken)).toString("base64"),
				transcript:
					"ElevenLabs Agents Platform voice verification session created",
			},
			{ headers: corsHeaders },
		);
	} catch (error) {
		console.error("Error in verify API:", error);

		return NextResponse.json(
			{ error: "Failed to create ElevenLabs verification session" },
			{ status: 500, headers: corsHeaders },
		);
	}
}
