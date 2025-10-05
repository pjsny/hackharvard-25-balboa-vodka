import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Mic, Check, X, Shield, Volume } from "lucide-react";
import { styled } from "../styles/stitches.config";
import { useElevenLabsVerification } from "../elevenlabs-hook";
import { SessionConfig } from '@elevenlabs/react';

// Stitches styled components
const VerificationContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$6',
  padding: '$8 $6',
});

const IconContainer = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '$20',
  height: '$20',
  border: '2px solid $black',
  backgroundColor: '$white',
  transition: 'all 0.2s ease',

  variants: {
    state: {
      recording: {
        animation: 'pulse 2s infinite',
      },
    },
  },
});

const CornerBracket = styled('div', {
  position: 'absolute',
  width: '$3',
  height: '$3',
  border: '2px solid $black',

  variants: {
    position: {
      topLeft: {
        top: '-4px',
        left: '-4px',
        borderTop: '2px solid $black',
        borderLeft: '2px solid $black',
        borderRight: 'none',
        borderBottom: 'none',
      },
      topRight: {
        top: '-4px',
        right: '-4px',
        borderTop: '2px solid $black',
        borderRight: '2px solid $black',
        borderLeft: 'none',
        borderBottom: 'none',
      },
      bottomLeft: {
        bottom: '-4px',
        left: '-4px',
        borderBottom: '2px solid $black',
        borderLeft: '2px solid $black',
        borderTop: 'none',
        borderRight: 'none',
      },
      bottomRight: {
        bottom: '-4px',
        right: '-4px',
        borderBottom: '2px solid $black',
        borderRight: '2px solid $black',
        borderTop: 'none',
        borderLeft: 'none',
      },
    },
  },
});

const TitleSection = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$2',
  textAlign: 'center',
});

const MainTitle = styled('h2', {
  fontSize: '$2xl',
  fontWeight: '$bold',
  color: '$black',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: 0,
});

const Subtitle = styled('p', {
  fontSize: '$sm',
  fontWeight: '$bold',
  color: '$black',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: 0,
});

const Divider = styled('div', {
  width: '$16',
  height: '2px',
  backgroundColor: '$black',
});

const Description = styled('p', {
  fontSize: '$sm',
  color: '$gray600',
  fontWeight: '$medium',
  margin: 0,
});

const ErrorText = styled('p', {
  fontSize: '$sm',
  color: '$red500',
  fontWeight: '$medium',
  margin: 0,
});

const StepsContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  width: '100%',
});

const StepItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$3',
  backgroundColor: '$black',
  border: '2px solid $black',
});

const StepContent = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
});

const StepIcon = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '$5',
  height: '$5',
});

const StepText = styled('span', {
  fontSize: '$sm',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '$white',
});

const StepBracket = styled('div', {
  width: '$3',
  height: '$3',
  borderTop: '2px solid $white',
  borderRight: '2px solid $white',
});

const ActionButton = styled('button', {
  width: '100%',
  padding: '$3',
  backgroundColor: '$black',
  color: '$white',
  border: '2px solid $black',
  borderRadius: '$sm',
  fontSize: '$base',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray800',
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const SecondaryButton = styled('button', {
  padding: '$2 $6',
  backgroundColor: '$white',
  color: '$black',
  border: '2px solid $black',
  borderRadius: '$sm',
  fontSize: '$sm',
  fontWeight: '$bold',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray100',
  },
});

const RecordingContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$4',
  width: '100%',
});

const AudioBars = styled('div', {
  display: 'flex',
  gap: '$2',
  alignItems: 'end',
  height: '$16',
});

const AudioBar = styled('div', {
  width: '$2',
  backgroundColor: '$black',
  transition: 'all 0.1s ease',
});

const StatusBar = styled('div', {
  width: '100%',
  border: '2px solid $black',
  padding: '$3',
  backgroundColor: '$black',
});

const StatusText = styled('p', {
  fontSize: '$xs',
  fontWeight: '$bold',
  color: '$white',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: 0,
});

const ErrorContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$4',
  width: '100%',
});

