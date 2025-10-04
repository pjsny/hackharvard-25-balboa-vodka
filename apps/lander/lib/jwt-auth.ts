import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isOnboarded: boolean;
}

/**
 * Generate JWT token for user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Get current user from JWT token in cookies
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    // Get user from database to ensure they still exist
    const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    
    if (user.length === 0) {
      return null;
    }

    const userData = user[0]!;
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name || undefined,
      isOnboarded: userData.isOnboarded,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Set auth token in cookies
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: false, // Allow client-side access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clear auth token from cookies
 */
export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
