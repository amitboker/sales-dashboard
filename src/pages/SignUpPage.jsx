import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { createOnboardingClient } from '../lib/onboarding-api';
import { trackEvent } from '../lib/tracking';
import './SignUpPage.css';

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const email = form.get('email');
    const password = form.get('password');
    const firstName = form.get('firstName');
    const lastName = form.get('lastName');

    setIsLoading(true);
    try {
      const result = await signUp(email, password);
      trackEvent('signup', { page: '/signup', userId: result.user?.id });
      localStorage.setItem('demo_first_name', `${firstName} ${lastName}`.trim());
      const client = await createOnboardingClient({ email });
      sessionStorage.setItem('onboarding_client_id', client.id);
      if (result.needsConfirmation) {
        setConfirmationSent(true);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already_exists')) {
        setError('כתובת האימייל כבר רשומה. נסה להתחבר.');
      } else {
        setError('שגיאה ביצירת החשבון. נסה שוב.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup">
      <div className="signup__topbar">
        <span className="signup__logo">Clario</span>
        <a
          href="#"
          className="signup__topbar-link"
          onClick={(e) => { e.preventDefault(); navigate('/login'); }}
        >
          כניסה
        </a>
      </div>

      <div className="signup__card">
        {confirmationSent ? (
          <>
            <h1 className="signup__title">בדוק את האימייל שלך</h1>
            <p className="signup__subtitle">
              שלחנו קישור אימות לכתובת האימייל שלך. לחץ על הקישור כדי להפעיל את החשבון.
            </p>
            <button className="signup__submit" type="button" onClick={() => navigate('/login')}>
              חזור להתחברות
            </button>
          </>
        ) : (
          <>
            <h1 className="signup__title">צור חשבון</h1>
            <p className="signup__subtitle">כמה פרטים קצרים ומתחילים</p>

            <form className="signup__form" onSubmit={handleSubmit}>
              <div className="signup__row">
                <div className="signup__field">
                  <label className="signup__label">שם פרטי</label>
                  <input className="signup__input" name="firstName" type="text" placeholder="שם פרטי" required />
                </div>
                <div className="signup__field">
                  <label className="signup__label">שם משפחה</label>
                  <input className="signup__input" name="lastName" type="text" placeholder="שם משפחה" required />
                </div>
              </div>

              <div className="signup__field">
                <label className="signup__label">אימייל</label>
                <input className="signup__input" name="email" type="email" placeholder="you@company.com" required dir="ltr" />
              </div>

              <div className="signup__field">
                <label className="signup__label">טלפון</label>
                <input className="signup__input" type="tel" placeholder="050-000-0000" />
              </div>

              <div className="signup__field">
                <label className="signup__label">סיסמה</label>
                <input className="signup__input" name="password" type="password" placeholder="בחר סיסמה" required dir="ltr" />
              </div>

              {error && <p className="signup__error">{error}</p>}

              <button className="signup__submit" type="submit" disabled={isLoading}>
                {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
              </button>
            </form>

            <div className="signup__divider">או</div>

            <button
              className="signup__google"
              type="button"
              onClick={async () => {
                setError('');
                try { await signInWithGoogle(); } catch { setError('שגיאה בהרשמה עם Google. נסה שוב.'); }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"/>
              </svg>
              הרשמה עם Google
            </button>

            <button className="signup__link" type="button" onClick={() => navigate('/login')}>
              כבר יש לך חשבון? התחבר
            </button>
          </>
        )}
      </div>

      <div className="signup__footer">Clario</div>
    </div>
  );
}

export default SignUpPage;
