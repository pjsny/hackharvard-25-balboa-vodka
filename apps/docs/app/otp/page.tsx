"use client";

import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { ArrowLeft, Shield, CheckCircle, Clock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OTPScreen() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // Countdown timer
  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;
    
    setIsLoading(true);
    // TODO: Implement server action for OTP verification
    console.log("OTP submitted:", otp);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsVerified(true);
      // TODO: Navigate to next screen
      console.log("Navigate to dashboard");
    }, 2000);
  };

  const handleResend = () => {
    // TODO: Implement resend OTP server action
    console.log("Resending OTP...");
    setTimeLeft(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-white">
                Welcome aboard! 🎉
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Your email has been verified successfully
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-200 border-green-400/30">
                <Shield className="w-3 h-3 mr-1" />
                Email Verified
              </Badge>
              
              <p className="text-white/80">
                You're all set to join the hackathon! Get ready for an amazing experience.
              </p>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                onClick={() => router.push("/dashboard")}
              >
                Continue to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-white">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-white/80 text-lg">
              We sent a 6-digit code to your email
            </CardDescription>
            {email && (
              <p className="text-white/60 text-sm font-mono">
                {email}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Mail className="w-3 h-3 mr-1" />
              Check your inbox
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-white/90">
                Enter verification code
              </label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-2xl font-mono bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:border-white/60 focus:ring-white/20 tracking-widest"
                maxLength={6}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Code expires in {formatTime(timeLeft)}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-white/60">
                Didn't receive the code?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResend}
                disabled={timeLeft > 0}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend Code"}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
              className="text-white/60 hover:text-white/80 hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to email entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
