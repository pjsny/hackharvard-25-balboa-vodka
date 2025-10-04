"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useElevenLabsVerification } from "@balboa/web";

export default function OnboardingPage(): React.FC {
  const [isMuted, setIsMuted] = useState(false);
  
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
      
      console.log('🎯 Session options:', sessionOptions);
      
      // For public agents, we can use agentId directly
      const result = await startVerification(sessionId, sessionOptions);
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
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Onboarding Section */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-slate-900 text-center">
              Start Onboarding
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg text-center">
              Complete your setup to get started with Balboa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-slate-600 mb-8">
              <p>Welcome! Let's get you set up with Balboa's voice-powered 2FA protection.</p>
            </div>
            
            {/* Call Control Buttons */}
            <div className="flex flex-col items-center space-y-4">
              {status === 'connecting' ? (
                // Connecting State
                <div className="flex flex-col items-center space-y-4">
                  <Button 
                    disabled
                    className="relative bg-blue-500 text-white font-bold py-6 px-12 text-xl rounded-xl shadow-2xl transition-all duration-300"
                    style={{
                      boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4), 0 0 90px rgba(59, 130, 246, 0.2)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    <span className="relative z-10 flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting...</span>
                    </span>
                  </Button>
                  <p className="text-sm font-medium text-blue-600">
                    Establishing voice connection...
                  </p>
                </div>
              ) : !isCallActive ? (
                // Start Call Button
                <Button 
                  onClick={startElevenLabsCall}
                  className="relative bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-12 text-xl rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  style={{
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.4), 0 0 90px rgba(59, 130, 246, 0.2)',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <span className="relative z-10">Start Onboarding</span>
                  <div 
                    className="absolute inset-0 rounded-xl opacity-75"
                    style={{
                      background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 197, 253, 0.3), rgba(59, 130, 246, 0.3))',
                      animation: 'shimmer 2s infinite'
                    }}
                  />
                </Button>
              ) : (
                // Call Active State - End Call and Mute Buttons
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex space-x-4">
                    {/* Mute Button */}
                    <Button 
                      onClick={toggleMute}
                      className={`relative font-bold py-4 px-8 text-lg rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 ${
                        isMuted 
                          ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-300' 
                          : 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-300'
                      }`}
                      style={{
                        boxShadow: isMuted 
                          ? '0 0 20px rgba(234, 88, 12, 0.6), 0 0 40px rgba(234, 88, 12, 0.4)'
                          : '0 0 20px rgba(75, 85, 99, 0.6), 0 0 40px rgba(75, 85, 99, 0.4)'
                      }}
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        {isMuted ? (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Unmute</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Mute</span>
                          </>
                        )}
                      </span>
                    </Button>

                    {/* End Call Button */}
                    <Button 
                      onClick={endElevenLabsCall}
                      className="relative bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-lg rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300"
                      style={{
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)'
                      }}
                    >
                      <span className="relative z-10 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>End Call</span>
                      </span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Call Status */}
              {status === 'connecting' && (
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-600">
                    🔗 Connecting to voice service...
                  </p>
                </div>
              )}
              
              {isCallActive && (
                <div className="text-center">
                  <p className="text-sm font-medium text-green-600">
                    Voice call is active - speak to start your onboarding!
                  </p>
                  {isSpeaking && (
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      🎙️ Agent is speaking...
                    </p>
                  )}
                  {isMuted && (
                    <p className="text-sm font-medium text-orange-600 mt-1">
                      🎤 You are muted
                    </p>
                  )}
                </div>
              )}

              {/* Verification Result */}
              {result && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ✅ Verification Complete!
                  </h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Session ID:</strong> {result.callId}</p>
                    <p><strong>Duration:</strong> {result.duration}s</p>
                    {result.transcript && (
                      <p><strong>Transcript:</strong> {result.transcript}</p>
                    )}
                    {result.summary && (
                      <p><strong>Summary:</strong> {result.summary}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    ❌ Verification Failed
                  </h3>
                  <p className="text-sm text-red-700">
                    {error.message}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
