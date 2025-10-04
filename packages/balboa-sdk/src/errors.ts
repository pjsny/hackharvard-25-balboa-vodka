import { BalboaError } from "./types";

/**
 * Error codes for different failure scenarios
 */
export const ERROR_CODES = {
	MICROPHONE_DENIED: "MICROPHONE_DENIED",
	VERIFICATION_FAILED: "VERIFICATION_FAILED",
	TIMEOUT: "TIMEOUT",
	API_ERROR: "API_ERROR",
	NETWORK_ERROR: "NETWORK_ERROR",
	INVALID_CONFIG: "INVALID_CONFIG",
	SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
	VAPI_ERROR: "VAPI_ERROR",
} as const;

/**
 * Creates a BalboaError with appropriate error code
 */
export function createBalboaError(
	message: string,
	code: keyof typeof ERROR_CODES,
	originalError?: Error,
): BalboaError {
	return new BalboaError(message, ERROR_CODES[code], originalError);
}

/**
 * Checks if an error is a BalboaError
 */
export function isBalboaError(error: unknown): error is BalboaError {
	return error instanceof BalboaError;
}

/**
 * Extracts error message from various error types
 */
export function getErrorMessage(error: unknown): string {
	if (isBalboaError(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	if (typeof error === "string") {
		return error;
	}

	return "An unknown error occurred";
}

/**
 * Retry configuration for different error types
 */
export const RETRY_CONFIG = {
	[ERROR_CODES.NETWORK_ERROR]: { maxRetries: 3, baseDelay: 1000 },
	[ERROR_CODES.API_ERROR]: { maxRetries: 2, baseDelay: 2000 },
	[ERROR_CODES.TIMEOUT]: { maxRetries: 1, baseDelay: 5000 },
	[ERROR_CODES.VERIFICATION_FAILED]: { maxRetries: 0, baseDelay: 0 },
	[ERROR_CODES.MICROPHONE_DENIED]: { maxRetries: 0, baseDelay: 0 },
} as const;
