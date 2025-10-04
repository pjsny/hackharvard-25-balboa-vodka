// Main SDK exports
// Default export for convenience
export { BalboaWebClient, BalboaWebClient as default } from "./client";
export { VoiceVerificationDialog } from "./components/VoiceVerificationDialog";
// Error exports
export { BalboaError } from "./errors";
export { useBalboa, verifyWithBalboa, useElevenLabsVerification } from "./hooks";
export { useBalboaVerification } from "./hooks/useBalboaVerification";
// Type exports
export type {
	BalboaConfig,
	UseBalboaReturn,
	UseBalboaVerificationReturn,
	VoiceCallResult,
	ElevenLabsCallResult,
	VerificationDetails,
	VerificationOptions,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
} from "./types";
