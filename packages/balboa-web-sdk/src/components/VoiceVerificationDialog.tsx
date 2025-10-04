import { Dialog } from "@radix-ui/react-dialog";
import { CheckCircle, Mic, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./styled/Button";
import {
	DialogCloseButton,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "./styled/Dialog";
import { IconContainer, Spinner, StatusIcon } from "./styled/Icon";
import {
	ButtonGroup,
	Container,
	Divider,
	FlexCol,
	FlexRow,
	Footer,
	StatusDescription,
	StatusDot,
	StatusSection,
	StatusTitle,
	StepContainer,
	StepItem,
	StepList,
	StepTitle,
} from "./styled/Layout";

interface VoiceVerificationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	email: string;
}

export function VoiceVerificationDialog({
	isOpen,
	onClose,
	onSuccess,
	email,
}: VoiceVerificationDialogProps) {
	const [isVerifying, setIsVerifying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<any>(null);
	const [callStatus, setCallStatus] = useState<
		"idle" | "user-speaking" | "llm-thinking" | "call-ended"
	>("idle");
	const [isUserSpeaking, setIsUserSpeaking] = useState(false);
	const [isLlmThinking, setIsLlmThinking] = useState(false);

	// Cleanup when dialog closes
	useEffect(() => {
		if (!isOpen) {
			setCallStatus("call-ended");
			setIsVerifying(false);
			setIsUserSpeaking(false);
			setIsLlmThinking(false);
		}
	}, [isOpen]);

	const handleVerification = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// Simulate voice verification process
			setIsVerifying(true);
			setCallStatus("llm-thinking");
			
			// Simulate processing time
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Simulate successful verification
			setResult({
				verified: true,
				confidence: 0.95,
				sessionId: `session_${Date.now()}`,
				transcript: "Voice verification completed",
			});
			
			setIsVerifying(false);
			setCallStatus("call-ended");
			setIsLoading(false);
		} catch (error) {
			console.error("Verification failed:", error);
			setError(error);
			setIsLoading(false);
		}
	};

	const getStatusIcon = () => {
		if (callStatus === "call-ended") {
			return (
				<IconContainer status="call-ended">
					<StatusIcon color="red">
						<XCircle size={20} />
					</StatusIcon>
				</IconContainer>
			);
		}
		if (callStatus === "user-speaking") {
			return (
				<IconContainer status="user-speaking">
					<StatusIcon color="green" animated>
						<Mic size={20} />
					</StatusIcon>
				</IconContainer>
			);
		}
		if (callStatus === "llm-thinking") {
			return (
				<IconContainer status="llm-thinking">
					<StatusIcon color="blue" animated>
						<Mic size={20} />
					</StatusIcon>
				</IconContainer>
			);
		}
		if (result?.verified) {
			return (
				<IconContainer status="success">
					<StatusIcon color="green">
						<CheckCircle size={20} />
					</StatusIcon>
				</IconContainer>
			);
		}
		if (error) {
			return (
				<IconContainer status="error">
					<StatusIcon color="red">
						<XCircle size={20} />
					</StatusIcon>
				</IconContainer>
			);
		}
		return (
			<IconContainer status="idle">
				<StatusIcon color="gray">
					<Mic size={20} />
				</StatusIcon>
			</IconContainer>
		);
	};

	const getStatusText = () => {
		if (callStatus === "call-ended") {
			return "Call ended successfully";
		}
		if (callStatus === "user-speaking") {
			return "You are speaking...";
		}
		if (callStatus === "llm-thinking") {
			return "Assistant is speaking...";
		}
		if (isLoading) {
			return "Starting voice verification...";
		}
		if (result?.verified) {
			return "Verification successful!";
		}
		if (error) {
			return "Verification failed. Please try again.";
		}
		return "Listening...";
	};

	const getStatusDescription = () => {
		if (callStatus === "call-ended") {
			return "The voice verification call has been completed.";
		}
		if (callStatus === "user-speaking") {
			return "Please continue speaking naturally.";
		}
		if (callStatus === "llm-thinking") {
			return "The assistant is speaking to you.";
		}
		if (isLoading) {
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
		return "The assistant is listening for your response.";
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogOverlay />
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Voice Verification</DialogTitle>
					<DialogDescription>
						Complete your secure purchase with voice verification
					</DialogDescription>
				</DialogHeader>

				<Container>
					{/* Progress Steps */}
					<FlexRow>
						{/* Step 1: Get started */}
						<StepContainer>
							<IconContainer status="idle">
								<StatusIcon color="gray">
									<Mic size={20} />
								</StatusIcon>
							</IconContainer>
							<StepTitle>Get started.</StepTitle>
							<StepList>
								<StepItem>
									<StatusDot status="active" />
									<span>Connect to voice verification</span>
								</StepItem>
								<StepItem>
									<StatusDot status="active" />
									<span>Enable microphone access</span>
								</StepItem>
								<StepItem>
									<StatusDot status="active" />
									<span>Start verification process</span>
								</StepItem>
							</StepList>
						</StepContainer>

						<Divider />

						{/* Step 2: Get comfortable */}
						<StepContainer>
							{getStatusIcon()}
							<StepTitle>Get comfortable.</StepTitle>
							<StepList>
								<StepItem>
									<StatusDot status="active" />
									<span>Listen to assistant prompts</span>
								</StepItem>
								<StepItem>
									<StatusDot status="active" />
									<span>Respond naturally</span>
								</StepItem>
								<StepItem>
									<StatusDot status="active" />
									<span>Complete verification</span>
								</StepItem>
							</StepList>
						</StepContainer>

						<Divider />

						{/* Step 3: Complete */}
						<StepContainer>
							<IconContainer status={result?.verified ? "success" : "idle"}>
								<StatusIcon color={result?.verified ? "green" : "gray"}>
									<CheckCircle size={20} />
								</StatusIcon>
							</IconContainer>
							<StepTitle>Complete.</StepTitle>
							<StepList>
								<StepItem>
									<StatusDot
										status={result?.verified ? "active" : "inactive"}
									/>
									<span>Verification successful</span>
								</StepItem>
								<StepItem>
									<StatusDot
										status={result?.verified ? "active" : "inactive"}
									/>
									<span>Transaction approved</span>
								</StepItem>
								<StepItem>
									<StatusDot
										status={result?.verified ? "active" : "inactive"}
									/>
									<span>Continue to payment</span>
								</StepItem>
							</StepList>
						</StepContainer>
					</FlexRow>

					{/* Status Message */}
					<StatusSection>
						<StatusTitle>{getStatusText()}</StatusTitle>
						<StatusDescription>{getStatusDescription()}</StatusDescription>
					</StatusSection>

					{/* Action Buttons */}
					<ButtonGroup>
						{!result?.verified && callStatus !== "call-ended" && (
							<Button
								onClick={handleVerification}
								disabled={isLoading || isVerifying}
								variant="secondary"
								size="md"
								fullWidth
							>
								{isLoading ? (
									<>
										<Spinner />
										Starting...
									</>
								) : (
									<>
										<Mic size={16} />
										Start Voice Verification
									</>
								)}
							</Button>
						)}

						{result?.verified && (
							<Button onClick={onSuccess} variant="success" size="md" fullWidth>
								<CheckCircle size={16} />
								Continue to Payment
							</Button>
						)}

						<Button
							onClick={onClose}
							disabled={isLoading}
							variant="secondary"
							size="md"
						>
							{callStatus === "call-ended" ? "Close" : "Cancel"}
						</Button>
					</ButtonGroup>

					{/* Footer */}
					<Footer>
						<p>
							Three* ways we secure your transaction with voice verification.
						</p>
						<p>*there are many more, but we thought we'd ease you into it.</p>
					</Footer>
				</Container>
			</DialogContent>
		</Dialog>
	);
}
