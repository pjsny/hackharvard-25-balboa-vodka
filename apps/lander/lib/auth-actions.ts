/**
 * Authentication server actions for email OTP and session management
 */

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';

// Initialize Redis
const redis = Redis.fromEnv();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Types for our auth system
export interface SendOTPResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface AuthSession {
  userId: string;
  email: string;
  isVerified: boolean;
  expiresAt: Date;
}

/**
 * Send OTP to user's email
 * @param email User's email address
 * @returns Promise<SendOTPResult>
 */
export async function sendOTP(email: string): Promise<SendOTPResult> {
  try {
    // TODO: Implement email validation
    if (!email || !email.includes("@")) {
      return {
        success: false,
        message: "Invalid email address",
        error: "INVALID_EMAIL"
      };
    }

    // TODO: Implement rate limiting
    // Check if user has requested OTP recently (e.g., within last minute)
    
    // TODO: Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const result = await redis.setex(`otp:${email}`, 300, otp);

    // TODO: Send email via email service
    await resend.emails.send({
      from: 'Balboa Hackathon <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Balboa Hackathon Verification Code',
      html: generateOTPEmailHTML(otp)
    });


    console.log(`OTP sent to ${email}: ${otp}`); // Remove in production
    
    return {
      success: true,
      message: "Verification code sent to your email"
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return {
      success: false,
      message: "Failed to send verification code",
      error: "SEND_OTP_FAILED"
    };
  }
}

/**
 * Verify OTP and create user session
 * @param email User's email address
 * @param otp 6-digit verification code
 * @returns Promise<VerifyOTPResult>
 */
export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResult> {
  try {
    // TODO: Validate OTP format
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return {
        success: false,
        message: "Invalid verification code",
        error: "INVALID_OTP_FORMAT"
      };
    }

    const storedOTP = await redis.get(`otp:${email}`);
    const storedOTPString = storedOTP ? String(storedOTP) : null;

    if (!storedOTPString || storedOTPString.trim() !== otp.trim()) {
      return {
        success: false,
        message: "Invalid or expired verification code",
        error: "INVALID_OTP"
      };
    }

    console.log("OTP verified");

    // TODO: Create or update user in database
    // const user = await createOrUpdateUser({
    //   email,
    //   emailVerified: true,
    //   lastLoginAt: new Date()
    // });

    // TODO: Generate secure session token (JWT or session ID)
    // NEXT AUTH PLACEHOLDER
    await redis.del(`otp:${email}`);

    console.log(`OTP verified for ${email}: ${otp}`); // Remove in production
    
    return {
      success: true,
      message: "Email verified successfully",
      user: {
        id: "temp-user-id", // TODO: Use real user ID
        email,
        name: email.split("@")[0] // TODO: Get from database
      }
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      success: false,
      message: "Failed to verify code",
      error: "VERIFY_OTP_FAILED"
    };
  }
}

/**
 * Resend OTP to user's email
 * @param email User's email address
 * @returns Promise<SendOTPResult>
 */
export async function resendOTP(email: string): Promise<SendOTPResult> {
  try {
    return await sendOTP(email);
  } catch (error) {
    console.error("Error resending OTP:", error);
    return {
      success: false,
      message: "Failed to resend verification code",
      error: "RESEND_OTP_FAILED"
    };
  }
}

/**
 * Get current user session
 * @returns Promise<AuthSession | null>
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    // TODO: Read session cookie
    // const sessionToken = cookies().get('session')?.value;
    // if (!sessionToken) return null;

    // TODO: Verify session token
    // const payload = await verifySessionToken(sessionToken);
    // if (!payload) return null;

    // TODO: Check if session is expired
    // if (payload.expiresAt < new Date()) return null;

    // TODO: Return session data
    return null; // Placeholder
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Sign out user
 * @returns Promise<void>
 */
export async function signOut(): Promise<void> {
  try {
    // TODO: Clear session cookie
    // cookies().delete('session');
    
    // TODO: Invalidate session token
    // const sessionToken = cookies().get('session')?.value;
    // if (sessionToken) {
    //   await invalidateSessionToken(sessionToken);
    // }

    // TODO: Redirect to home
    redirect('/');
  } catch (error) {
    console.error("Error signing out:", error);
    redirect('/');
  }
}

/**
 * Generate HTML email template for OTP
 * @param otp 6-digit verification code
 * @returns HTML email template
 */
function generateOTPEmailHTML(otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8B5CF6; text-align: center;">Your Verification Code</h2>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 4px; font-family: monospace;">${otp}</span>
      </div>
      <p style="text-align: center; color: #666;">This code expires in 5 minutes.</p>
    </div>
  `;
}

/**
 * Test server action
 */
export async function testAction(): Promise<void> {
  console.log("sup");
}

/**
 * Required env vars: DATABASE_URL, REDIS_URL, EMAIL_SERVICE_API_KEY, JWT_SECRET
 * Optional: EMAIL_FROM, RATE_LIMIT_WINDOW, OTP_EXPIRY, SESSION_EXPIRY
 */