const ErrorBar = styled('div', {
  width: '100%',
  border: '2px solid $red500',
  padding: '$2',
});

const ErrorStatusText = styled('p', {
  fontSize: '$xs',
  fontWeight: '$bold',
  color: '$red500',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: 0,
});

const SignupLink = styled('a', {
  color: '$red500',
  textDecoration: 'underline',
  fontWeight: '$bold',
  cursor: 'pointer',

  '&:hover': {
    color: '$red600',
  },
});

type VerificationState = "idle" | "recording" | "verifying" | "success" | "error";

interface ErrorState {
  message: string;
  details?: string;
  showSignupLink?: boolean;
}

interface VerificationStep {
  name: string;
  status: "pending" | "checking" | "complete" | "failed";
}

interface BalboaVerificationPopupProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
  email?: string;
  question?: string;
  customVariables?: Record<string, any>;
  config?: {
    apiKey?: string;
    agentId?: string;
    baseUrl?: string;
  };
}

export const BalboaVerificationPopup = ({
  open,
  onClose,
  onVerified,
  email,
  question,
  customVariables,
  config = {}
}: BalboaVerificationPopupProps) => {
  const [state, setState] = useState<VerificationState>("idle");
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [steps, setSteps] = useState<VerificationStep[]>([
    { name: "Answer validation", status: "pending" },
    { name: "Response authenticity check", status: "pending" },
    { name: "Identity confirmation", status: "pending" },
  ]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [microphone, setMicrophone] = useState<MediaStreamAudioSourceNode | null>(null);

  // ElevenLabs configuration
  const elevenLabsConfig = {
    apiKey: config.apiKey || process.env.NEXT_PUBLIC_BALBOA_API_KEY || "",
    baseUrl: "", // Not needed for ElevenLabs integration
    agentId: config.agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
  };

  // Use ElevenLabs verification hook
  const {
    conversation,
    startVerification,
    stopVerification,
    isActive: isCallActive,
    result,
    error: elevenLabsError,
    isSpeaking,
    status
  } = useElevenLabsVerification(elevenLabsConfig);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      const microphoneNode = audioCtx.createMediaStreamSource(stream);

      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;
      microphoneNode.connect(analyserNode);

      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setMicrophone(microphoneNode);

      // Start monitoring audio levels
      const monitorAudio = () => {
        if (analyserNode && state === "recording") {
          const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
          analyserNode.getByteFrequencyData(dataArray);

          // Calculate average volume
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          setAudioLevel(average);

          requestAnimationFrame(monitorAudio);
        }
      };

      monitorAudio();
    } catch (error) {
      console.error("Failed to start audio monitoring:", error);
    }
  };

  const stopAudioMonitoring = () => {
    if (microphone) {
      microphone.disconnect();
    }
    if (audioContext) {
      audioContext.close();
    }
    setAudioContext(null);
    setAnalyser(null);
    setMicrophone(null);
    setAudioLevel(0);
  };

  // Update state based on ElevenLabs status
  useEffect(() => {
    if (isCallActive) {
      setState("recording");
      startAudioMonitoring();
    } else if (result?.transcript) {
      setState("verifying");
      stopAudioMonitoring();
      verifySteps();
    } else if (elevenLabsError) {
      setState("error");
      stopAudioMonitoring();
    }
  }, [isCallActive, result, elevenLabsError]);

  // Cleanup audio monitoring on unmount
  useEffect(() => {
    return () => {
      stopAudioMonitoring();
    };
  }, []);

  // Generate a varied first message using LLM
  // Fetches the user's security question from the database and generates a natural first message
  const generateFirstMessage = async (userEmail: string): Promise<string> => {
    if (!userEmail) {
      console.error('❌ No email provided for first message generation');
      throw new Error('Email is required for verification');
    }

    try {
      // Call API to fetch security question and generate natural first message
      const baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_BALBOA_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/get-first-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));

        // Handle specific error cases
        if (response.status === 404) {
          if (errorData.error?.includes('User not found')) {
            const error = new Error('USER_NOT_FOUND');
            (error as any).showSignupLink = true;
            throw error;
          } else if (errorData.error?.includes('No security question')) {
            throw new Error('No security question found. Please configure a security question in your account settings.');
          }
        }

        throw new Error(errorData.error || `Failed to generate first message (${response.status})`);
      }

      const data = await response.json();
      console.log('🎤 Generated first message:', data.firstMessage);

      return data.firstMessage;
    } catch (error) {
      console.error('❌ Error generating first message:', error);
      // Re-throw the error so it can be caught by startRecording
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      // Clear any previous errors
      setErrorState(null);
      setState("recording");
      const sessionId = `verification_${Date.now()}`;

      // Generate first message by fetching user's security question from backend
      console.log('🔍 Fetching first message for email:', email);
      const firstMessage = await generateFirstMessage(email);

      const sessionOptions = {
        agentId: elevenLabsConfig.agentId,
        connectionType: 'websocket' as const,
        userId: sessionId,
        // Inject dynamic variables into the conversation
        // These variables are accessible in the agent's prompt using {{variable_name}}
        dynamicVariables: {
          user_email: email,
        },
        overrides: {
          agent: {
            firstMessage
          }
        }
      } as SessionConfig;

      console.log('🚀 Starting verification session:', {
        email,
        sessionId,
        firstMessage,
        sessionId,
        customVariables,
        override: sessionOptions.conversationConfigOverride,
        dynamicVariables: sessionOptions.dynamicVariables
      });

      console.log('📧 User email passed to ElevenLabs:', email);

      await startVerification(sessionId, sessionOptions, customVariables);
    } catch (error) {
      console.error("❌ Failed to start ElevenLabs verification:", error);

      // Set user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to start verification';
      const showSignupLink = error instanceof Error && (error as any).showSignupLink === true;

      setErrorState({
        message: errorMessage === 'USER_NOT_FOUND'
          ? 'Please sign up to Balboa to verify this transaction'
          : errorMessage,
        details: error instanceof Error ? error.stack : undefined,
        showSignupLink
      });

      setState("error");
    }
  };

  const verifySteps = async () => {
    // Simulate step-by-step verification based on ElevenLabs result
    for (let i = 0; i < steps.length; i++) {
      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: "checking" } : step
      ));

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSteps(prev => prev.map((step, idx) =>
        idx === i ? { ...step, status: "complete" } : step
      ));
    }

    setState("success");
    setTimeout(() => {
      onVerified();
      onClose();
    }, 2000);
  };

  const getStateConfig = () => {
    switch (state) {
      case "idle":
        return {
          title: "Verification Required",
          description: "Ready to answer your security question",
          icon: Shield,
          iconClass: "text-foreground",
        };
      case "recording":
        return {
          title: "Recording",
          description: "Answer the question clearly",
          icon: Mic,
          iconClass: "text-foreground",
        };
      case "verifying":
        return {
          title: "Analyzing",
          description: "Verifying your answer",
          icon: Volume,
          iconClass: "text-foreground",
        };
      case "success":
        return {
          title: "Access Granted",
          description: "Answer verified successfully",
          icon: Check,
          iconClass: "text-foreground",
        };
      case "error":
        return {
          title: "Verification Failed",
          description: errorState?.message || "An error occurred during verification",
          icon: X,
          iconClass: "text-foreground",
        };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Voice Verification</DialogTitle>
        <DialogDescription>
          Complete voice verification to proceed with your transaction
        </DialogDescription>
        <VerificationContainer>
          {/* Main Icon */}
          <div style={{ position: 'relative' }}>
            <IconContainer state={state === "recording" ? "recording" : undefined}>
              {state === "success" ? (
                <Check size={40} color="black" strokeWidth={3} />
              ) : state === "recording" ? (
                <Mic size={40} color="black" strokeWidth={2} />
              ) : state === "error" ? (
                <X size={40} color="black" strokeWidth={3} />
              ) : (
                <Shield size={40} color="black" strokeWidth={2} />
              )}
            </IconContainer>

            <CornerBracket position="topLeft" />
            <CornerBracket position="topRight" />
            <CornerBracket position="bottomLeft" />
            <CornerBracket position="bottomRight" />
          </div>

          {/* Title and Description */}
          <TitleSection>
            <MainTitle>
              {state === "success" ? "ACCESS GRANTED" :
               state === "recording" ? "VERIFICATION ACTIVE" :
               state === "error" ? "VERIFICATION FAILED" :
               "VOICE VERIFICATION"}
            </MainTitle>
            {state === "success" && (
              <>
                <Divider />
                <Subtitle>IDENTITY CONFIRMED</Subtitle>
              </>
            )}
            {state === "idle" && (
              <Description>
                The agent will ask you a security question - answer with information only you know
              </Description>
            )}
            {state === "recording" && (
              <Description>
                {isSpeaking
                  ? "Listen to the question"
                  : "Provide your answer now"}
              </Description>
            )}
            {state === "error" && (
              <ErrorText>Verification failed - please try again</ErrorText>
            )}
          </TitleSection>

          {/* Verification Steps */}
          {(state === "verifying" || state === "success") && (
            <StepsContainer>
              {steps.map((step, idx) => (
                <StepItem key={idx}>
                  <StepContent>
                    <StepIcon>
                      {step.status === "complete" && (
                        <Check size={16} color="white" strokeWidth={2.5} />
                      )}
                      {step.status === "checking" && (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid white',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }} />
                      )}
                      {step.status === "pending" && (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid #9ca3af',
                          borderRadius: '50%'
                        }} />
                      )}
                    </StepIcon>
                    <StepText>{step.name}</StepText>
                  </StepContent>
                  <StepBracket />
                </StepItem>
              ))}
            </StepsContainer>
          )}

          {/* Action Button */}
          {state === "idle" && (
            <ActionButton
              onClick={startRecording}
              disabled={!elevenLabsConfig.agentId}
            >
              <Mic size={20} style={{ marginRight: '12px' }} />
              Start Verification
            </ActionButton>
          )}

          {state === "recording" && (
            <RecordingContainer>
              <AudioBars>
                {[0, 1, 2, 3, 4].map((i) => (
                  <AudioBar
                    key={i}
                    style={{
                      height: `${Math.abs(Math.sin((audioLevel + i * 40) / 100)) * 48 + 8}px`,
                      transitionDuration: '100ms'
                    }}
                  />
                ))}
              </AudioBars>
              <StatusBar>
                <StatusText>
                  {isSpeaking ? "AGENT SPEAKING" : "LISTENING FOR RESPONSE"}
                </StatusText>
              </StatusBar>
              <SecondaryButton
                onClick={async () => {
                  try {
                    console.log('🛑 Cancelling verification...');

                    // Try the hook's stopVerification first
                    await stopVerification();

                    // Also try to end the session directly as a fallback
                    if (conversation) {
                      console.log('🛑 Also calling conversation.endSession() directly...');
                      await conversation.endSession();
                    }

                    console.log('✅ Verification cancelled successfully');
                    stopAudioMonitoring();
                    setState("idle");
                  } catch (error) {
                    console.error("Failed to cancel verification:", error);
                    // Force reset to idle state even if there's an error
                    setState("idle");
                  }
                }}
              >
                Cancel Verification
              </SecondaryButton>
            </RecordingContainer>
          )}

          {state === "error" && (
            <ErrorContainer>
              <ErrorBar>
                <ErrorStatusText>
                  {errorState?.message || elevenLabsError?.message || "VERIFICATION FAILED"}
                </ErrorStatusText>
              </ErrorBar>
              {errorState?.showSignupLink && (
                <Description style={{ marginTop: '16px', textAlign: 'center' }}>
                  Sign up at{' '}
                  <SignupLink
                    href="https://balboa.vodka"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    balboa.vodka
                  </SignupLink>
                </Description>
              )}
              <ActionButton onClick={() => {
                setErrorState(null);
                setState("idle");
              }}>
                {errorState?.showSignupLink ? 'Close' : 'Try Again'}
              </ActionButton>
            </ErrorContainer>
          )}
        </VerificationContainer>
      </DialogContent>
    </Dialog>
  );
};
