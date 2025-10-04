"use client";

import { Button } from "~/components/ui/button";
import { sendOTP, verifyOTP } from "~/lib/auth-actions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/use-auth";

export default function BalboaApp(): JSX.Element {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rocky Background */}
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

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-3xl">🥊</span>
              </div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 tracking-wider">
                BALBOA
              </h1>
              <div className="text-xl font-bold text-white mt-2 tracking-widest">
                PREPARING FOR BATTLE...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage("");

    try {
      const result = await sendOTP(email);
      if (result.success) {
        setMessage(result.message);
        setShowOTPInput(true);
      } else {
        setMessage(result.message || "Failed to send verification code");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Handle paste of full OTP code
    if (value.length > 1) {
      // Extract only numeric characters and limit to 6 digits
      const digits = value.replace(/\D/g, '').slice(0, 6);
      
      if (digits.length === 6) {
        // Distribute the pasted digits across all inputs
        const newOtp = digits.split('');
        setOtp(newOtp);
        
        // Focus the last input
        const lastInput = document.getElementById(`otp-5`);
        lastInput?.focus();
        return;
      }
    }
    
    // Handle single character input
    if (value.length > 1) return; // Prevent multiple characters for single input
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Extract only numeric characters and limit to 6 digits
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      // Create new OTP array with pasted digits
      const newOtp = [...otp];
      
      // Fill from current index onwards
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex((digit, idx) => !digit && idx > 0);
      const focusIndex = nextEmptyIndex > 0 ? nextEmptyIndex : Math.min(digits.length, 5);
      const nextInput = document.getElementById(`otp-${focusIndex}`);
      nextInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    console.log("Verifying code...");
    console.log(email, otp.join(''));
    
    try {
      const result = await verifyOTP(email, otp.join(''));
      console.log("Verify result:", result);
      
      if (result.success) {
        setMessage("Email verified successfully! Redirecting...");
        // Refresh the page to pick up the new auth cookie
        router.push("/dashboard");
      } else {
        setMessage(result.message || "Invalid or expired verification code");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      setMessage("Failed to verify code");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rocky Background */}
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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-4xl">🥊</span>
              </div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 tracking-wider mb-2">
                BALBOA
              </h1>
              <div className="text-2xl font-bold text-white mb-2 tracking-widest">
                VOICE VERIFICATION
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-red-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-300 font-semibold">
                Step into the ring. Your voice is your weapon.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {!showOTPInput ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-lg font-bold text-yellow-400 tracking-wider">
                    🥊 ENTER YOUR EMAIL ADDRESS 🥊
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-black bg-opacity-50 border-2 border-yellow-400 rounded-none text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                {message && (
                  <div className={`text-lg p-4 rounded-none border-2 font-bold tracking-wider ${
                    message.includes("sent") 
                      ? "bg-gradient-to-r from-green-800 to-green-900 text-green-400 border-green-400" 
                      : "bg-gradient-to-r from-red-800 to-red-900 text-red-400 border-red-400"
                  }`}>
                    {message.includes("sent") ? "✅ " : "❌ "}{message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 text-black font-black py-6 text-xl rounded-none border-4 border-yellow-300 shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
                  style={{
                    boxShadow: '0 0 30px rgba(234, 179, 8, 0.8), 0 0 60px rgba(220, 38, 38, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span className="tracking-wider">TRAINING...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-3">
                      <span className="text-2xl">🥊</span>
                      <span className="tracking-wider">ENTER THE RING</span>
                      <span className="text-2xl">🥊</span>
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-black text-yellow-400 tracking-wider">🥊 VERIFICATION CODE 🥊</h2>
                  <p className="text-lg text-gray-300 font-semibold">
                    We sent a 6-digit code to <span className="text-yellow-400 font-bold">{email}</span>
                  </p>
                </div>

                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-16 h-16 text-center text-2xl font-black bg-black bg-opacity-50 border-2 border-yellow-400 rounded-none text-white focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400"
                    />
                  ))}
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-yellow-500 via-red-600 to-yellow-500 text-black font-black py-6 text-xl rounded-none border-4 border-yellow-300 shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
                  style={{
                    boxShadow: '0 0 30px rgba(234, 179, 8, 0.8), 0 0 60px rgba(220, 38, 38, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
                  }}
                  disabled={otp.some(digit => !digit)}
                  onClick={handleVerifyCode}
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span className="text-2xl">🏆</span>
                    <span className="tracking-wider">VERIFY & ENTER</span>
                    <span className="text-2xl">🏆</span>
                  </span>
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPInput(false);
                      setMessage("");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-lg text-yellow-400 hover:text-yellow-300 underline font-bold tracking-wider"
                  >
                    🔄 CHANGE EMAIL ADDRESS
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <p className="text-sm text-gray-400 font-semibold">
                By entering the ring, you agree to our{" "}
                <a href="#" className="text-yellow-400 hover:text-yellow-300 underline font-bold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-yellow-400 hover:text-yellow-300 underline font-bold">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
