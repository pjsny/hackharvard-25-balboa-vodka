/**
 * Authentication server actions for email OTP and session management
 */

"use server";

import { redirect } from "next/navigation";
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { db } from "./db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken, setAuthToken, clearAuthToken, getCurrentUser } from "./jwt-auth";

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
  token?: string;
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
    // Validate email
    if (!email || !email.includes("@")) {
      return {
        success: false,
        message: "Invalid email address",
        error: "INVALID_EMAIL"
      };
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with 5-minute expiration
    await redis.setex(`otp:${email}`, 300, otp);

    // Send email via Resend
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
    // Validate OTP format
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return {
        success: false,
        message: "Invalid verification code",
        error: "INVALID_OTP_FORMAT"
      };
    }

    // Verify OTP from Redis
    const storedOTP = await redis.get(`otp:${email}`);
    const storedOTPString = storedOTP ? String(storedOTP) : null;

    if (!storedOTPString || storedOTPString.trim() !== otp.trim()) {
      return {
        success: false,
        message: "Invalid or expired verification code",
        error: "INVALID_OTP"
      };
    }

    // Clear the OTP from Redis
    await redis.del(`otp:${email}`);

    // Upsert user in database (insert or update)
    const [user] = await db.insert(users).values({
      email,
      name: email.split("@")[0],
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        updatedAt: new Date(),
      }
    }).returning();

    if (!user) {
      return {
        success: false,
        message: "Failed to create user",
        error: "USER_CREATION_FAILED"
      };
    }

    console.log(`OTP verified for ${email}: ${otp}`); // Remove in production
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name || email.split("@")[0]
    });
    
    // Set token in cookies
    await setAuthToken(token);
    
    return {
      success: true,
      message: "Email verified successfully",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || email.split("@")[0]
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
 * Get current user session using JWT
 * @returns Promise<AuthSession | null>
 */
export async function getSession(): Promise<AuthSession | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      isVerified: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Sign out user using JWT
 * @returns Promise<void>
 */
export async function signOut(): Promise<void> {
  try {
    // Clear the auth token cookie
    await clearAuthToken();
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
