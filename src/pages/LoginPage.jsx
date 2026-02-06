import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import './LoginPage.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373-12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

const testimonials = [
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    name: 'שרה כהן',
    handle: '@sarahdigital',
    text: 'פלטפורמה מדהימה! חווית המשתמש חלקה והתכונות בדיוק מה שצריך.',
  },
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    name: 'מרקוס ג׳ונסון',
    handle: '@marcustech',
    text: 'השירות הזה שינה את איך שאני עובד. עיצוב נקי, תכונות חזקות ותמיכה מעולה.',
  },
  {
    avatarSrc: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    name: 'דוד מרטינז',
    handle: '@davidcreates',
    text: 'ניסיתי פלטפורמות רבות, אבל זו בולטת. אינטואיטיבית, אמינה ומועילה באמת.',
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log('Sign In submitted:', data);
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    navigate('/dashboard');
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1800));
    navigate('/dashboard');
  };

  const handleGoogleSignIn = () => {
    console.log('Continue with Google clicked');
    // Add Google sign-in logic here
  };

  const handleResetPassword = () => {
    console.log('Reset Password clicked');
    // Add reset password logic here
  };

  const handleCreateAccount = () => {
    console.log('Create Account clicked');
    // Add create account logic here
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <div className="login">
        <section className="login__form-side">
          <div className="login__form-card">
            <h1 className="login__title">ברוכים הבאים</h1>
            <p className="login__subtitle">היכנס לחשבון שלך והמשך במסע איתנו</p>

            <form onSubmit={handleLogin}>
              <label className="login__label">כתובת אימייל</label>
              <input
                name="email"
                type="email"
                className="login__input"
                placeholder="הזן את כתובת האימייל שלך"
                dir="rtl"
              />

              <label className="login__label">סיסמה</label>
              <div className="login__password-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login__input"
                  placeholder="הזן את הסיסמה שלך"
                  dir="rtl"
                />
                <button
                  type="button"
                  className="login__eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="login__options">
                <label className="login__remember">
                  <input type="checkbox" name="rememberMe" />
                  <span className="login__checkbox" />
                  זכור אותי
                </label>
                <a
                  href="#"
                  className="login__forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResetPassword();
                  }}
                >
                  שחזור סיסמה
                </a>
              </div>

              <button type="submit" className="login__btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <span className="login__btn-loading">
                    <span className="login__btn-spinner" />
                    טוען...
                  </span>
                ) : (
                  'התחבר'
                )}
              </button>

              <div className="login__divider">או המשך עם</div>

              <button type="button" className="login__btn-google" onClick={handleGoogleSignIn} disabled={isLoading}>
                <GoogleIcon />
                המשך עם Google
              </button>

              <button type="button" className="login__btn-demo" onClick={handleDemoLogin} disabled={isLoading}>
                {isLoading ? '...טוען את הדאשבורד' : 'כניסה לדמו'}
              </button>

              <p className="login__signup-text">
                חדש בפלטפורמה?{' '}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateAccount();
                  }}
                >
                  צור חשבון
                </a>
              </p>
            </form>
          </div>
        </section>

        <section className="login__testimonials-side">
          <div className="login__testimonials-list">
            {testimonials.map((item) => (
              <div className="login__tcard" key={item.handle}>
                <img src={item.avatarSrc} className="login__tcard-avatar" alt={item.name} />
                <div className="login__tcard-name">{item.name}</div>
                <span className="login__tcard-handle">{item.handle}</span>
                <div className="login__tcard-text">{item.text}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default LoginPage;
