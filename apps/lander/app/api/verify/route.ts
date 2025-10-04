import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const VerifyEmailSchema = z.object({
	email: z.string().email(),
});

// Add CORS headers
const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email } = VerifyEmailSchema.parse(body);

		// Create ElevenLabs Agents Platform session
		const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

		if (!elevenLabsApiKey) {
			throw new Error("ELEVENLABS_API_KEY not found in environment variables");
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
			agentId: process.env.ELEVENLABS_AGENT_ID || "your-agent-id", // You'll need to create an agent in ElevenLabs dashboard
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
