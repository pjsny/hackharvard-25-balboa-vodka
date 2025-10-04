import { createBalboaError } from "./errors";
import type {
	BalboaConfig,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";

/**
 * Main Balboa SDK client
 */
export class BalboaClient {
	private config: BalboaConfig;

	constructor(config: BalboaConfig) {
		this.validateConfig(config);
		this.config = {
			timeout: 30000,
			retries: 3,
			environment: "production",
			...config,
		};
	}

	/**
	 * Main verification function - handles the entire voice verification flow
	 * Note: For ElevenLabs integration, use the useElevenLabsVerification hook instead
	 */
	async verifyWithBalboa(
		options: VerificationOptions,
	): Promise<VerificationResult> {
		try {
			// Notify progress
			options.onProgress?.("starting");

			// 1. Start verification session
			const session = await this.startVerificationSession(options);
			options.onProgress?.("calling");

			// 2. Wait for verification to complete
			const result = await this.waitForVerification(session.id);
			options.onProgress?.("processing");

			// 3. Process the result
			const processedResult = await this.processVerificationResult(result);
			options.onProgress?.("completed");

			return processedResult;
		} catch (error) {
			options.onProgress?.("failed");
			throw createBalboaError(
				`Verification failed: ${error instanceof Error ? error.message : String(error)}`,
				"VERIFICATION_FAILED",
				error instanceof Error ? error : undefined,
			);
		}
	}

	/**
	 * Start a new verification session
	 */
	async startVerificationSession(
		options: VerificationOptions,
	): Promise<VerificationSession> {
		try {
			const response = await this.makeRequest("/api/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: options.email,
					timeout: options.timeout || this.config.timeout,
					retries: options.retries || this.config.retries,
					transactionId: (options as any).transactionId,
					customerData: (options as any).customerData,
					riskLevel: (options as any).riskLevel,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw createBalboaError(
					`Failed to start verification session: ${data.error || response.statusText}`,
					"API_ERROR",
				);
			}

			return data;
		} catch (error) {
			if (error instanceof Error && error.message.includes("Failed to fetch")) {
				throw createBalboaError(
					"Network error: Unable to connect to verification service",
					"NETWORK_ERROR",
					error,
				);
			}
			throw createBalboaError(
				`Failed to start verification session: ${error instanceof Error ? error.message : String(error)}`,
				"API_ERROR",
				error instanceof Error ? error : undefined,
			);
		}
	}

	/**
	 * Wait for verification to complete
	 */
	async waitForVerification(sessionId: string): Promise<any> {
		const maxAttempts = 30; // 30 seconds max wait
		const pollInterval = 1000; // Poll every second

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				const response = await this.makeRequest(`/api/verify/${sessionId}`, {
					method: "GET",
				});

				if (response.ok) {
					const data = await response.json();
					if (data.status === "completed" || data.status === "failed") {
						return data;
					}
				}

				// Wait before next poll
				await this.sleep(pollInterval);
			} catch (error) {
				if (attempt === maxAttempts - 1) {
					throw createBalboaError(
						"Verification timeout: Session did not complete in time",
						"TIMEOUT",
						error instanceof Error ? error : undefined,
					);
				}
				await this.sleep(pollInterval);
			}
		}

		throw createBalboaError(
			"Verification timeout: Session did not complete in time",
			"TIMEOUT",
		);
	}

	/**
	 * Process verification result
	 */
	async processVerificationResult(result: any): Promise<VerificationResult> {
		return {
			success: result.status === "completed" && result.verified === true,
			verified: result.verified === true,
			sessionId: result.sessionId,
			confidence: result.confidence || result.score || 0,
			details: result.details || {},
		};
	}

	/**
	 * Make HTTP request with error handling
	 */
	private async makeRequest(
		endpoint: string,
		options: RequestInit = {},
	): Promise<Response> {
		const url = `${this.config.baseUrl}${endpoint}`;
		const requestOptions: RequestInit = {
			...options,
			headers: {
				"Content-Type": "application/json",
				...(this.config.apiKey && { Authorization: `Bearer ${this.config.apiKey}` }),
				...options.headers,
			},
		};

		try {
			const response = await fetch(url, requestOptions);
			return response;
		} catch (error) {
			if (error instanceof TypeError && error.message.includes("fetch")) {
				throw createBalboaError(
					"Network error: Unable to connect to Balboa API",
					"NETWORK_ERROR",
					error,
				);
			}
			throw createBalboaError(
				`Request failed: ${error instanceof Error ? error.message : String(error)}`,
				"API_ERROR",
				error instanceof Error ? error : undefined,
			);
		}
	}

	/**
	 * Validate configuration
	 */
	private validateConfig(config: BalboaConfig): void {
		if (!config.baseUrl) {
			throw createBalboaError(
				"Base URL is required for Balboa configuration",
				"INVALID_CONFIG",
			);
		}

		if (config.timeout && config.timeout < 1000) {
			throw createBalboaError(
				"Timeout must be at least 1000ms",
				"INVALID_CONFIG",
			);
		}

		if (config.retries && (config.retries < 0 || config.retries > 10)) {
			throw createBalboaError(
				"Retries must be between 0 and 10",
				"INVALID_CONFIG",
			);
		}
	}

	/**
	 * Sleep utility for delays
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

// Export both class names for backward compatibility
export { BalboaClient as BalboaWebClient };