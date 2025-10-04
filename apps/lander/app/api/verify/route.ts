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

		// Create verification session
		console.log("Creating verification session for email:", email);

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
			sessionId: sessionId,
			expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
			// In production, this would be a signed JWT
		};

		return NextResponse.json(
			{
				verified: true,
				sessionId: sessionId,
				// Frontend should use this token for verification
				token: Buffer.from(JSON.stringify(secureToken)).toString("base64"),
				transcript: "Voice verification session created",
			},
			{ headers: corsHeaders },
		);
	} catch (error) {
		console.error("Error in verify API:", error);

		return NextResponse.json(
			{ error: "Failed to create verification session" },
			{ status: 500, headers: corsHeaders },
		);
	}
}
