/**
 * Authentication server actions for email OTP and session management
 */

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = Redis.fromEnv();

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
    // Example with Resend:
    // await resend.emails.send({
    //   from: 'Balboa Hackathon <noreply@balboa.dev>',
    //   to: [email],
    //   subject: 'Your Balboa Hackathon Verification Code',
    //   html: generateOTPEmailHTML(otp)
    // });

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

    // TODO: Retrieve stored OTP from database/cache
    const storedOTP = await redis.get(`otp:${email}`);
    
    // TODO: Verify OTP matches and hasn't expired
    if (!storedOTP || storedOTP !== otp) {
      return {
        success: false,
        message: "Invalid or expired verification code",
        error: "INVALID_OTP"
      };
    }

    // TODO: Create or update user in database
    // const user = await createOrUpdateUser({
    //   email,
    //   emailVerified: true,
    //   lastLoginAt: new Date()
    // });

    // TODO: Generate secure session token (JWT or session ID)
    // const sessionToken = await generateSessionToken(user.id);
    
    // TODO: Set secure HTTP-only cookie
    // cookies().set('session', sessionToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: 60 * 60 * 24 * 7 // 7 days
    // });

    // TODO: Clean up used OTP
    // await redis.del(`otp:${email}`);

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
    // TODO: Implement rate limiting check
    // const lastSent = await redis.get(`otp_sent:${email}`);
    // if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
    //   return {
    //     success: false,
    //     message: "Please wait before requesting another code",
    //     error: "RATE_LIMITED"
    //   };
    // }

    // TODO: Invalidate previous OTP
    // await redis.del(`otp:${email}`);
    
    // TODO: Record send time for rate limiting
    // await redis.setex(`otp_sent:${email}`, 60, Date.now().toString());

    // Reuse sendOTP logic
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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Balboa Hackathon Verification Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">Welcome to Balboa!</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0;">The ultimate hackathon experience</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px;">Your Verification Code</h2>
        <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block; margin: 0 auto;">
          <span style="font-size: 32px; font-weight: bold; color: #8B5CF6; letter-spacing: 4px; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: white; margin: 20px 0 0 0; font-size: 14px;">This code expires in 5 minutes</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h3 style="color: #333; margin: 0 0 15px 0;">What's next?</h3>
        <ul style="color: #666; margin: 0; padding-left: 20px;">
          <li>Enter this code in the verification screen</li>
          <li>Complete your profile setup</li>
          <li>Join the hackathon and start building!</li>
        </ul>
      </div>
      
      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>If you didn't request this code, please ignore this email.</p>
        <p>This code will expire in 5 minutes for security reasons.</p>
      </div>
    </body>
    </html>
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
