// Main SDK exports
// Default export for convenience
export { BalboaWebClient, BalboaWebClient as default } from "./client";
export { VoiceVerificationDialog } from "./components/VoiceVerificationDialog";
export { useBalboa, verifyWithBalboa } from "./hooks";
export { useBalboaVerification } from "./hooks/useBalboaVerification";
// Type exports
export type {
	BalboaConfig,
	UseBalboaReturn,
	UseBalboaVerificationReturn,
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
