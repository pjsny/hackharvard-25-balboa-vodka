import type {
	BalboaConfig,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";
import { BalboaError } from "./types";
import { BalboaVapiIntegration } from "./vapi-integration";

/**
 * Main Balboa Web SDK client
 */
export class BalboaWebClient {
	private config: BalboaConfig;
	private vapiIntegration: BalboaVapiIntegration;

	constructor(config: BalboaConfig) {
		this.validateConfig(config);
		this.config = {
			timeout: 30000,
			retries: 3,
			environment: "production",
			...config,
		};
		this.vapiIntegration = new BalboaVapiIntegration(this.config);
	}

	/**
	 * Main verification function - handles the entire voice verification flow
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

			// 2. Start VAPI conversation
			const vapiResult = await this.vapiIntegration.startVerification(
				session.id,
			);
			options.onProgress?.("processing");

			// 3. Submit VAPI result to backend
			await this.submitVapiResult(session.id, vapiResult);

			// 4. Poll for completion
			const result = await this.waitForCompletion(
				session.id,
				options.timeout || this.config.timeout!,
				options.retries || this.config.retries!,
			);

			options.onProgress?.("completed");
			return result;
		} catch (error) {
			options.onProgress?.("failed");
			throw this.handleError(error);
		}
	}

	/**
	 * Start verification session on the backend
	 */
	private async startVerificationSession(
		options: VerificationOptions,
	): Promise<VerificationSession> {
		const response = await this.makeRequest("/api/verify", {
			method: "POST",
			body: JSON.stringify({
				transactionId: options.transactionId,
				customerData: options.customerData,
				riskLevel: options.riskLevel,
			}),
		});

		return response.json();
	}

	/**
	 * Submit VAPI result to backend
	 */
	private async submitVapiResult(
		sessionId: string,
		vapiResult: {
			callId: string;
			recording: string;
			transcript: string;
			summary?: string;
		},
	): Promise<void> {
		const response = await this.makeRequest(
			`/api/verify/${sessionId}/vapi-result`,
			{
				method: "POST",
				body: JSON.stringify({
					callId: vapiResult.callId,
					recording: vapiResult.recording,
					transcript: vapiResult.transcript,
					summary: vapiResult.summary,
				}),
			},
		);

		if (!response.ok) {
			throw new BalboaError("Failed to submit VAPI result to backend");
		}
	}

	/**
	 * Poll for verification completion
	 */
	private async waitForCompletion(
		sessionId: string,
		timeout: number,
		retries: number,
	): Promise<VerificationResult> {
		const maxAttempts = retries + 1;
		let attempts = 0;
		const startTime = Date.now();

		while (attempts < maxAttempts && Date.now() - startTime < timeout) {
			try {
				const response = await this.makeRequest(
					`/api/verify/${sessionId}/status`,
				);
				const data = await response.json();

				if (data.status === "completed") {
					if (data.verified === undefined || data.confidence === undefined) {
						throw new BalboaError(
							"Backend returned incomplete verification result",
						);
					}
					return {
						success: true,
						verified: data.verified,
						confidence: data.confidence,
						sessionId: sessionId,
						details: data.details,
					};
				}

				if (data.status === "failed") {
					throw new BalboaError(data.error || "Verification failed by backend");
				}

				// Wait before next attempt
				const delay = Math.min(1000 * 1.5 ** attempts, 5000);
				await this.sleep(delay);
				attempts++;
			} catch (error) {
				if (attempts === maxAttempts - 1) {
					throw error;
				}
				attempts++;
				await this.sleep(1000);
			}
		}

		throw new BalboaError("Verification timeout");
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
					throw new BalboaError(
						`API error: ${response.status} - ${response.statusText}`,
					);
				}

				// Retry on server errors (5xx)
				lastError = new BalboaError(
					`API error: ${response.status} - ${response.statusText}`,
				);
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
			}

			// Wait before retry
			if (attempt < maxRetries) {
				const delay = Math.min(1000 * 2 ** attempt, 10000);
				await this.sleep(delay);
			}
		}

		throw lastError || new BalboaError("Request failed after retries");
	}

	/**
	 * Validate configuration
	 */
	private validateConfig(config: BalboaConfig): void {
		if (!config.baseUrl) {
			throw new BalboaError("Base URL is required", "INVALID_CONFIG");
		}
		if (!config.baseUrl.startsWith("http")) {
			throw new BalboaError(
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
		return new BalboaError(
			error instanceof Error ? error.message : "Unknown error",
			"UNKNOWN_ERROR",
			error instanceof Error ? error : undefined,
		);
	}

	/**
	 * Sleep utility
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
