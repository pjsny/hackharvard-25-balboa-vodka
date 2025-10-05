import { createBalboaError } from "./errors";
import type { BalboaConfig, ElevenLabsCallResult } from "./types";

/**
 * ElevenLabs integration for voice conversations
 */
export class BalboaElevenLabsIntegration {
	private config: BalboaConfig;
	private conversation: any = null;
	private isActive: boolean = false;

	constructor(config: BalboaConfig) {
		this.config = config;
	}

	/**
	 * Start a voice verification conversation using ElevenLabs
	 * Note: This method should be called from within a React component that uses the useConversation hook
	 */
	async startVerification(sessionId: string, conversation: any, customVariables?: Record<string, any>): Promise<ElevenLabsCallResult> {
		try {
			// Request microphone access
			await navigator.mediaDevices.getUserMedia({ audio: true });

			this.conversation = conversation;
			this.isActive = true;

			// Start the conversation session
			const sessionConfig = {
				agentId: this.config.agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
				connectionType: 'webrtc', // Use WebRTC for better audio quality
				userId: sessionId,
				// Include custom variables if provided
				...(customVariables && {
					dynamicVariables: customVariables
				})
			};
			
			const conversationId = await this.conversation.startSession(sessionConfig);

			// Wait for conversation completion
			return new Promise((resolve, reject) => {
				let transcript = '';
				let summary = '';
				let duration = 0;
				const startTime = Date.now();

				// Set up event listeners
				const messageHandler = (message: any) => {
					if (message.type === 'user' && message.content) {
						transcript += message.content + ' ';
					}
					if (message.type === 'assistant' && message.content) {
						summary += message.content + ' ';
					}
				};

				const disconnectHandler = () => {
					duration = Math.floor((Date.now() - startTime) / 1000);
					this.isActive = false;

					resolve({
						callId: conversationId,
						recording: '', // ElevenLabs doesn't provide direct recording access
						transcript: transcript.trim(),
						summary: summary.trim() || 'Voice verification completed',
						duration,
					});
				};

				const errorHandler = (error: any) => {
					this.isActive = false;
					reject(
						createBalboaError(
							`ElevenLabs conversation failed: ${error.message || error}`,
							"ELEVENLABS_ERROR",
							error,
						),
					);
				};

				// Add event listeners
				this.conversation.onMessage(messageHandler);
				this.conversation.onDisconnect(disconnectHandler);
				this.conversation.onError(errorHandler);

				// Set timeout
				setTimeout(() => {
					if (this.isActive) {
						this.isActive = false;
						reject(createBalboaError("ElevenLabs conversation timed out", "TIMEOUT"));
					}
				}, this.config.timeout || 30000);
			});
		} catch (error) {
			this.isActive = false;
			throw createBalboaError(
				`Failed to start ElevenLabs conversation: ${getErrorMessage(error)}`,
				"ELEVENLABS_ERROR",
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
	 * Stop the current conversation
	 */
	async stopCall(): Promise<void> {
		try {
			if (this.conversation && this.isActive) {
				await this.conversation.endSession();
				this.isActive = false;
			}
		} catch (error) {
			// Ignore errors when stopping
			console.warn("Error stopping ElevenLabs conversation:", error);
			this.isActive = false;
		}
	}

	/**
	 * Check if a conversation is currently active
	 */
	isCallActive(): boolean {
		return this.isActive;
	}

	/**
	 * Send a text message to the agent (for testing or manual input)
	 */
	async sendMessage(message: string): Promise<void> {
		if (this.conversation && this.isActive) {
			await this.conversation.sendUserMessage(message);
		}
	}

	/**
	 * Get conversation status
	 */
	getStatus(): string {
		if (!this.conversation) return 'disconnected';
		return this.conversation.status || 'unknown';
	}

	/**
	 * Check if agent is speaking
	 */
	isSpeaking(): boolean {
		if (!this.conversation) return false;
		return this.conversation.isSpeaking || false;
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
