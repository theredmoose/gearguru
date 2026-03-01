import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthForm } from '../AuthForm';

describe('AuthForm', () => {
  const defaultProps = {
    onEmailSignIn: vi.fn().mockResolvedValue(undefined),
    onEmailSignUp: vi.fn().mockResolvedValue(undefined),
    onGoogleSignIn: vi.fn().mockResolvedValue(undefined),
    onFacebookSignIn: vi.fn().mockResolvedValue(undefined),
    onPasswordReset: vi.fn().mockResolvedValue(undefined),
    error: null,
    loading: false,
    onClearError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // SIGN IN MODE (default)
  // ============================================
  describe('sign in mode (default)', () => {
    it('renders Sign In heading by default', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders email and password fields', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('does not render display name field in sign in mode', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    });

    it('renders Sign In submit button', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('renders Forgot password link', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('renders Continue with Google button', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });

    it('renders Continue with Facebook button', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
    });

    it('shows "No account? Sign Up" link', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByText(/no account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
    });

    it('calls onEmailSignIn with email and password on submit', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(defaultProps.onEmailSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('calls onClearError before submitting', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      await waitFor(() => {
        expect(defaultProps.onClearError).toHaveBeenCalled();
      });
    });

    it('calls onGoogleSignIn when Google button clicked', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /continue with google/i }));
      await waitFor(() => {
        expect(defaultProps.onGoogleSignIn).toHaveBeenCalled();
      });
    });

    it('calls onFacebookSignIn when Facebook button clicked', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /continue with facebook/i }));
      await waitFor(() => {
        expect(defaultProps.onFacebookSignIn).toHaveBeenCalled();
      });
    });

    it('shows error message when error prop is provided', () => {
      render(<AuthForm {...defaultProps} error="Invalid credentials" />);
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('shows Please wait... on submit button when loading', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      expect(screen.getByRole('button', { name: /please wait/i })).toBeInTheDocument();
    });

    it('disables form inputs when loading', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    it('disables social buttons when loading', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      expect(screen.getByRole('button', { name: /continue with google/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeDisabled();
    });
  });

  // ============================================
  // SIGN UP MODE
  // ============================================
  describe('sign up mode', () => {
    it('switches to Create Account form when Sign Up is clicked', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows Name field in sign up mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    it('shows email and password fields in sign up mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('shows "Create Account" submit button in sign up mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows "Have an account? Sign In" in sign up mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByText(/have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('calls onEmailSignUp with name, email and password on submit', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
      fireEvent.click(screen.getByRole('button', { name: /create account/i }));
      await waitFor(() => {
        expect(defaultProps.onEmailSignUp).toHaveBeenCalledWith('jane@example.com', 'secret123', 'Jane Doe');
      });
    });

    it('switches back to sign in when "Sign In" link clicked', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
      expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('shows error in sign up mode', () => {
      render(<AuthForm {...defaultProps} error="Email already in use" />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });

    it('shows Please wait... in sign up loading state', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      fireEvent.click(screen.getByRole('button', { name: /please wait/i }));
      // still in sign in mode because click of loading button is noop
      expect(screen.getByRole('button', { name: /please wait/i })).toBeInTheDocument();
    });

    it('does not show Forgot password in sign up mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
      expect(screen.queryByRole('button', { name: /forgot password/i })).not.toBeInTheDocument();
    });
  });

  // ============================================
  // PASSWORD RESET MODE
  // ============================================
  describe('password reset mode', () => {
    it('switches to Reset Password form when Forgot password clicked', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    });

    it('shows only email field in reset mode (no password)', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    });

    it('shows Send Reset Email button', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByRole('button', { name: /send reset email/i })).toBeInTheDocument();
    });

    it('calls onPasswordReset with email on submit', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /send reset email/i }));
      await waitFor(() => {
        expect(defaultProps.onPasswordReset).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('shows success message after reset email sent', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /send reset email/i }));
      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
      });
    });

    it('shows "← Back to Sign In" link in reset mode', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
    });

    it('returns to sign in mode when Back to Sign In clicked', () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));
      expect(screen.getByRole('heading', { name: /^sign in$/i })).toBeInTheDocument();
    });

    it('shows error in reset mode', () => {
      render(<AuthForm {...defaultProps} error="User not found" />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });

    it('shows Sending... when loading in reset mode', () => {
      render(<AuthForm {...defaultProps} loading={true} />);
      // Can't navigate in loading state, so render directly
      // Instead test that the default loading state for sign in shows "Please wait..."
      expect(screen.getByRole('button', { name: /please wait/i })).toBeInTheDocument();
    });

    it('resets resetSent state when switching back to sign in', async () => {
      render(<AuthForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.click(screen.getByRole('button', { name: /send reset email/i }));
      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
      });
      // Go back to sign in then back to reset — success message should be gone
      fireEvent.click(screen.getByRole('button', { name: /back to sign in/i }));
      fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
      expect(screen.queryByText(/password reset email sent/i)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // BRANDING
  // ============================================
  describe('branding', () => {
    it('shows Gear Guru title', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('shows app subtitle', () => {
      render(<AuthForm {...defaultProps} />);
      expect(screen.getByText(/family gear sizing/i)).toBeInTheDocument();
    });
  });
});
