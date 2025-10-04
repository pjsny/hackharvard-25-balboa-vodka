import { z } from "zod";

/**
 * Server SDK Configuration
 */
export interface BalboaServerConfig {
	/** Base URL of your Balboa backend API */
	baseUrl: string;
	/** API key for authenticating with your backend */
	apiKey?: string;
	/** Environment (sandbox or production) */
	environment?: "sandbox" | "production";
	/** Request timeout in milliseconds */
	timeout?: number;
	/** Number of retry attempts */
	retries?: number;
}

/**
 * Verification Session Status
 */
export type VerificationStatus = "pending" | "completed" | "failed";

/**
 * Voice Verification Request
 */
export interface CreateVerificationRequest {
	transactionId: string;
	customerData: Record<string, unknown>;
	riskLevel?: number;
}

/**
 * Voice Verification Response
 */
export interface CreateVerificationResponse {
	id: string;
	status: VerificationStatus;
}

/**
 * Verification Status Response
 */
export interface VerificationStatusResponse {
	status: VerificationStatus;
	verified?: boolean;
	confidence?: number;
	error?: string;
	details?: VerificationDetails;
}

/**
 * Detailed verification information
 */
export interface VerificationDetails {
	phraseAccuracy?: number;
	voiceMatch?: number;
	fingerprintValid?: boolean;
	livenessScore?: number;
	audioQuality?: number;
	backgroundNoise?: number;
}

/**
 * Submit VAPI Result Request
 */
export interface SubmitVapiResultRequest {
	callId: string;
	recording: string;
	transcript: string;
	summary?: string;
}

/**
 * Verification Session Data (from your backend)
 */
export interface VerificationSession {
	id: string;
	transactionId: string;
	customerData: Record<string, unknown>;
	riskLevel: number;
	status: VerificationStatus;
	createdAt: string;
	updatedAt: string;
	result?: VerificationResult;
	error?: string;
	vapiCallId?: string;
	recordingUrl?: string;
	transcript?: string;
}

/**
 * Verification Result
 */
export interface VerificationResult {
	verified: boolean;
	confidence: number;
	details?: VerificationDetails;
	processingTime?: number;
	reason?: string;
}

/**
 * Balboa Server Error
 */
export class BalboaServerError extends Error {
	constructor(
		message: string,
		public code?: string,
		public statusCode?: number,
		public originalError?: Error,
	) {
		super(message);
		this.name = "BalboaServerError";
	}
}

// Zod Schemas for validation
export const CreateVerificationSchema = z.object({
	transactionId: z.string().min(1),
	customerData: z.record(z.unknown()),
	riskLevel: z.number().min(0).max(100).optional(),
});

export const SubmitVapiResultSchema = z.object({
	callId: z.string().min(1),
	recording: z.string().min(1),
	transcript: z.string().min(1),
	summary: z.string().optional(),
});
