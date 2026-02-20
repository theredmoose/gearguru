import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  logOut,
  resetPassword,
  onAuthChange,
  getAuthErrorMessage,
} from '../services/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (mountedRef.current) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Email sign in
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Email sign up
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email, password, displayName);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Google sign in
  const signInGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Facebook sign in
  const signInFacebook = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithFacebook();
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) setError(getAuthErrorMessage(errorCode));
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setError(null);
      await logOut();
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      setError(getAuthErrorMessage(errorCode));
      throw err;
    }
  }, []);

  // Password reset
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      setError(getAuthErrorMessage(errorCode));
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInGoogle,
    signInFacebook,
    signOut,
    sendPasswordReset,
    clearError,
  };
}
