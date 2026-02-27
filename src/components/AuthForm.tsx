import { useState, useEffect, FormEvent } from 'react';

interface AuthFormProps {
  onEmailSignIn: (email: string, password: string) => Promise<void>;
  onEmailSignUp: (email: string, password: string, displayName: string) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  onFacebookSignIn: () => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  error: string | null;
  loading: boolean;
  onClearError: () => void;
  accountConflictEmail?: string | null;
  onClearAccountConflict?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const inputCls =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-300 disabled:opacity-50';
const labelCls = 'block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5';

export function AuthForm({
  onEmailSignIn,
  onEmailSignUp,
  onGoogleSignIn,
  onFacebookSignIn,
  onPasswordReset,
  error,
  loading,
  onClearError,
  accountConflictEmail,
  onClearAccountConflict,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // When a social sign-in detects an account conflict, pre-fill the email
  // and switch to the email sign-in form so the user can sign in directly.
  useEffect(() => {
    if (accountConflictEmail) {
      setEmail(accountConflictEmail);
      setMode('signin');
    }
  }, [accountConflictEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    onClearError();
    try {
      if (mode === 'signin') {
        await onEmailSignIn(email, password);
      } else if (mode === 'signup') {
        await onEmailSignUp(email, password, displayName);
      } else if (mode === 'reset') {
        await onPasswordReset(email);
        setResetSent(true);
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    onClearError();
    try {
      if (provider === 'google') {
        await onGoogleSignIn();
      } else {
        await onFacebookSignIn();
      }
    } catch {
      // Error handled by hook
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setResetSent(false);
    onClearError();
    onClearAccountConflict?.();
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center py-8 px-6">
      {/* Branding */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black text-[#008751] tracking-tight uppercase">
          Gear <span className="text-[#1e3a32]">Guru</span>
        </h1>
        <p className="text-[#008751] text-xs font-bold uppercase tracking-widest mt-2">Family Gear Sizing</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
        {mode === 'reset' ? (
          <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-5">
            <h2 className="text-lg font-black text-slate-800">Reset Password</h2>

            {resetSent ? (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold rounded-xl px-4 py-3">
                Password reset email sent! Check your inbox.
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className={labelCls}>Email</label>
                  <input
                    type="email"
                    id="email"
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </>
            )}

            <button
              type="button"
              className="text-sm font-bold text-[#008751] hover:text-emerald-800 transition-colors text-center"
              onClick={() => switchMode('signin')}
            >
              ← Back to Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-5">
            <h2 className="text-lg font-black text-slate-800">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h2>

            {mode === 'signup' && (
              <div>
                <label htmlFor="displayName" className={labelCls}>Name</label>
                <input
                  type="text"
                  id="displayName"
                  className={inputCls}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className={labelCls}>Email</label>
              <input
                type="email"
                id="email"
                className={inputCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>Password</label>
              <input
                type="password"
                id="password"
                className={inputCls}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Enter your password'}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {accountConflictEmail && mode === 'signin' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                <p className="font-bold mb-1">Sign in with your password</p>
                <p className="font-semibold text-xs">
                  This email already has an account. Enter your password below to sign in.
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>

            {mode === 'signin' && (
              <button
                type="button"
                className="text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors text-center -mt-2"
                onClick={() => switchMode('reset')}
              >
                Forgot password?
              </button>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Social buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                onClick={() => handleSocialSignIn('facebook')}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            {/* Switch mode */}
            <p className="text-xs text-center text-slate-400 font-bold">
              {mode === 'signin' ? (
                <>
                  No account?{' '}
                  <button
                    type="button"
                    className="text-[#008751] hover:text-emerald-800 transition-colors font-black"
                    onClick={() => switchMode('signup')}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Have an account?{' '}
                  <button
                    type="button"
                    className="text-[#008751] hover:text-emerald-800 transition-colors font-black"
                    onClick={() => switchMode('signin')}
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
