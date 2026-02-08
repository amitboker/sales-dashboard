import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { createOnboardingClient } from '../lib/onboarding-api';
import { trackEvent } from '../lib/tracking';
import './SignUpPage.css';

function SignUpPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
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
        <div className="signup__card">
          {confirmationSent ? (
            <>
              <h1 className="signup__title">בדוק את האימייל שלך</h1>
              <p className="signup__subtitle">
                שלחנו קישור אימות לכתובת האימייל שלך. לחץ על הקישור כדי להפעיל את החשבון, ואז חזור להתחבר.
              </p>
              <button className="signup__submit" type="button" onClick={() => navigate('/login')}>
                חזור להתחברות
              </button>
            </>
          ) : (
            <>
              <h1 className="signup__title">צור חשבון</h1>
              <p className="signup__subtitle">כמה פרטים קצרים ומתחילים לעבוד</p>

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

              <button className="signup__link" type="button" onClick={() => navigate('/login')}>
                כבר יש לך חשבון? התחבר
              </button>
            </>
          )}
        </div>
      </div>
  );
}

export default SignUpPage;
