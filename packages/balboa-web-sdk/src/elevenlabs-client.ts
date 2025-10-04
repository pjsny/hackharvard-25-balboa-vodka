/**
 * Internal ElevenLabs Agents Platform client for the Balboa SDK
 * This handles all ElevenLabs integration internally - consumers don't need API keys
 * Based on ElevenLabs Agents Platform: https://elevenlabs.io/docs/agents-platform/overview
 */
export class BalboaElevenLabsClient {
	private isInitialized = false;
	private websocket: WebSocket | null = null;
	private eventListeners: Map<string, Array<(...args: any[]) => void>> =
		new Map();
	private agentId: string | null = null;
	private apiKey: string | null = null;

	constructor() {
		// No initialization needed until we have the agent ID and API key
	}

	/**
	 * Initialize ElevenLabs Agents Platform with the actual API key and agent ID
	 * This should be called internally by the SDK
	 */
	async initialize(apiKey: string, agentId: string): Promise<void> {
		if (this.isInitialized) return;

		console.log(
			"🔧 Initializing ElevenLabs Agents Platform with API key:",
			apiKey.substring(0, 10) + "...",
		);
		console.log("🤖 Agent ID:", agentId);

		this.apiKey = apiKey;
		this.agentId = agentId;
		this.isInitialized = true;

		console.log("✅ ElevenLabs Agents Platform initialization complete");
		console.log("📊 Client state:", {
			initialized: this.isInitialized,
			hasAgentId: !!this.agentId,
			apiKeyLength: apiKey.length,
		});
	}

	/**
	 * Start a voice conversation using ElevenLabs Agents Platform WebSocket
	 */
	async startConversation(): Promise<void> {
		if (!this.isInitialized || !this.agentId || !this.apiKey) {
			throw new Error("ElevenLabs client not initialized");
		}

		console.log(
			"🚀 Starting ElevenLabs Agents Platform conversation with agent:",
			this.agentId,
		);

		try {
			// Start the WebSocket connection to the agent
			await this.startWebSocketConnection();
		} catch (error) {
			console.error("❌ Failed to start ElevenLabs conversation:", error);
			throw error;
		}
	}

