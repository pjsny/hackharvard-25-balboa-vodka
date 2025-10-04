import { useCallback, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { createBalboaError } from "./errors";
import type { BalboaConfig, ElevenLabsCallResult } from "./types";

/**
 * React hook for ElevenLabs voice verification
 */
export function useElevenLabsVerification(config: BalboaConfig) {
	console.log('🔧 ElevenLabs Hook Initialized');
	console.log('📋 Config:', {
		apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'MISSING',
		baseUrl: config.baseUrl,
		agentId: config.agentId ? `${config.agentId.substring(0, 8)}...` : 'MISSING',
		environment: config.environment,
		timeout: config.timeout,
	});
	console.log('🌍 Environment Variables:', {
		NEXT_PUBLIC_ELEVENLABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ? `${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID.substring(0, 8)}...` : 'MISSING',
		NEXT_PUBLIC_BALBOA_API_KEY: process.env.NEXT_PUBLIC_BALBOA_API_KEY ? `${process.env.NEXT_PUBLIC_BALBOA_API_KEY.substring(0, 8)}...` : 'MISSING',
		NEXT_PUBLIC_BALBOA_API_URL: process.env.NEXT_PUBLIC_BALBOA_API_URL || 'MISSING',
	});

	const [state, setState] = useState<{
		isActive: boolean;
		result: ElevenLabsCallResult | null;
		error: Error | null;
	}>({
		isActive: false,
		result: null,
		error: null,
	});

	const conversation = useConversation({
		onConnect: () => {
			console.log('✅ ElevenLabs conversation connected');
			console.log('🎯 Waiting for agent to send first message...');
			console.log('📊 Conversation object:', conversation);
		},
		onDisconnect: () => {
			console.log('❌ ElevenLabs conversation disconnected');
			console.log('📊 Final state:', state);
			setState(prev => ({ 
				...prev, 
				isActive: false,
				result: prev.result ? {
					...prev.result,
					duration: Math.floor((Date.now() - ((prev.result as any).startTime || Date.now())) / 1000)
				} : null
			}));
		},
		onMessage: (message: any) => {
			console.log('💬 ElevenLabs message received:', message);
			console.log('📝 Message details:', {
				type: message.type,
				content: message.content,
				timestamp: new Date().toISOString(),
				fullMessage: message
			});
			
			// Store messages for transcript
			if (message.type === 'user' && message.content) {
				console.log('👤 User message:', message.content);
				setState(prev => ({
					...prev,
					result: prev.result ? {
						...prev.result,
						transcript: (prev.result.transcript + ' ' + message.content).trim()
					} : null
				}));
			}
			if (message.type === 'assistant' && message.content) {
				console.log('🤖 Assistant message:', message.content);
				setState(prev => ({
					...prev,
					result: prev.result ? {
						...prev.result,
						summary: (prev.result.summary + ' ' + message.content).trim()
					} : null
				}));
			}
		},
		onError: (error: any) => {
			console.error('🚨 ElevenLabs error:', error);
			console.error('🚨 Error details:', {
				message: error.message,
				stack: error.stack,
				name: error.name,
				fullError: error
			});
			setState(prev => ({ 
				...prev, 
				isActive: false, 
				error: createBalboaError(
					`ElevenLabs conversation error: ${error.message || error}`,
					"ELEVENLABS_ERROR",
					error,
				)
			}));
		},
		onAudio: (audioData: any) => {
			console.log('🎵 Audio data received:', audioData);
		},
		onModeChange: (mode: any) => {
			console.log('🔄 ElevenLabs mode changed:', mode);
			// Check if agent is speaking
			if (mode === 'speaking') {
				console.log('🎙️ Agent is now speaking - check your audio output!');
			} else if (mode === 'listening') {
				console.log('👂 Agent is now listening for user input');
			}
		},
		onStatusChange: (status: any) => {
			console.log('📡 ElevenLabs status changed:', status);
			console.log('📊 Status details:', {
				status: status.status,
				timestamp: new Date().toISOString(),
				fullStatus: status
			});
		},
	});

	const startVerification = useCallback(
		async (sessionId: string, sessionOptions?: any): Promise<ElevenLabsCallResult> => {
			console.log('🚀 Starting ElevenLabs verification...');
			console.log('📋 Session details:', {
				sessionId,
				sessionOptions,
				timestamp: new Date().toISOString()
			});
			
			try {
				// Initialize result state
				const startTime = Date.now();
				const initialResult: ElevenLabsCallResult & { startTime: number } = {
					callId: '',
					recording: '',
					transcript: '',
					summary: 'Voice verification started',
					duration: 0,
					startTime,
				};
				
				console.log('📊 Initial result state:', initialResult);
				setState({ isActive: true, result: initialResult, error: null });

				// Request microphone access
				console.log('🎤 Requesting microphone access...');
				const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
				console.log('✅ Microphone access granted:', {
					audioTracks: mediaStream.getAudioTracks().length,
					trackSettings: mediaStream.getAudioTracks()[0]?.getSettings()
				});
				
				// Start the conversation session with provided options
				const sessionConfig = {
					...sessionOptions,
					userId: sessionId,
				};
				
				console.log('🎯 Starting conversation session with config:', sessionConfig);
				console.log('📊 Conversation object before startSession:', conversation);
				
				const conversationId = await conversation.startSession(sessionConfig);
				
				console.log('✅ Conversation session started:', {
					conversationId,
					timestamp: new Date().toISOString(),
					sessionConfig
				});

				// Update result with conversation ID
				const resultWithId = { ...initialResult, callId: conversationId };
				setState(prev => ({ ...prev, result: resultWithId }));
				
				console.log('📊 Updated result state:', resultWithId);

				// Don't return immediately - let the conversation run
				// The result will be updated via callbacks
				return resultWithId;
			} catch (error) {
				console.error('🚨 Failed to start ElevenLabs conversation:', error);
				console.error('🚨 Error details:', {
					message: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					name: error instanceof Error ? error.name : undefined,
					fullError: error
				});
				
				const balboaError = createBalboaError(
					`Failed to start ElevenLabs conversation: ${getErrorMessage(error)}`,
					"ELEVENLABS_ERROR",
					error instanceof Error ? error : undefined,
				);
				setState({ isActive: false, result: null, error: balboaError });
				throw balboaError;
			}
		},
		[conversation, config],
	);

	const stopVerification = useCallback(async () => {
		console.log('🛑 Stopping ElevenLabs verification...');
		console.log('📊 Current state before stop:', state);
		
		try {
			if (conversation) {
				console.log('📊 Conversation object before endSession:', conversation);
				await conversation.endSession();
				console.log('✅ Conversation session ended successfully');
				setState(prev => ({ ...prev, isActive: false }));
			} else {
				console.log('⚠️ No conversation object to stop');
			}
		} catch (error) {
			console.warn("🚨 Error stopping ElevenLabs conversation:", error);
			console.warn("🚨 Stop error details:", {
				message: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				fullError: error
			});
			setState(prev => ({ ...prev, isActive: false }));
		}
	}, [conversation, state]);

	return {
		conversation,
		startVerification,
		stopVerification,
		isActive: state.isActive,
		result: state.result,
		error: state.error,
		isSpeaking: conversation.isSpeaking,
		status: conversation.status,
	};
}

/**
 * Get the system message for the assistant
 */
function getSystemMessage(): string {
	return `
    You are Balboa, a professional voice verification assistant for e-commerce fraud prevention.

    Your task:
    1. Greet the user warmly and professionally
    2. Explain that you need to verify their identity
    3. Ask them to say: "Balboa verification complete"
    4. Confirm you heard them correctly
    5. Thank them and end the call

    Guidelines:
    - Keep the conversation under 30 seconds
    - Be professional but friendly
    - Speak clearly and at a moderate pace
    - If you don't hear the phrase clearly, ask them to repeat it once
    - End the call immediately after verification

    Do not ask for any personal information or engage in small talk.
  `.trim();
}

/**
 * Helper function to get error message
 */
function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "Unknown error";
}
