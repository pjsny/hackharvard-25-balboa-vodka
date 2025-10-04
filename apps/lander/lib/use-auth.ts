"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  isOnboarded: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('auth-token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token by making a request to get user info
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, clear it
        Cookies.remove('auth-token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      Cookies.remove('auth-token');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  };
}
