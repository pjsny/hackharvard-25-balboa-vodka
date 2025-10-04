import Vapi from "@vapi-ai/web";
import { createBalboaError } from "./errors";
import type { BalboaConfig, VapiCallResult } from "./types";

/**
 * VAPI integration for voice conversations
 */
export class BalboaVapiIntegration {
	private vapi: Vapi;
	private config: BalboaConfig;

	constructor(config: BalboaConfig) {
		this.config = config;
		this.vapi = new Vapi(config.apiKey || "mock-vapi-key");
	}

	/**
	 * Start a voice verification conversation
	 */
	async startVerification(sessionId: string): Promise<VapiCallResult> {
		try {
			// Configure the assistant for Balboa verification
			const assistantConfig = {
				model: {
					provider: "openai" as const,
					model: "gpt-4" as const,
					systemMessage: this.getSystemMessage(),
				},
				voice: {
					provider: "elevenlabs" as const,
					voiceId: "rachel", // Professional, clear voice
				},
				transcriber: {
					provider: "deepgram" as const,
					model: "nova-2",
				},
				// Add session metadata
				metadata: {
					sessionId,
					environment: this.config.environment || "production",
				},
			} as any;

			// Start the conversation
			const call = await this.vapi.start(assistantConfig);

			// Wait for call completion
			return new Promise((resolve, reject) => {
				this.vapi.on("callEnded" as any, (callData: any) => {
					resolve({
						callId: callData.id,
						recording: callData.recording || "",
						transcript: callData.transcript || "",
						summary: callData.summary,
						duration: callData.duration,
					});
				});

				this.vapi.on("error" as any, (error: any) => {
					reject(
						createBalboaError(
							`VAPI call failed: ${error.message}`,
							"VAPI_ERROR",
							error,
						),
					);
				});

				// Set timeout
				setTimeout(() => {
					reject(createBalboaError("VAPI call timed out", "TIMEOUT"));
				}, this.config.timeout || 30000);
			});
		} catch (error) {
			throw createBalboaError(
				`Failed to start VAPI conversation: ${getErrorMessage(error)}`,
				"VAPI_ERROR",
				error instanceof Error ? error : undefined,
			);
		}
	}

	/**
	 * Get the system message for the assistant
	 */
	private getSystemMessage(): string {
		return `
      You are Balboa, a professional voice verification assistant for e-commerce fraud prevention.

      Your task:
      1. Greet the user warmly and professionally
      2. Explain that you need to verify their identity
      3. Ask them to say: "Balboa verification complete"
      4. Confirm you heard them correctly
      5. Thank them and end the call

      Guidelines:
      - Keep the conversation under 30 seconds
      - Be professional but friendly
      - Speak clearly and at a moderate pace
      - If you don't hear the phrase clearly, ask them to repeat it once
      - End the call immediately after verification

      Do not ask for any personal information or engage in small talk.
    `.trim();
	}

	/**
	 * Stop the current call
	 */
	async stopCall(): Promise<void> {
		try {
			await this.vapi.stop();
		} catch (error) {
			// Ignore errors when stopping
			console.warn("Error stopping VAPI call:", error);
		}
	}

	/**
	 * Check if a call is currently active
	 */
	isCallActive(): boolean {
		return (this.vapi as any).isCallActive?.() || false;
	}
}

/**
 * Helper function to get error message
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "Unknown error";
}
