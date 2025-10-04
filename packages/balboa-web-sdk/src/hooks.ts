"use client";

import { useCallback, useState } from "react";
import { BalboaWebClient } from "./client";
import type {
	BalboaConfig,
	UseBalboaReturn,
	VerificationOptions,
	VerificationResult,
	VerificationStatus,
} from "./types";
import { BalboaError } from "./types";

/**
 * React hook for Balboa voice verification
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

				// Add progress callback
				const optionsWithProgress = {
					...options,
					onProgress: (status: VerificationStatus) => {
						setState((prev) => ({ ...prev, status }));
					},
				};

				const result = await client.verifyWithBalboa(optionsWithProgress);

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
	return client.verifyWithBalboa(options);
}
