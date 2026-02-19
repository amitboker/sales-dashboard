import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../lib/tracking';
import clarioSymbol from '../assets/icons/clario symbol.png';
import './SignUpPage.css';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MailIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4L12 13 2 4" />
  </svg>
);

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, updateUserMeta } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [searchParams] = useSearchParams();

  // DEV ONLY: reset onboarding metadata for testing (localhost only)
  useEffect(() => {
    if (window.location.hostname !== 'localhost') return;
    if (searchParams.get('resetOnboarding') !== 'true') return;
    if (!user) return;

    (async () => {
      try {
        await updateUserMeta({
          onboarding_completed: false,
          full_name: null,
          business_type: null,
          sales_reps: null,
          marketing_channel: null,
        });
        console.log('[dev] onboarding metadata reset');
        navigate('/onboarding/name', { replace: true });
      } catch (err) {
        console.error('[dev] resetOnboarding failed:', err);
      }
    })();
  }, [searchParams, user, updateUserMeta, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');

    setIsLoading(true);
    try {
      const result = await signUp(email, password);
      console.log('[NAV] signup result:', result);
      trackEvent('signup', { page: '/signup' });

      if (result.requiresEmailConfirmation) {
        setPendingEmail(email);
      } else {
        console.log('[NAV] signup → navigating to /onboarding/name');
        navigate('/onboarding/name', { replace: true });
      }
    } catch (err) {
      const msg = err.message || '';
      console.error('[signup] error:', msg);
      if (msg.includes('already registered') || msg.includes('already_exists')) {
        setError('כתובת האימייל כבר רשומה. נסה להתחבר.');
      } else {
        setError('שגיאה ביצירת החשבון. נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('שגיאה בהרשמה עם Google. נסה שוב.');
    }
  };

  const handleResend = async () => {
    if (!supabase || !pendingEmail || resending) return;
    setResending(true);
    try {
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email: pendingEmail });
      if (resendError) throw resendError;
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (err) {
      console.error('[signup] resend failed:', err);
    } finally {
      setResending(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="su">
        <div className="su__card">
          <div className="su__header">
            <img src={clarioSymbol} alt="Clario" className="su__logo" />
            <div className="su__confirm-icon">
              <MailIcon />
            </div>
            <h1 className="su__title">כמעט סיימנו</h1>
            <p className="su__subtitle">
              שלחנו לך אימייל לאימות. אחרי אימות תוכל להמשיך באונבורדינג.
            </p>
          </div>

          <div className="su__form">
            <button
              className="su__btn su__btn--primary"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <span className="su__spinner" /> : resent ? 'נשלח בהצלחה!' : 'שלח שוב מייל אימות'}
            </button>

            <button
              className="su__btn su__btn--secondary"
              onClick={() => navigate('/login')}
            >
              כבר אימתתי — התחבר
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="su">
      <div className="su__card">
        <div className="su__header">
          <img src={clarioSymbol} alt="Clario" className="su__logo" />
          <h1 className="su__title">ברוכים הבאים ל-Clario</h1>
          <p className="su__subtitle">בואו נתחיל ביצירת חשבון</p>
        </div>

        <form className="su__form" onSubmit={handleSubmit}>
          <div className="su__input-wrap">
            <input
              className="su__input"
              name="email"
              type="email"
              placeholder="אימייל"
              required
              dir="ltr"
              autoComplete="email"
            />
          </div>

          <div className="su__input-wrap">
            <input
              className="su__input su__input--password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="סיסמה"
              required
              dir="ltr"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="su__eye"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <p className="su__terms">
            בהמשך, אתה מסכים ל<span className="su__terms-link">תנאי השימוש</span> ול<span className="su__terms-link">מדיניות הפרטיות</span>
          </p>

          {error && <p className="su__error">{error}</p>}

          <button className="su__btn su__btn--primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="su__spinner" />
            ) : (
              'המשך'
            )}
          </button>
        </form>

        <div className="su__divider">
          <span>או</span>
        </div>

        <button className="su__btn su__btn--google" type="button" onClick={handleGoogleSignIn}>
          <GoogleIcon />
          המשך עם Google
        </button>

        <p className="su__login-link">
          כבר יש לך חשבון?{' '}
          <button type="button" onClick={() => navigate('/login')}>התחבר</button>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
