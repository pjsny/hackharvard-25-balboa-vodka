"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useElevenLabsVerification } from "@balboa/web";

export default function OnboardingPage(): JSX.Element {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Rocky Background with boxing ring aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-black">
        {/* Boxing ring ropes effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg"></div>
        </div>
        
        {/* Corner posts */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow"></div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 right-4 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-2xl animate-corner-post-glow" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Rocky Title */}
          <div className="mb-12">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 mb-4 tracking-wider transform hover:scale-105 transition-transform duration-300">
              BALBOA
            </h1>
            <div className="text-3xl font-bold text-white mb-2 tracking-widest">
              VOICE VERIFICATION
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 font-semibold max-w-2xl mx-auto leading-relaxed">
              Step into the ring. Your voice is your weapon. 
              <span className="text-yellow-400 font-bold"> FIGHT FOR YOUR SECURITY.</span>
            </p>
          </div>
            
          {/* Call Control Buttons */}
          <div className="flex flex-col items-center space-y-8">
            {status === 'connecting' ? (
              // Connecting State - Rocky Training Montage Style
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Button 
                    disabled
                    className="relative bg-gradient-to-r from-red-600 to-red-800 text-white font-black py-8 px-16 text-2xl rounded-none border-4 border-yellow-400 shadow-2xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      boxShadow: '0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.6), 0 0 120px rgba(220, 38, 38, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.3)',
                      animation: 'pulse 1.5s infinite'
                    }}
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="tracking-wider">TRAINING...</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-50 animate-pulse"></div>
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-yellow-400 tracking-wider">
                    🥊 PREPARING FOR BATTLE 🥊
                  </p>
                  <p className="text-sm font-medium text-gray-300 mt-2">
                    Establishing voice connection...
                  </p>
                </div>
              </div>
              ) : !isCallActive ? (
                // Start Call Button - Rocky's Entrance
                <div className="relative">
                  <Button 
                    onClick={startElevenLabsCall}
                    className="relative bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 text-black font-black py-10 px-20 text-3xl rounded-none border-4 border-yellow-300 shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none z-20"
                    style={{
                      boxShadow: '0 0 50px rgba(234, 179, 8, 0.9), 0 0 100px rgba(220, 38, 38, 0.7), 0 0 150px rgba(234, 179, 8, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.2)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    <span className="relative z-30 flex items-center space-x-4">
                      <span className="text-4xl">🥊</span>
                      <span className="tracking-widest">ENTER THE RING</span>
                      <span className="text-4xl">🥊</span>
                    </span>
                    <div 
                      className="absolute inset-0 opacity-60 z-10"
                      style={{
                        background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(234, 179, 8, 0.3), rgba(255, 255, 255, 0.3))',
                        animation: 'shimmer 2s infinite'
                      }}
                    />
                  </Button>
                  
                  {/* Glow effect - positioned behind button */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-30 blur-xl animate-pulse z-0"></div>
                </div>
              ) : (
                // Call Active State - Rocky's Corner Controls
                <div className="flex flex-col items-center space-y-8">
                  <div className="text-center mb-6">
                    <div className="text-4xl font-black text-yellow-400 mb-2 tracking-wider">
                      🥊 ROUND IN PROGRESS 🥊
                    </div>
                    <div className="text-lg font-bold text-white">
                      Voice verification active - SPEAK YOUR TRUTH!
                    </div>
                  </div>
                  
                  <div className="flex space-x-8">
                    {/* Mute Button - Rocky's Corner */}
                    <Button 
                      onClick={toggleMute}
                      className={`relative font-black py-6 px-10 text-xl rounded-none border-4 shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none ${
                        isMuted 
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white border-orange-400' 
                          : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white border-gray-500'
                      }`}
                      style={{
                        boxShadow: isMuted 
                          ? '0 0 30px rgba(234, 88, 12, 0.8), 0 0 60px rgba(234, 88, 12, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)'
                          : '0 0 30px rgba(75, 85, 99, 0.8), 0 0 60px rgba(75, 85, 99, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <span className="text-2xl">
                          {isMuted ? '🔊' : '🔇'}
                        </span>
                        <span className="tracking-wider">
                          {isMuted ? 'UNMUTE' : 'MUTE'}
                        </span>
                      </span>
                    </Button>

                    {/* End Call Button - Rocky's Exit */}
                    <Button 
                      onClick={endElevenLabsCall}
                      className="relative bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-black py-6 px-10 text-xl rounded-none border-4 border-red-400 shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
                      style={{
                        boxShadow: '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <span className="relative z-10 flex items-center space-x-3">
                        <span className="text-2xl">🏁</span>
                        <span className="tracking-wider">END FIGHT</span>
                      </span>
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Call Status - Rocky Style */}
              {status === 'connecting' && (
                <div className="text-center mt-8">
                  <div className="inline-block bg-gradient-to-r from-red-800 to-red-900 border-2 border-yellow-400 px-6 py-3">
                    <p className="text-lg font-bold text-yellow-400 tracking-wider">
                      🔗 ESTABLISHING CONNECTION...
                    </p>
                  </div>
                </div>
              )}
              
              {isCallActive && (
                <div className="text-center mt-8">
                  <div className="inline-block bg-gradient-to-r from-green-800 to-green-900 border-2 border-green-400 px-8 py-4">
                    <p className="text-xl font-black text-green-400 tracking-wider mb-2">
                      🥊 FIGHT IS ON! 🥊
                    </p>
                    <p className="text-lg font-bold text-white">
                      Voice verification active - SPEAK YOUR TRUTH!
                    </p>
                    {isSpeaking && (
                      <p className="text-lg font-bold text-blue-400 mt-2 tracking-wider">
                        🎙️ OPPONENT IS SPEAKING...
                      </p>
                    )}
                    {isMuted && (
                      <p className="text-lg font-bold text-orange-400 mt-2 tracking-wider">
                        🔇 YOU ARE SILENCED
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Result - Victory Display */}
              {result && (
                <div className="mt-12">
                  <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 border-4 border-yellow-400 p-8 text-center">
                    <div className="text-6xl mb-4 animate-victory-bounce">🏆</div>
                    <h3 className="text-4xl font-black text-black mb-4 tracking-wider">
                      VICTORY ACHIEVED!
                    </h3>
                    <div className="bg-black bg-opacity-50 p-6 text-left">
                      <div className="text-lg text-yellow-300 space-y-2">
                        <p><span className="font-bold text-yellow-400">FIGHT ID:</span> {result.callId}</p>
                        <p><span className="font-bold text-yellow-400">ROUND DURATION:</span> {result.duration}s</p>
                        {result.transcript && (
                          <p><span className="font-bold text-yellow-400">YOUR WORDS:</span> {result.transcript}</p>
                        )}
                        {result.summary && (
                          <p><span className="font-bold text-yellow-400">FIGHT SUMMARY:</span> {result.summary}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display - Defeat Screen */}
              {error && (
                <div className="mt-12">
                  <div className="bg-gradient-to-r from-red-600 to-red-800 border-4 border-red-400 p-8 text-center">
                    <div className="text-6xl mb-4">💥</div>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-wider">
                      FIGHT INTERRUPTED!
                    </h3>
                    <div className="bg-black bg-opacity-50 p-6">
                      <p className="text-lg text-red-200 font-bold">
                        {error.message}
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
