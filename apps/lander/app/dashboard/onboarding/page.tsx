"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useElevenLabsVerification } from "@balboa/web";
import { useAuth } from "~/lib/use-auth";

export default function OnboardingPage(): JSX.Element {
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuth();

  // ElevenLabs configuration
  const config = {
    apiKey: process.env.NEXT_PUBLIC_BALBOA_API_KEY || "",
    baseUrl: process.env.NEXT_PUBLIC_BALBOA_API_URL || "",
    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
  };

  const {
    startVerification,
    stopVerification,
    isActive: isCallActive,
    result,
    error,
    isSpeaking,
    status
  } = useElevenLabsVerification(config);

  const startElevenLabsCall = async () => {
    console.log('🚀 Starting ElevenLabs call from onboarding page...');
    console.log('🌍 Environment check:', {
      NEXT_PUBLIC_ELEVENLABS_AGENT_ID: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ? `${process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID.substring(0, 8)}...` : 'MISSING',
      NEXT_PUBLIC_BALBOA_API_KEY: process.env.NEXT_PUBLIC_BALBOA_API_KEY ? `${process.env.NEXT_PUBLIC_BALBOA_API_KEY.substring(0, 8)}...` : 'MISSING',
      NEXT_PUBLIC_BALBOA_API_URL: process.env.NEXT_PUBLIC_BALBOA_API_URL || 'MISSING',
    });
    
    try {
      const sessionId = `onboarding-${Date.now()}`;
      console.log('📋 Generated session ID:', sessionId);
      
      const sessionOptions = {
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: 'websocket' as const,
        userId: sessionId
      };
      
      // Custom variables for onboarding - only user ID needed
      const customVariables = {
        user: user?.id || 'unknown'
      };
      
      console.log('🎯 Session options:', sessionOptions);
      console.log('📊 Custom variables:', customVariables);
      
      // For public agents, we can use agentId directly
      const result = await startVerification(sessionId, sessionOptions, customVariables);
      console.log('✅ ElevenLabs verification started successfully:', result);
    } catch (error) {
      console.error('🚨 Failed to start ElevenLabs call:', error);
      console.error('🚨 Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
    }
  };

  const endElevenLabsCall = async () => {
    console.log('🛑 Ending ElevenLabs call from onboarding page...');
    console.log('📊 Current hook state:', { isCallActive, status, result, error });
    
    try {
      await stopVerification();
      setIsMuted(false);
      console.log('✅ ElevenLabs call ended manually');
    } catch (error) {
      console.error('🚨 Failed to end call:', error);
      console.error('🚨 End call error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error
      });
    }
  };

  const toggleMute = async () => {
    // Note: ElevenLabs mute functionality would need to be implemented
    // For now, we'll just toggle the UI state
    setIsMuted(!isMuted);
    console.log(isMuted ? 'Unmuted' : 'Muted');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0 balboa-gradient">
        {/* Subtle accent lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-balboa-accent to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent"></div>
        </div>
        
        {/* Subtle corner accents */}
        <div className="absolute top-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow"></div>
        <div className="absolute top-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-4 left-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 balboa-accent rounded-full opacity-60 animate-subtle-glow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Friendly Title */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold balboa-text-primary mb-4 tracking-wide">
              BALBOA
            </h1>
            <div className="text-2xl font-semibold balboa-text-secondary mb-2 tracking-wide">
              VOICE VERIFICATION
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent mx-auto mb-6"></div>
            <p className="text-lg balboa-text-secondary font-medium max-w-2xl mx-auto leading-relaxed">
              Welcome! Let's set up your voice verification. This quick process will help secure your account with your unique voice pattern.
            </p>
            <p className="text-base balboa-text-muted font-medium max-w-xl mx-auto leading-relaxed mt-4">
              Simply speak naturally when prompted - we'll guide you through each step.
            </p>
          </div>
            
          {/* Call Control Buttons */}
          <div className="flex flex-col items-center space-y-8">
            {status === 'connecting' ? (
              // Connecting State - Professional Loading
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Button 
                    disabled
                    className="relative balboa-surface-elevated border balboa-border balboa-text-primary font-semibold py-6 px-12 text-lg rounded-lg shadow-lg transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-balboa-accent border-t-transparent rounded-full animate-loading-spinner"></div>
                      <span className="tracking-wide">CONNECTING...</span>
                    </span>
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold balboa-accent tracking-wide">
                    ESTABLISHING SECURE CONNECTION
                  </p>
                  <p className="text-sm font-medium balboa-text-muted mt-2">
                    Initializing voice verification protocol...
                  </p>
                </div>
              </div>
              ) : !isCallActive ? (
                // Start Call Button - Professional Design
                <div className="relative">
                  <Button 
                    onClick={startElevenLabsCall}
                    className="relative balboa-accent-gradient text-black font-semibold py-8 px-16 text-xl rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-balboa-accent"
                  >
                    <span className="relative z-30 flex items-center space-x-4">
                      <span className="tracking-wide">START VOICE SETUP</span>
                    </span>
                  </Button>
                </div>
              ) : (
                // Call Active State - Professional Controls
                <div className="flex flex-col items-center space-y-8">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold balboa-accent mb-2 tracking-wide">
                      VOICE SETUP IN PROGRESS
                    </div>
                    <div className="text-lg font-medium balboa-text-secondary">
                      Please speak naturally - we're learning your voice pattern
                    </div>
                  </div>
                  
                  <div className="flex space-x-6">
                    {/* Mute Button */}
                    <Button 
                      onClick={toggleMute}
                      className={`relative font-semibold py-4 px-6 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 ${
                        isMuted 
                          ? 'bg-red-600 border-red-500 hover:bg-red-700 focus:ring-red-500' 
                          : 'balboa-surface-elevated border balboa-border balboa-text-primary hover:balboa-text-primary focus:ring-balboa-accent'
                      }`}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <svg 
                          className={`w-6 h-6 ${isMuted ? 'text-white' : 'balboa-accent'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {isMuted ? (
                            // Muted microphone icon with slash
                            <g>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 6l12 12" />
                            </g>
                          ) : (
                            // Active microphone icon
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          )}
                        </svg>
                      </span>
                    </Button>

                    {/* End Call Button */}
                    <Button 
                      onClick={endElevenLabsCall}
                      className="relative balboa-surface-elevated border balboa-border balboa-text-primary hover:balboa-text-primary font-semibold py-4 px-8 text-lg rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-balboa-accent"
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <span className="tracking-wide">END VERIFICATION</span>
                      </span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Call Status - Friendly Style */}
              {status === 'connecting' && (
                <div className="text-center mt-8">
                  <div className="inline-block balboa-surface-elevated border balboa-border px-6 py-3">
                    <p className="text-lg font-semibold balboa-accent tracking-wide">
                      CONNECTING TO VOICE SERVICE...
                    </p>
                  </div>
                </div>
              )}
              

              {/* Verification Result - Simple Completion */}
              {result && (
                <div className="mt-12">
                  <div className="balboa-surface-elevated border balboa-border p-8 text-center shadow-xl">
                    <div className="w-16 h-16 balboa-success rounded-full flex items-center justify-center mx-auto mb-4 animate-success-glow">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold balboa-text-primary mb-4 tracking-wide">
                      VOICE SETUP COMPLETE
                    </h3>
                    <div className="balboa-surface p-6 text-center border balboa-border">
                      <div className="text-lg balboa-text-secondary">
                        <p className="font-semibold balboa-text-primary mb-2">Great job!</p>
                        <p>Your voice verification has been successfully set up. You can now proceed to your dashboard.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display - Friendly Error Screen */}
              {error && (
                <div className="mt-12">
                  <div className="balboa-surface-elevated border balboa-border p-8 text-center shadow-xl">
                    <div className="w-16 h-16 balboa-danger rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold balboa-text-primary mb-4 tracking-wide">
                      SETUP INTERRUPTED
                    </h3>
                    <div className="balboa-surface p-6 border balboa-border">
                      <p className="text-lg balboa-text-secondary font-semibold mb-2">
                        Something went wrong during voice setup.
                      </p>
                      <p className="text-base balboa-text-muted">
                        Please try again or contact support if the issue persists.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}