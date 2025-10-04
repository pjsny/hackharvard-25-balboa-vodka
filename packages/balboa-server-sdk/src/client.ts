import type {
	BalboaServerConfig,
	CreateVerificationRequest,
	CreateVerificationResponse,
	SubmitVapiResultRequest,
	VerificationSession,
	VerificationStatusResponse,
} from "./types";
import { BalboaServerError } from "./types";

/**
 * Balboa Server SDK Client - Calls your backend API
 */
export class BalboaServerClient {
	private config: BalboaServerConfig;

	constructor(config: BalboaServerConfig) {
		this.config = config;
		this.validateConfig(config);
	}

	/**
	 * Create a new verification session by calling your backend
	 */
	async createVerificationSession(
		request: CreateVerificationRequest,
	): Promise<CreateVerificationResponse> {
		try {
			const response = await this.makeRequest("/api/verify", {
				method: "POST",
				body: JSON.stringify(request),
			});

			return response.json();
		} catch (error) {
			throw this.handleError(error, "Failed to create verification session");
		}
	}

	/**
	 * Get verification session status from your backend
	 */
	async getVerificationStatus(
		sessionId: string,
	): Promise<VerificationStatusResponse> {
		try {
			const response = await this.makeRequest(
				`/api/verify/${sessionId}/status`,
			);
			return response.json();
		} catch (error) {
			throw this.handleError(error, "Failed to get verification status");
		}
	}

	/**
	 * Submit VAPI result to your backend
	 */
	async submitVapiResult(
		sessionId: string,
		vapiResult: SubmitVapiResultRequest,
	): Promise<{ success: boolean }> {
		try {
			const response = await this.makeRequest(
				`/api/verify/${sessionId}/vapi-result`,
				{
					method: "POST",
					body: JSON.stringify(vapiResult),
				},
			);

			return response.json();
		} catch (error) {
			throw this.handleError(error, "Failed to submit VAPI result");
		}
	}

	/**
	 * Get session details from your backend
	 */
	async getSession(sessionId: string): Promise<VerificationSession | null> {
		try {
			const response = await this.makeRequest(`/api/verify/${sessionId}`);
			return response.json();
		} catch (error) {
			if (error instanceof BalboaServerError && error.statusCode === 404) {
				return null;
			}
			throw this.handleError(error, "Failed to get session");
		}
	}

	/**
	 * List all sessions from your backend (admin endpoint)
	 */
	async listSessions(): Promise<VerificationSession[]> {
		try {
			const response = await this.makeRequest("/api/verify/sessions");
			return response.json();
		} catch (error) {
			throw this.handleError(error, "Failed to list sessions");
		}
	}

	/**
	 * Make HTTP request to your backend
	 */
	private async makeRequest(
		endpoint: string,
		options: RequestInit = {},
	): Promise<Response> {
		const url = `${this.config.baseUrl}${endpoint}`;

		const requestOptions: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...(this.config.apiKey && {
					Authorization: `Bearer ${this.config.apiKey}`,
				}),
				...options.headers,
			},
			...options,
		};

		let lastError: Error | null = null;
		const maxRetries = this.config.retries || 3;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				const response = await fetch(url, requestOptions);

				if (response.ok) {
					return response;
				}

				// Don't retry on client errors (4xx)
				if (response.status >= 400 && response.status < 500) {
					throw new BalboaServerError(
						`API error: ${response.status} - ${response.statusText}`,
						"API_ERROR",
						response.status,
					);
				}

				// Retry on server errors (5xx)
				lastError = new BalboaServerError(
					`API error: ${response.status} - ${response.statusText}`,
					"API_ERROR",
					response.status,
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

		throw lastError || new BalboaServerError("Request failed after retries");
	}

	/**
	 * Validate configuration
	 */
	private validateConfig(config: BalboaServerConfig): void {
		if (!config.baseUrl) {
			throw new BalboaServerError("Base URL is required", "INVALID_CONFIG");
		}
		if (!config.baseUrl.startsWith("http")) {
			throw new BalboaServerError(
				"Base URL must start with http:// or https://",
				"INVALID_CONFIG",
			);
		}
	}

	/**
	 * Handle and transform errors
	 */
	private handleError(error: unknown, message: string): BalboaServerError {
		if (error instanceof BalboaServerError) {
			return error;
		}
		return new BalboaServerError(
			`${message}: ${error instanceof Error ? error.message : "Unknown error"}`,
			"REQUEST_FAILED",
			500,
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
