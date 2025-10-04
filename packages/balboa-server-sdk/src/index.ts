// Main SDK exports
export { BalboaServerClient, BalboaServerClient as default } from "./client";

// Type exports
export type {
	BalboaServerConfig,
	BalboaServerError,
	CreateVerificationRequest,
	CreateVerificationResponse,
	SubmitVapiResultRequest,
	VerificationDetails,
	VerificationResult,
	VerificationSession,
	VerificationStatus,
	VerificationStatusResponse,
} from "./types";

// Zod schemas
export {
	CreateVerificationSchema,
	SubmitVapiResultSchema,
} from "./types";
