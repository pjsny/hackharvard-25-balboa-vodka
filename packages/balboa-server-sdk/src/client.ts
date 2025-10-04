import type {
	BalboaServerConfig,
	CreateVerificationRequest,
	CreateVerificationResponse,
	VerificationSession,
	VerificationStatusResponse,
} from "./types";
import { BalboaServerError } from "./types";

/**
 * Balboa Server SDK Client - Calls your backend API
 */
export class BalboaServerClient {
	constructor() {
		// No configuration needed for now
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
		const baseUrl = "http://localhost:3000";
		const url = `${baseUrl}${endpoint}`;

		const requestOptions: RequestInit = {
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			...options,
		};

		let lastError: Error | null = null;
		const maxRetries = 3;

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
