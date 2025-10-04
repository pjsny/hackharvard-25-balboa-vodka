import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = Redis.fromEnv();

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        console.log("Authorize called with:", { email: credentials?.email, otp: credentials?.otp ? "***" : "none" });
        
        if (!credentials?.email || !credentials?.otp) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Verify OTP from Redis
          const storedOTP = await redis.get(`otp:${credentials.email}`);
          const storedOTPString = storedOTP ? String(storedOTP) : null;
          
          console.log("Stored OTP:", storedOTPString ? "***" : "none");
          console.log("Provided OTP:", credentials.otp);

          if (!storedOTPString || storedOTPString.trim() !== credentials.otp.trim()) {
            console.log("OTP mismatch or not found");
            return null;
          }

          // Clear the OTP from Redis
          await redis.del(`otp:${credentials.email}`);

          // Upsert user in database (insert or update)
          const [user] = await db.insert(users).values({
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }).onConflictDoUpdate({
            target: users.email,
            set: {
              updatedAt: new Date(),
            }
          }).returning();

          if (!user) {
            console.error("Failed to upsert user");
            return null;
          }

          console.log("Upserted user:", user.id);

          const result = {
            id: user.id,
            email: user.email,
            name: user.name || credentials.email.split("@")[0],
          };
          
          console.log("Returning user:", result);
          return result;
        } catch (error) {
          console.error("Error in authorize:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If it's the same origin, allow it
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise, redirect to dashboard
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
