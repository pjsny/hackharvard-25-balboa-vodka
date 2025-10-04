// Main SDK exports
export { BalboaServerClient, BalboaServerClient as default } from "./client";

// Type exports
export type {
	BalboaServerConfig,
	BalboaServerError,
	CreateVerificationRequest,
	CreateVerificationResponse,
	SubmitElevenLabsResultRequest,
	VerificationDetails,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
	VerificationStatusResponse,
} from "./types";

// Zod schemas
export {
	CreateVerificationSchema,
	SubmitElevenLabsResultSchema,
} from "./types";