	/**
	 * Start WebSocket connection for real-time conversation with ElevenLabs Agents Platform
	 */
	private async startWebSocketConnection(): Promise<void> {
		try {
			// ElevenLabs Agents Platform WebSocket URL format
			// Based on: https://elevenlabs.io/docs/agents-platform/overview
			const websocketUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`;
			console.log("🔌 WebSocket URL:", websocketUrl);

			// Create WebSocket connection with authentication
			// Note: Browser WebSocket doesn't support custom headers directly
			// Authentication will need to be handled via query params or initial message
			this.websocket = new WebSocket(websocketUrl);

			this.websocket.onopen = () => {
				console.log(
					"✅ ElevenLabs Agents Platform WebSocket connection opened",
				);
				this.emit("call-start", { agentId: this.agentId });
			};

			this.websocket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					console.log("📨 ElevenLabs WebSocket message:", data);

					// Handle different message types from ElevenLabs Agents Platform
					if (data.type === "audio") {
						this.emit("message", {
							type: "audio",
							role: "assistant",
							audio: data.audio,
						});
					} else if (data.type === "transcript") {
						this.emit("message", {
							type: "transcript",
							role: data.role || "assistant",
							transcript: data.text,
						});
					} else if (data.type === "speech_start") {
						this.emit("message", {
							type: "speech-update",
							status: "started",
							role: data.role || "assistant",
						});
					} else if (data.type === "speech_end") {
						this.emit("message", {
							type: "speech-update",
							status: "stopped",
							role: data.role || "assistant",
						});
					} else if (data.type === "user_speech_start") {
						this.emit("message", {
							type: "speech-update",
							status: "started",
							role: "user",
						});
					} else if (data.type === "user_speech_end") {
						this.emit("message", {
							type: "speech-update",
							status: "stopped",
							role: "user",
						});
					}
				} catch (error) {
					console.error(
						"❌ Error parsing ElevenLabs WebSocket message:",
						error,
					);
				}
			};

			this.websocket.onclose = () => {
				console.log("🔚 ElevenLabs WebSocket connection closed");
				this.emit("call-end", { agentId: this.agentId });
			};

			this.websocket.onerror = (error) => {
				console.error("❌ ElevenLabs WebSocket error:", error);
				this.emit("error", error);
			};
		} catch (error) {
			console.error(
				"❌ Failed to start ElevenLabs WebSocket connection:",
				error,
			);
			throw error;
		}
	}

	/**
	 * Stop the current conversation
	 */
	async stopConversation(): Promise<void> {
		if (this.websocket) {
			this.websocket.close();
			this.websocket = null;
		}
	}

	/**
	 * Send audio data to the conversation
	 */
	async sendAudio(audioData: ArrayBuffer): Promise<void> {
		if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
			throw new Error("WebSocket connection not available");
		}

		// Send audio data via WebSocket
		this.websocket.send(audioData);
	}

	/**
	 * Add event listeners
	 */
	on(event: string, callback: (...args: any[]) => void): void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, []);
		}
		this.eventListeners.get(event)!.push(callback);
		console.log(`🔗 Setting up listener for event: ${event}`);
	}

	/**
	 * Remove event listeners
	 */
	off(event: string, callback?: (...args: any[]) => void): void {
		if (!this.eventListeners.has(event)) return;

		if (callback) {
			const listeners = this.eventListeners.get(event)!;
			const index = listeners.indexOf(callback);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		} else {
			this.eventListeners.delete(event);
		}
	}

	/**
	 * Emit events to listeners
	 */
	private emit(event: string, ...args: any[]): void {
		if (this.eventListeners.has(event)) {
			this.eventListeners.get(event)!.forEach((callback) => {
				try {
					callback(...args);
				} catch (error) {
					console.error(`❌ Error in event listener for ${event}:`, error);
				}
			});
		}
	}

	/**
	 * Check if a conversation is currently active
	 */
	isCallActive(): boolean {
		return (
			this.websocket !== null && this.websocket.readyState === WebSocket.OPEN
		);
	}

	/**
	 * Check if the client is ready for use
	 */
	isReady(): boolean {
		const ready = this.isInitialized && !!this.agentId && !!this.apiKey;
		console.log("🔍 Client ready check:", {
			initialized: this.isInitialized,
			hasAgentId: !!this.agentId,
			hasApiKey: !!this.apiKey,
			ready: ready,
		});
		return ready;
	}

	/**
	 * Get ElevenLabs Agents Platform status for debugging
	 */
	getStatus(): any {
		if (!this.isInitialized) return { initialized: false };

		return {
			initialized: this.isInitialized,
			isCallActive: this.isCallActive(),
			hasAgentId: !!this.agentId,
			hasApiKey: !!this.apiKey,
			websocketState: this.websocket?.readyState,
		};
	}

	/**
	 * Test ElevenLabs Agents Platform functionality
	 */
	async testElevenLabsInstance(): Promise<boolean> {
		if (!this.isInitialized || !this.agentId || !this.apiKey) {
			console.log("❌ ElevenLabs Agents Platform not initialized");
			return false;
		}

		try {
			console.log("🧪 Testing ElevenLabs Agents Platform...");

			// Test basic WebSocket connectivity
			const testUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`;
			console.log("📋 Test WebSocket URL:", testUrl);

			// For now, just verify we have the required components
			const hasAgentId = !!this.agentId;
			const hasApiKey = !!this.apiKey;

			console.log("📋 ElevenLabs Agents Platform components:", {
				hasAgentId,
				hasApiKey,
				initialized: this.isInitialized,
			});

			return hasAgentId && hasApiKey && this.isInitialized;
		} catch (error) {
			console.error("❌ ElevenLabs Agents Platform test failed:", error);
			return false;
		}
	}
}
