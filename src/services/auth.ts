import { getFirebaseAuth } from '../config/firebase';
import type { User, UserCredential } from 'firebase/auth';

export interface AuthError {
  code: string;
  message: string;
}

// Email/Password Authentication
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  const { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  // Send verification email (best-effort — don't block signup if it fails)
  try {
    await sendEmailVerification(userCredential.user);
  } catch {
    // Verification email failure is non-critical
  }

  return userCredential;
};

export const resendEmailVerification = async (): Promise<void> => {
  const { sendEmailVerification } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const getSignInMethodsForEmail = async (email: string): Promise<string[]> => {
  const { fetchSignInMethodsForEmail } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return fetchSignInMethodsForEmail(auth, email);
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

// Google Authentication
export const signInWithGoogle = async (): Promise<UserCredential> => {
  const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  const googleProvider = new GoogleAuthProvider();
  return signInWithPopup(auth, googleProvider);
};

// Facebook Authentication
export const signInWithFacebook = async (): Promise<UserCredential> => {
  const { signInWithPopup, FacebookAuthProvider } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  const facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');
  return signInWithPopup(auth, facebookProvider);
};

// Sign Out
export const logOut = async (): Promise<void> => {
  const { signOut } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return signOut(auth);
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return sendPasswordResetEmail(auth, email);
};

// Auth State Observer
export const onAuthChange = async (
  callback: (user: User | null) => void
): Promise<() => void> => {
  const { onAuthStateChanged } = await import('firebase/auth');
  const auth = await getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const auth = await getFirebaseAuth();
  return auth.currentUser;
};

// Helper to format Firebase auth errors
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Please sign in with email and password instead.';
    default:
      return 'An error occurred. Please try again.';
  }
};
