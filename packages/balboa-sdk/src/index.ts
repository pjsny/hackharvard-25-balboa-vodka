// Main SDK exports
// Default export for convenience
export { BalboaClient, BalboaClient as default } from "./client";
export {
	createBalboaError,
	ERROR_CODES,
	getErrorMessage,
	isBalboaError,
} from "./errors";
export { useBalboa, verifyWithBalboa } from "./hooks";
// Type exports
export type {
	BalboaConfig,
	UseBalboaReturn,
	VapiCallResult,
	VerificationDetails,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";
// Error exports
export { BalboaError } from "./types";
export { BalboaVapiIntegration } from "./vapi-integration";
