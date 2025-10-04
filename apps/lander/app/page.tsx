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

        {/* Loading Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 balboa-surface-elevated border balboa-border rounded-full flex items-center justify-center mx-auto mb-4 animate-professional-pulse">
                <div className="w-8 h-8 border-2 border-balboa-accent border-t-transparent rounded-full animate-loading-spinner"></div>
              </div>
              <h1 className="text-4xl font-bold balboa-text-primary tracking-wide mb-2">
                BALBOA
              </h1>
              <div className="text-lg font-medium balboa-text-secondary">
                Initializing Security Protocol...
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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-20 h-20 balboa-surface-elevated border balboa-border rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 border-2 border-balboa-accent border-t-transparent rounded-full animate-loading-spinner"></div>
              </div>
              <h1 className="text-6xl font-bold balboa-text-primary tracking-wide mb-2">
                BALBOA
              </h1>
              <div className="text-2xl font-semibold balboa-text-secondary mb-2 tracking-wide">
                VOICE VERIFICATION
              </div>
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-balboa-accent to-transparent mx-auto mb-4"></div>
              <p className="text-lg balboa-text-secondary font-medium">
                Complete your voice verification to activate your security protocol.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {!showOTPInput ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-lg font-semibold balboa-text-primary tracking-wide">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 balboa-text-muted w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 balboa-surface-elevated border balboa-border rounded-lg balboa-text-primary placeholder-balboa-text-muted focus:outline-none focus:ring-2 focus:ring-balboa-accent focus:border-balboa-accent text-lg font-medium"
                      required
                    />
                  </div>
                </div>

                {message && (
                  <div className={`text-lg p-4 rounded-lg border font-semibold tracking-wide ${
                    message.includes("sent") 
                      ? "balboa-surface-elevated balboa-text-primary balboa-border" 
                      : "balboa-surface-elevated balboa-text-primary balboa-border"
                  }`}>
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full balboa-accent-gradient text-black font-semibold py-6 text-xl rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-balboa-accent"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-loading-spinner"></div>
                      <span className="tracking-wide">SENDING...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-3">
                      <span className="tracking-wide">SEND VERIFICATION CODE</span>
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold balboa-text-primary tracking-wide">VERIFICATION CODE</h2>
                  <p className="text-lg balboa-text-secondary font-medium">
                    We sent a 6-digit code to <span className="balboa-accent font-semibold">{email}</span>
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
                      className="w-16 h-16 text-center text-2xl font-bold balboa-surface-elevated border balboa-border rounded-lg balboa-text-primary focus:outline-none focus:ring-2 focus:ring-balboa-accent focus:border-balboa-accent"
                    />
                  ))}
                </div>

                <Button 
                  className="w-full balboa-accent-gradient text-black font-semibold py-6 text-xl rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-balboa-accent"
                  disabled={otp.some(digit => !digit)}
                  onClick={handleVerifyCode}
                >
                  <span className="flex items-center justify-center space-x-3">
                    <span className="tracking-wide">VERIFY & CONTINUE</span>
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
                    className="text-lg balboa-accent hover:balboa-text-primary underline font-semibold tracking-wide"
                  >
                    CHANGE EMAIL ADDRESS
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mt-8">
              <p className="text-sm balboa-text-muted font-medium">
                By continuing, you agree to our{" "}
                <a href="#" className="balboa-accent hover:balboa-text-primary underline font-semibold">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="balboa-accent hover:balboa-text-primary underline font-semibold">
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