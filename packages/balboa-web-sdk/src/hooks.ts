"use client";

import { useCallback, useState } from "react";
import { BalboaWebClient } from "./client";
import { BalboaError } from "./errors";
import type {
	BalboaConfig,
	UseBalboaReturn,
	VerificationOptions,
	VerificationResult,
	VerificationStatus,
} from "./types";

/**
 * React hook for Balboa voice verification
 * Simplified hook that just handles session creation and status polling
 */
export function useBalboa(config?: BalboaConfig): UseBalboaReturn {
	const [state, setState] = useState<{
		status: VerificationStatus;
		result: VerificationResult | null;
		error: Error | null;
	}>({
		status: "idle",
		result: null,
		error: null,
	});

	const verifyWithBalboa = useCallback(
		async (options: VerificationOptions): Promise<VerificationResult> => {
			setState({ status: "starting", result: null, error: null });

			try {
				// Create client with config or use default
				const clientConfig = config || {
					baseUrl: "http://localhost:3000",
					environment: "production",
				};

				const client = new BalboaWebClient(clientConfig);

				// Create verification session
				const session = await client.createVerificationSession(options);
				setState((prev) => ({ ...prev, status: "calling" }));

				// Poll for verification status
				const result = await pollForStatus(client, session.id);

				setState({ status: "completed", result, error: null });
				return result;
			} catch (error) {
				const balboaError =
					error instanceof BalboaError
						? error
						: new BalboaError(
								error instanceof Error ? error.message : "Unknown error",
								"VERIFICATION_FAILED",
								error instanceof Error ? error : undefined,
							);

				setState({ status: "failed", result: null, error: balboaError });
				throw balboaError;
			}
		},
		[config],
	);

	return {
		verifyWithBalboa,
		isLoading:
			state.status === "starting" ||
			state.status === "calling" ||
			state.status === "processing",
		result: state.result,
		error: state.error,
	};
}

/**
 * Poll for verification status with exponential backoff
 */
async function pollForStatus(
	client: BalboaWebClient,
	sessionId: string,
): Promise<VerificationResult> {
	const maxAttempts = 10;
	const baseDelay = 1000; // 1 second
	const maxDelay = 10000; // 10 seconds

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const result = await client.getVerificationStatus(sessionId);

			if (result.success && result.verified !== null) {
				return result;
			}

			// Calculate delay with exponential backoff
			const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
			console.log(
				`⏳ Attempt ${attempt}/${maxAttempts} - waiting ${delay}ms before next poll`,
			);

			await sleep(delay);
		} catch (error) {
			console.error(`❌ Poll attempt ${attempt} failed:`, error);

			if (attempt === maxAttempts) {
				throw new BalboaError(
					`Verification polling failed after ${maxAttempts} attempts`,
				);
			}

			// Wait before retrying
			const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
			await sleep(delay);
		}
	}

	throw new BalboaError("Verification polling timed out");
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple function-based API for non-React usage
 */
export async function verifyWithBalboa(
	options: VerificationOptions,
	config?: BalboaConfig,
): Promise<VerificationResult> {
	const clientConfig = config || {
		baseUrl: "http://localhost:3000",
		environment: "production",
	};

	const client = new BalboaWebClient(clientConfig);

	// Create verification session
	const session = await client.createVerificationSession(options);

	// Poll for verification status
	return pollForStatus(client, session.id);
}
