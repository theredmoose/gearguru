import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  logOut,
  resetPassword,
  resendEmailVerification,
  onAuthChange,
  checkRedirectResult,
  getAuthErrorMessage,
} from '../services/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  accountConflictEmail: string | null; // set when auth/account-exists-with-different-credential
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  clearError: () => void;
  clearAccountConflict: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountConflictEmail, setAccountConflictEmail] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    onAuthChange((user) => {
      if (mountedRef.current) {
        setUser(user);
        setLoading(false);
      }
    }).then((unsubscribe) => {
      cleanup = unsubscribe;
    });
    return () => cleanup?.();
  }, []);

  // Handle pending redirect result (Google/Facebook redirect sign-in flow).
  // onAuthStateChanged covers the success case; this catches redirect errors.
  useEffect(() => {
    checkRedirectResult().catch((err: unknown) => {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) {
        setError(getAuthErrorMessage(errorCode));
        setLoading(false);
      }
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear account conflict
  const clearAccountConflict = useCallback(() => {
    setAccountConflictEmail(null);
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
      // On success, onAuthStateChanged fires and sets user + loading=false together,
      // avoiding a flash of the unauthenticated state (loading=false, user=null).
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) {
        if (errorCode === 'auth/account-exists-with-different-credential') {
          const conflictEmail = (err as { customData?: { email?: string } })?.customData?.email ?? null;
          setAccountConflictEmail(conflictEmail);
        }
        setError(getAuthErrorMessage(errorCode));
        setLoading(false);
      }
      throw err;
    }
  }, []);

  // Facebook sign in
  const signInFacebook = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithFacebook();
      // Same as Google: let onAuthStateChanged clear loading on success.
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) {
        if (errorCode === 'auth/account-exists-with-different-credential') {
          const conflictEmail = (err as { customData?: { email?: string } })?.customData?.email ?? null;
          setAccountConflictEmail(conflictEmail);
        }
        setError(getAuthErrorMessage(errorCode));
        setLoading(false);
      }
      throw err;
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

  // Resend email verification
  const resendVerification = useCallback(async () => {
    try {
      await resendEmailVerification();
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || 'unknown';
      if (mountedRef.current) setError(getAuthErrorMessage(errorCode));
      throw err;
    }
  }, []);

  return {
    user,
    loading,
    error,
    accountConflictEmail,
    signIn,
    signUp,
    signInGoogle,
    signInFacebook,
    signOut,
    sendPasswordReset,
    resendVerification,
    clearError,
    clearAccountConflict,
  };
}
