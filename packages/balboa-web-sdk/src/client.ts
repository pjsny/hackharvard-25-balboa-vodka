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
