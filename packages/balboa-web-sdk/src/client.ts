import { BalboaError } from "./errors";
import type {
	BalboaConfig,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";

/**
 * Main Balboa Web SDK client
 * Simplified client that just handles API communication
 */
export class BalboaWebClient {
	private config: BalboaConfig;

	constructor(config: BalboaConfig) {
		this.validateConfig(config);
		this.config = {
			baseUrl: config.baseUrl || "http://localhost:3000",
		};
	}

	private validateConfig(config: BalboaConfig): void {
		if (!config.baseUrl) {
			throw new BalboaError("Base URL is required");
		}
	}

	/**
	 * Create a new verification session
	 */
	async createVerificationSession(
		options: VerificationOptions,
	): Promise<VerificationSession> {
		try {
			const response = await this.makeRequest("/api/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(options),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new BalboaError(
					`Failed to create verification session: ${data.error || response.statusText}`,
				);
			}

			return {
				id: data.sessionId,
				status: "pending" as const,
			};
		} catch (error) {
			if (error instanceof BalboaError) {
				throw error;
			}
			throw new BalboaError(
				`Network error: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Get verification session status
	 */
	async getVerificationStatus(sessionId: string): Promise<VerificationResult> {
		try {
			const response = await this.makeRequest(
				`/api/verify/${sessionId}/status`,
				{
					method: "GET",
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new BalboaError(
					`Failed to get verification status: ${data.error || response.statusText}`,
				);
			}

			return {
				success: true,
				verified: data.verified || false,
				confidence: data.confidence || 0,
				sessionId: sessionId,
			};
		} catch (error) {
			if (error instanceof BalboaError) {
				throw error;
			}
			throw new BalboaError(
				`Network error: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	/**
	 * Make HTTP request to the backend
	 */
	private async makeRequest(
		endpoint: string,
		options: RequestInit = {},
	): Promise<Response> {
		const url = `${this.config.baseUrl}${endpoint}`;

		const response = await fetch(url, {
			...options,
			headers: {
				...options.headers,
			},
		});

		return response;
	}

	/**
	 * Sleep utility for delays
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
import { createBalboaError } from "./errors";
import type {
	BalboaConfig,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";
import { BalboaError } from "./types";

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

			// 2. For ElevenLabs, the conversation should be handled by the React hook
			// This method now primarily handles the backend API calls
			options.onProgress?.("processing");

			// 3. Wait for completion (backend will process the ElevenLabs result)
			const result = await this.waitForCompletion(session.id, options);

			options.onProgress?.("completed");
			return result;
		} catch (error) {
			options.onProgress?.("failed");
			throw this.handleError(error);
		}
	}

	/**
	 * Start a verification session on the backend
	 */
	private async startVerificationSession(
		options: VerificationOptions,
	): Promise<VerificationSession> {
		const response = await this.makeRequest("/api/verify", {
			method: "POST",
			body: JSON.stringify({
				transactionId: options.transactionId,
				customerData: options.customerData,
				riskLevel: options.riskLevel || 0,
			}),
		});

		if (!response.ok) {
			throw createBalboaError(
				`Failed to start verification session: ${response.statusText}`,
				"API_ERROR",
			);
		}

		return response.json();
	}

	/**
	 * Wait for verification completion with polling
	 */
	private async waitForCompletion(
		sessionId: string,
		options: VerificationOptions,
	): Promise<VerificationResult> {
		const maxAttempts = 30; // 30 seconds max
		const timeout = options.timeout || this.config.timeout || 30000;
		const startTime = Date.now();
		let attempts = 0;

		while (attempts < maxAttempts && Date.now() - startTime < timeout) {
			try {
				const response = await this.makeRequest(
					`/api/verify/${sessionId}/status`,
				);
				const data: VerificationSession = await response.json();

				if (data.status === "completed") {
					if (!data.result) {
						throw createBalboaError(
							"Verification completed but no result provided",
							"API_ERROR",
						);
					}
					return data.result;
				}

				if (data.status === "failed") {
					throw createBalboaError(
						data.error || "Verification failed",
						"VERIFICATION_FAILED",
					);
				}

				// Wait before next poll (exponential backoff)
				const delay = Math.min(1000 * 1.5 ** attempts, 5000);
				await this.sleep(delay);
				attempts++;
			} catch (error) {
				if (attempts >= maxAttempts - 1) {
					throw error;
				}
				// Retry on network errors
				await this.sleep(1000);
				attempts++;
			}
		}

		throw createBalboaError("Verification timeout", "TIMEOUT");
	}

	/**
	 * Make HTTP request with retry logic
	 */
	private async makeRequest(
		url: string,
		options: RequestInit = {},
	): Promise<Response> {
		const fullUrl = `${this.config.baseUrl}${url}`;
		const requestOptions: RequestInit = {
			headers: {
				Authorization: `Bearer ${this.config.apiKey}`,
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		let lastError: Error | null = null;
		const maxRetries = this.config.retries || 3;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				const response = await fetch(fullUrl, requestOptions);

				if (response.ok) {
					return response;
				}

				// Don't retry on client errors (4xx)
				if (response.status >= 400 && response.status < 500) {
					throw createBalboaError(
						`API error: ${response.status} ${response.statusText}`,
						"API_ERROR",
					);
				}

				// Retry on server errors (5xx)
				if (attempt < maxRetries) {
					const delay = 1000 * 2 ** attempt; // Exponential backoff
					await this.sleep(delay);
					continue;
				}

				throw createBalboaError(
					`API error: ${response.status} ${response.statusText}`,
					"API_ERROR",
				);
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));

				if (attempt < maxRetries) {
					const delay = 1000 * 2 ** attempt;
					await this.sleep(delay);
				}
			}
		}

		throw createBalboaError(
			`Network error after ${maxRetries} retries: ${lastError?.message}`,
			"NETWORK_ERROR",
			lastError || undefined,
		);
	}

	/**
	 * Sleep utility function
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Validate configuration
	 */
	private validateConfig(config: BalboaConfig): void {
		if (!config.apiKey) {
			throw createBalboaError("API key is required", "INVALID_CONFIG");
		}
		if (!config.baseUrl) {
			throw createBalboaError("Base URL is required", "INVALID_CONFIG");
		}
		if (!config.baseUrl.startsWith("http")) {
			throw createBalboaError(
				"Base URL must start with http:// or https://",
				"INVALID_CONFIG",
			);
		}
	}

	/**
	 * Handle and transform errors
	 */
	private handleError(error: unknown): BalboaError {
		if (error instanceof BalboaError) {
			return error;
		}

		if (error instanceof Error) {
			return createBalboaError(
				`Verification failed: ${error.message}`,
				"VERIFICATION_FAILED",
				error,
			);
		}

		return createBalboaError(
			"An unknown error occurred during verification",
			"VERIFICATION_FAILED",
		);
	}
}
