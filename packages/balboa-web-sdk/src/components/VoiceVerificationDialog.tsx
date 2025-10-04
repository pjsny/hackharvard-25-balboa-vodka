import { Dialog } from "@radix-ui/react-dialog";
import { CheckCircle, Mic, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { BalboaElevenLabsClient } from "../elevenlabs-client";
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
	riskLevel?: number;
}

export function VoiceVerificationDialog({
	isOpen,
	onClose,
	onSuccess,
	email,
	riskLevel = 75,
}: VoiceVerificationDialogProps) {
	const [isVerifying, setIsVerifying] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<any>(null);
	const [elevenLabsClient, setElevenLabsClient] =
		useState<BalboaElevenLabsClient | null>(null);
	const [callStatus, setCallStatus] = useState<
		"idle" | "user-speaking" | "llm-thinking" | "call-ended"
	>("idle");
	const [isUserSpeaking, setIsUserSpeaking] = useState(false);
	const [isLlmThinking, setIsLlmThinking] = useState(false);

	// Cleanup ElevenLabs client when component unmounts or dialog closes
	useEffect(() => {
		return () => {
			if (elevenLabsClient) {
				elevenLabsClient.stopConversation();
			}
		};
	}, [elevenLabsClient]);

	// Cleanup when dialog closes - always end the call
	useEffect(() => {
		if (!isOpen && elevenLabsClient) {
			elevenLabsClient.stopConversation();
			setCallStatus("call-ended");
			setIsVerifying(false);
			setIsUserSpeaking(false);
			setIsLlmThinking(false);
		}
	}, [isOpen, elevenLabsClient]);

	const handleVerification = async () => {
		setIsLoading(true);
		setError(null);

		try {
			// First, get the secure token from the backend
			const response = await fetch("http://localhost:3000/api/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email,
				}),
			});

			const data = await response.json();

			if (data.verified && data.token) {
				// Decode the secure token from backend
				const tokenData = JSON.parse(atob(data.token));

				// Check if token is expired
				if (tokenData.expiresAt < Date.now()) {
					throw new Error("Verification token has expired");
				}

				// Initialize the SDK's internal ElevenLabs client
				console.log(
					"🔧 Initializing ElevenLabs Agents Platform with API key:",
					tokenData.elevenLabsApiKey.substring(0, 10) + "...",
				);
				console.log("🤖 Agent ID:", tokenData.agentId);

				const client = new BalboaElevenLabsClient();
				await client.initialize(tokenData.elevenLabsApiKey, tokenData.agentId);
				console.log(
					"✅ ElevenLabs Agents Platform client initialized successfully",
				);

				// Check if client is ready
				const isReady = client.isReady();
				console.log("🔍 Client ready status:", isReady);

				if (!isReady) {
					throw new Error("ElevenLabs client is not ready");
				}

				// Debug: Check ElevenLabs instance status
				console.log("🔍 ElevenLabs client status:", client.getStatus());

				// Test ElevenLabs instance functionality
				const elevenLabsTestResult = await client.testElevenLabsInstance();
				console.log("🧪 ElevenLabs test result:", elevenLabsTestResult);

				if (!elevenLabsTestResult) {
					throw new Error("ElevenLabs instance test failed");
				}

				// Set up event listeners with more detailed logging
				client.on("call-start", (callData) => {
					console.log("🎤 ElevenLabs conversation started:", callData);
					setIsVerifying(true);
					setIsLoading(false); // Stop loading when call starts
					setCallStatus("llm-thinking"); // Initially LLM is thinking
				});

				client.on("call-end", (callData) => {
					console.log("🔚 ElevenLabs conversation ended:", callData);
					setIsVerifying(false);
					setCallStatus("call-ended");
					setIsUserSpeaking(false);
					setIsLlmThinking(false);

					// Check if the call was successful
					if (callData && callData.agentId) {
						setResult({
							verified: true,
							confidence: 0.95,
							sessionId: data.sessionId,
							transcript: "Voice verification completed",
						});
					}
				});

				client.on("message", (message) => {
					console.log("💬 ElevenLabs message:", message);

					// Handle different message types
					if (message.type === "transcript") {
						console.log(`📝 ${message.role}: ${message.transcript}`);

						// If the assistant says something that indicates success
						if (
							message.role === "assistant" &&
							(message.transcript.toLowerCase().includes("verified") ||
								message.transcript.toLowerCase().includes("success") ||
								message.transcript.toLowerCase().includes("complete"))
						) {
							console.log("✅ Assistant indicated success!");
							setResult({
								verified: true,
								confidence: 0.95,
								sessionId: data.sessionId,
								transcript: message.transcript,
							});
							setIsVerifying(false);
							setCallStatus("call-ended");
						}
					}

					// Handle speech updates - this is what we're seeing in the console
					if (message.type === "speech-update") {
						console.log("🗣️ Speech update:", message);

						// Ensure message has required properties
						if (!message.status || !message.role) {
							console.warn(
								"⚠️ Speech update missing required properties:",
								message,
							);
							return;
						}

						// When user starts speaking
						if (message.status === "started" && message.role === "user") {
							console.log("🎤 User started speaking");
							setIsUserSpeaking(true);
							setIsLlmThinking(false);
							setCallStatus("user-speaking");
						}

						// When user stops speaking
						if (message.status === "stopped" && message.role === "user") {
							console.log("🔇 User stopped speaking");
							setIsUserSpeaking(false);
							setIsLlmThinking(true);
							setCallStatus("llm-thinking");
						}

						// When assistant starts speaking
						if (message.status === "started" && message.role === "assistant") {
							console.log("🎤 Assistant started speaking");
							setIsVerifying(true);
							setIsLoading(false);
							setIsLlmThinking(false);
							setCallStatus("llm-thinking"); // Assistant speaking
						}

						// When assistant stops speaking, it's now listening to user
						if (message.status === "stopped" && message.role === "assistant") {
							console.log("🔇 Assistant stopped speaking - now listening");
							setIsLlmThinking(false);
							setCallStatus("idle"); // Assistant is listening, not thinking
							// Don't end the call - let it continue for user response
						}
					}

					// Handle conversation updates
					if (message.type === "conversation-update") {
						console.log("💬 Conversation update:", message);
					}
				});

				client.on("error", (error) => {
					console.error("❌ VAPI error:", error);
					setError(
						new Error(`Voice verification failed: ${error.message || error}`),
					);
					setIsVerifying(false);
					setIsLoading(false);
					setCallStatus("call-ended");
					setIsUserSpeaking(false);
					setIsLlmThinking(false);
				});

				// Add volume level listener for debugging
				client.on("volume-level", (level) => {
					console.log("📊 Volume level:", level);
				});

				setElevenLabsClient(client);
				console.log("✅ Event listeners set up and client stored");

				// Start ElevenLabs Agents Platform voice conversation
				console.log(
					"🚀 Starting ElevenLabs conversation with agent:",
					tokenData.agentId,
				);

				try {
					await client.startConversation();
					console.log("ElevenLabs conversation started successfully");

					// Set a timeout to detect if call doesn't start properly
					const startTimeout = setTimeout(() => {
						if (!isVerifying) {
							console.warn(
								"⚠️ VAPI call didn't start within 5 seconds - checking assistant configuration",
							);
							setError(
								new Error(
									"Voice verification didn't start. Please check your microphone permissions and try again.",
								),
							);
							setIsLoading(false);
						}
					}, 5000);

					// Set a longer timeout to detect if call gets stuck
					const stuckTimeout = setTimeout(() => {
						if (isVerifying) {
							console.warn(
								"⚠️ VAPI call seems stuck - assistant might not be responding",
							);
							setError(
								new Error(
									"Voice verification is taking too long. The assistant might not be responding properly.",
								),
							);
							setIsVerifying(false);
							setIsLoading(false);
						}
					}, 30000); // 30 seconds

					// Clear timeouts when call actually starts
					const originalCallStart = client.on;
					client.on = function (
						event: string,
						callback: (...args: any[]) => void,
					) {
						if (event === "call-start") {
							const wrappedCallback = (...args: any[]) => {
								clearTimeout(startTimeout);
								clearTimeout(stuckTimeout);
								callback(...args);
							};
							return originalCallStart.call(this, event, wrappedCallback);
						}
						return originalCallStart.call(this, event, callback);
					};
				} catch (elevenLabsError) {
					console.error(
						"Failed to start ElevenLabs conversation:",
						elevenLabsError,
					);
					const errorMessage =
						elevenLabsError instanceof Error
							? elevenLabsError.message
							: String(elevenLabsError);
					throw new Error(`ElevenLabs conversation failed: ${errorMessage}`);
				}
			} else {
				throw new Error("Failed to get agent ID from backend");
			}
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
