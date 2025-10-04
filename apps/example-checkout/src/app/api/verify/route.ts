import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    try {
      // Try to proxy the request to the lander app's verify endpoint
      const verifyResponse = await fetch("http://localhost:3000/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:3001" // Add the origin header for CORS
        },
        body: JSON.stringify(body),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!verifyResponse.ok) {
        // Check if the response is HTML (error page) instead of JSON
        const contentType = verifyResponse.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(`Lander app returned HTML error page (status: ${verifyResponse.status}). Make sure the lander app is running on port 3000.`);
        }
        throw new Error(`HTTP error! status: ${verifyResponse.status}`);
      }

      // Check if response is actually JSON
      const contentType = verifyResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Lander app returned non-JSON response. Make sure the lander app is running correctly.");
      }

      const verifyData = await verifyResponse.json();
      return NextResponse.json(verifyData);
    } catch (proxyError) {
      console.warn("Lander app not available, using local verification:", proxyError);
      
      // Fallback: Create a local verification session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        verified: false,
        sessionId: sessionId,
        transcript: "Local verification session created - ready to start",
        status: "ready",
        // Add a flag to indicate this is a local session
        local: true,
      });
    }
  } catch (error) {
    console.error("Error in verify API:", error);

    return NextResponse.json(
      { error: "Failed to create verification session" },
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
