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
	"Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
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
			headers: corsHeaders
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
				{ status: 403, headers: corsHeaders }
			);
		}

		const body = await request.json();
		const { email, phrase } = body;

		// Validate email
		if (!email || typeof email !== "string" || !isValidEmail(email)) {
			return NextResponse.json(
				{ error: "Invalid email address" },
				{ status: 400, headers: corsHeaders },
			);
		}

		// Validate phrase
		if (!phrase || typeof phrase !== "string") {
			return NextResponse.json(
				{ error: "Phrase is required" },
				{ status: 400, headers: corsHeaders },
			);
		}

		// TODO: Replace with your actual validation logic
		// For now, using a simple example validation
		const expectedPhrase = "Balboa verification complete";
		const isValidPhrase = phrase.toLowerCase().trim() === expectedPhrase.toLowerCase();

		// TODO: Replace with your actual email validation logic
		// For now, using a simple example validation
		const validEmails = [
			"user@example.com",
			"test@balboa.com",
			"admin@example.com"
		];
		const isEmailValid = validEmails.includes(email.toLowerCase());

		if (isValidPhrase && isEmailValid) {
			return NextResponse.json(
				{
					authenticated: true,
					message: "Authentication successful"
				},
				{ headers: corsHeaders }
			);
		} else {
			return NextResponse.json(
				{
					authenticated: false,
					message: "Invalid email or phrase"
				},
				{ status: 401, headers: corsHeaders }
			);
		}

	} catch (error) {
		console.error("Error in validate API:", error);

		return NextResponse.json(
			{
				error: "Failed to validate email and phrase",
				authenticated: false
			},
			{ status: 500, headers: corsHeaders },
		);
	}
}
