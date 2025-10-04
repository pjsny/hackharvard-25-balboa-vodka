"use client";

import { CheckCircle, Loader2, Mic, XCircle } from "lucide-react";
import { useState } from "react";
import { useBalboa } from "../hooks";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";

interface VoiceVerificationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	transactionId: string;
	customerData: Record<string, unknown>;
	riskLevel?: number;
}

export function VoiceVerificationDialog({
	isOpen,
	onClose,
	onSuccess,
	transactionId,
	customerData,
	riskLevel = 75,
}: VoiceVerificationDialogProps) {
	const { verifyWithBalboa, isLoading, result, error } = useBalboa();
	const [isVerifying, setIsVerifying] = useState(false);

	const handleVerification = async () => {
		setIsVerifying(true);
		try {
			const result = await verifyWithBalboa({
				transactionId,
				customerData,
				riskLevel,
				onProgress: (status) => {
					console.log("Verification status:", status);
				},
			});

			if (result.success && result.verified) {
				onSuccess();
			}
		} catch (error) {
			console.error("Verification failed:", error);
		} finally {
			setIsVerifying(false);
		}
	};

	const getStatusIcon = () => {
		if (isLoading || isVerifying) {
			return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
		}
		if (result?.verified) {
			return <CheckCircle className="w-8 h-8 text-green-600" />;
		}
		if (error) {
			return <XCircle className="w-8 h-8 text-red-600" />;
		}
		return <Mic className="w-8 h-8 text-gray-400" />;
	};

	const getStatusText = () => {
		if (isLoading || isVerifying) {
			return "Starting voice verification...";
		}
		if (result?.verified) {
			return "Verification successful!";
		}
		if (error) {
			return "Verification failed. Please try again.";
		}
		return "Ready to verify your identity";
	};

	const getStatusDescription = () => {
		if (isLoading || isVerifying) {
			return "Please wait while we prepare the voice verification system.";
		}
		if (result?.verified) {
			return `Your voice has been verified with ${Math.round(
				(result?.confidence || 0) * 100,
			)}% confidence.`;
		}
		if (error) {
			return "There was an issue with the verification process.";
		}
		return "Click the button below to start voice verification.";
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="text-2xl">🎤</span>
						Voice Verification Required
					</DialogTitle>
					<DialogDescription>
						High-risk transaction detected. Please complete voice verification
						to proceed with your purchase.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Risk Assessment */}
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
						<h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
							Risk Assessment Results
						</h3>
						<p className="text-sm text-yellow-700 dark:text-yellow-300">
							Risk Score: {riskLevel}% - Multiple risk factors detected
						</p>
					</div>

					{/* Verification Status */}
					<div className="text-center space-y-4">
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
							{getStatusIcon()}
						</div>
						<div>
							<h3 className="text-lg font-semibold">{getStatusText()}</h3>
							<p className="text-sm text-muted-foreground">
								{getStatusDescription()}
							</p>
						</div>
					</div>

					{/* Verification Details */}
					{result && (
						<div className="border rounded-lg p-4">
							<h4 className="font-semibold mb-2">Verification Details</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span>Confidence Score:</span>
									<span className="font-mono">
										{Math.round((result.confidence || 0) * 100)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span>Session ID:</span>
									<span className="font-mono text-xs">
										{result.sessionId.slice(0, 8)}...
									</span>
								</div>
								{result.details && (
									<>
										{result.details.phraseAccuracy && (
											<div className="flex justify-between">
												<span>Phrase Accuracy:</span>
												<span className="font-mono">
													{Math.round(result.details.phraseAccuracy * 100)}%
												</span>
											</div>
										)}
										{result.details.voiceMatch && (
											<div className="flex justify-between">
												<span>Voice Match:</span>
												<span className="font-mono">
													{Math.round(result.details.voiceMatch * 100)}%
												</span>
											</div>
										)}
									</>
								)}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3">
						{!result?.verified && (
							<button
								onClick={handleVerification}
								disabled={isLoading || isVerifying}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								{isLoading || isVerifying ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Verifying...
									</>
								) : (
									<>
										<Mic className="w-4 h-4" />
										Start Voice Verification
									</>
								)}
							</button>
						)}

						{result?.verified && (
							<button
								onClick={onSuccess}
								className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
							>
								<CheckCircle className="w-4 h-4" />
								Continue to Payment
							</button>
						)}

						<button
							onClick={onClose}
							disabled={isLoading || isVerifying}
							className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
					</div>

					{/* Instructions */}
					<div className="text-xs text-muted-foreground text-center space-y-1">
						<p>✓ Secret phrase verification</p>
						<p>✓ Voice embedding similarity check</p>
						<p>✓ Audio fingerprint validation</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
