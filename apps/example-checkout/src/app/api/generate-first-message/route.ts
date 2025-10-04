import { type NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint for generate-first-message
 * Forwards requests to the lander app's generate-first-message endpoint
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question } = body;

    // Validate question
    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Invalid question" },
        { status: 400 }
      );
    }

    try {
      // Proxy the request to the lander app's endpoint
      const generateResponse = await fetch("http://localhost:3000/api/generate-first-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:3001"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!generateResponse.ok) {
        const contentType = generateResponse.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(`Lander app returned HTML error page (status: ${generateResponse.status}). Make sure the lander app is running on port 3000.`);
        }
        throw new Error(`HTTP error! status: ${generateResponse.status}`);
      }

      const contentType = generateResponse.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Lander app returned non-JSON response. Make sure the lander app is running correctly.");
      }

      const generateData = await generateResponse.json();
      return NextResponse.json(generateData);
    } catch (proxyError) {
      console.warn("Lander app not available, using fallback message:", proxyError);

      // Fallback: Generate a simple first message locally
      const fallbackMessage = `This transaction seems suspicious. Could you quickly tell me ${question.toLowerCase()}?`;

      return NextResponse.json({
        success: true,
        firstMessage: fallbackMessage,
        fallback: true,
        local: true,
      });
    }
  } catch (error) {
    console.error("Error in generate-first-message API:", error);

    return NextResponse.json(
      { error: "Failed to generate first message" },
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

