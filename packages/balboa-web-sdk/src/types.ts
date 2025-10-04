/**
 * Configuration options for the Balboa Web SDK
 */
export interface BalboaConfig {
	/** API key for authenticating with Balboa services (optional for development) */
	apiKey?: string;
	/** Base URL for the Balboa API */
	baseUrl: string;
	/** Environment (sandbox or production) */
	environment?: "sandbox" | "production";
	/** Request timeout in milliseconds */
	timeout?: number;
	/** Number of retry attempts */
	retries?: number;
	/** ElevenLabs Agent ID for voice conversations */
	agentId?: string;
}

/**
 * Options for voice verification
 */
export interface VerificationOptions {
	/** Customer's email address for verification */
	email: string;
	/** Custom timeout in milliseconds */
	timeout?: number;
	/** Number of retry attempts */
	retries?: number;
	/** Progress callback for status updates */
	onProgress?: (status: VerificationStatus) => void;
}

/**
 * Verification status types
 */
export type VerificationStatus =
	| "idle"
	| "starting"
	| "calling"
	| "processing"
	| "completed"
	| "failed";

/**
 * Result of voice verification
 */
export interface VerificationResult {
	/** Whether the verification process completed successfully */
	success: boolean;
	/** Whether the user's voice was verified */
	verified: boolean;
	/** Confidence score from 0.0 to 1.0 */
	confidence: number;
	/** Unique session ID for the verification */
	sessionId: string;
	/** Additional verification details */
	details?: VerificationDetails;
}

/**
 * Detailed verification information
 */
export interface VerificationDetails {
	/** Accuracy of the spoken phrase */
	phraseAccuracy?: number;
	/** Voice biometric match score */
	voiceMatch?: number;
	/** Whether audio fingerprint was valid */
	fingerprintValid?: boolean;
	/** Processing time in milliseconds */
	processingTime?: number;
	/** Reason for verification result */
	reason?: string;
}

/**
 * Voice call result data
 */
export interface VoiceCallResult {
	/** Unique call ID */
	callId: string;
	/** Audio recording URL or data */
	recording: string;
	/** Transcribed text */
	transcript: string;
	/** Call summary */
	summary?: string;
	/** Call duration in seconds */
	duration?: number;
}

/**
 * Backend API response for verification session
 */
export interface VerificationSession {
	/** Session ID */
	id: string;
	/** Current status */
	status: "pending" | "completed" | "failed";
	/** Verification result */
	result?: VerificationResult;
	/** Error message if failed */
	error?: string;
}

/**
 * React hook return type
 */
export interface UseBalboaReturn {
	/** Main verification function */
	verifyWithBalboa: (
		options: VerificationOptions,
	) => Promise<VerificationResult>;
	/** Whether verification is in progress */
	isLoading: boolean;
	/** Last verification result */
	result: VerificationResult | null;
	/** Last error */
	error: Error | null;
}

/**
 * Web verification hook return type
 */
export interface UseBalboaVerificationReturn {
	/** Start verification process */
	startVerification: (options: VerificationOptions) => void;
	/** Whether verification is in progress */
	isLoading: boolean;
	/** Last verification result */
	result: VerificationResult | null;
	/** Last error */
	error: Error | null;
	/** Whether dialog is open */
	isOpen: boolean;
	/** Current verification options */
	currentOptions: VerificationOptions | null;
	/** Handle successful verification */
	handleSuccess: () => void;
	/** Handle dialog close */
	handleClose: () => void;
	/** Direct verification function */
	verifyWithBalboa: (
		options: VerificationOptions,
	) => Promise<VerificationResult>;
}

/**
 * Result of ElevenLabs voice call
 */
export interface ElevenLabsCallResult {
	/** Unique call/conversation ID */
	callId: string;
	/** Audio recording data (base64 or URL) */
	recording: string;
	/** Transcript of the conversation */
	transcript: string;
	/** Summary of the conversation */
	summary: string;
	/** Duration of the call in seconds */
	duration: number;
}
