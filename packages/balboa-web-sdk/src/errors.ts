/**
 * Error codes for different types of Balboa errors
 */
export const ERROR_CODES = {
	NETWORK_ERROR: "NETWORK_ERROR",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	TIMEOUT_ERROR: "TIMEOUT_ERROR",
	VAPI_ERROR: "VAPI_ERROR",
	SESSION_ERROR: "SESSION_ERROR",
	UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

/**
 * Custom error class for Balboa SDK errors
 */
export class BalboaError extends Error {
	constructor(
		message: string,
		public code?: string,
		public originalError?: Error,
	) {
		super(message);
		this.name = "BalboaError";
	}
}
