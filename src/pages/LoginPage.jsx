import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { trackEvent } from '../lib/tracking';
import clarioSymbol from '../assets/icons/clario-symbol.png';
import './LoginPage.css';

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      setError('אנא מלא את כל השדות');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      trackEvent('login', { page: '/login', userId: result.user?.id });
      if (import.meta.env.DEV) {
        console.log('[NAV] login → /dashboard (ProtectedRoute will gate)', {
          meta: result.user?.user_metadata,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
        setError('האימייל טרם אומת. בדוק את תיבת הדואר שלך ולחץ על קישור האימות.');
      } else if (msg === 'Invalid login credentials' || msg.includes('Invalid login')) {
        setError('אימייל או סיסמה שגויים');
      } else if (msg.includes('Supabase not configured')) {
        setError('המערכת לא מוגדרת כראוי. אנא פנה לתמיכה.');
      } else {
        setError(`שגיאה בהתחברות: ${msg || 'נסה שוב'}`);
      }
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch {
      setError('שגיאה בהתחברות עם Google. נסה שוב.');
    }
  };

  return (
    <div className="li">
      <div className="li__card">
        <div className="li__header">
          <img src={clarioSymbol} alt="Clario" className="li__logo" />
          <h1 className="li__title">ברוכים הבאים</h1>
          <p className="li__subtitle">היכנס לחשבון שלך כדי להמשיך</p>
        </div>

        <form className="li__form" onSubmit={handleLogin}>
          <div className="li__input-wrap">
            <input
              name="email"
              type="email"
              className="li__input"
              placeholder="אימייל"
              required
              dir="ltr"
              autoComplete="email"
            />
          </div>

          <div className="li__input-wrap">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="li__input li__input--password"
              placeholder="סיסמה"
              required
              dir="ltr"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="li__eye"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="li__options">
            <label className="li__remember">
              <input type="checkbox" name="rememberMe" />
              <span className="li__checkbox" />
              זכור אותי
            </label>
            <button
              type="button"
              className="li__forgot"
              onClick={() => console.log('Reset Password clicked')}
            >
              שחזור סיסמה
            </button>
          </div>

          {error && <p className="li__error">{error}</p>}

          <button className="li__btn li__btn--primary" type="submit" disabled={isLoading}>
            {isLoading ? <span className="li__spinner" /> : 'כניסה'}
          </button>
        </form>

        <div className="li__divider">
          <span>או</span>
        </div>

        <button className="li__btn li__btn--google" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
          <GoogleIcon />
          המשך עם Google
        </button>

        <p className="li__signup-link">
          עדיין אין לך חשבון?{' '}
          <button type="button" onClick={() => navigate('/signup')}>הרשם עכשיו</button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
