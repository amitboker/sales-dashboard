import React, { useState } from 'react';
import './sign-in.css';

// Eye icons
const EyeIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373-12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

// --- TYPE DEFINITIONS ---

// --- SUB-COMPONENTS ---

// --- MAIN COMPONENT ---

export const SignInPage = ({
  title = <span>ברוכים הבאים</span>,
  description = "היכנס לחשבון שלך והמשך במסע איתנו",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onDemoLogin,
  demoCredentials,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="sign-in-page">
      {/* Right column: sign-in form (RTL - right side) */}
      <section className="sign-in-form-section">
        <div className="sign-in-form-container">
          <div className="sign-in-form-content">
            <h1 className="sign-in-title">{title}</h1>
            <p className="sign-in-description">{description}</p>

            <form className="sign-in-form" onSubmit={onSignIn}>
              <div className="sign-in-field">
                <label className="sign-in-label">כתובת אימייל</label>
                <div className="glass-input-wrapper">
                  <input name="email" type="email" placeholder="הזן את כתובת האימייל שלך" className="sign-in-input" dir="rtl" />
                </div>
              </div>

              <div className="sign-in-field">
                <label className="sign-in-label">סיסמה</label>
                <div className="glass-input-wrapper">
                  <div className="sign-in-password-wrapper">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="הזן את הסיסמה שלך" className="sign-in-input" style={{ paddingRight: '3rem' }} dir="rtl" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="sign-in-password-toggle">
                      {showPassword ? <EyeOffIcon className="" /> : <EyeIcon className="" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="sign-in-options">
                <label className="sign-in-remember">
                  <input type="checkbox" name="rememberMe" className="sign-in-checkbox" />
                  <span>זכור אותי</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="sign-in-forgot-link">שחזר סיסמה</a>
              </div>

              <button type="submit" disabled={isLoading} className="sign-in-submit-btn">
                {isLoading ? '...טוען' : 'התחבר'}
              </button>
            </form>

            <div className="sign-in-divider">
              <span className="sign-in-divider-text">או המשך עם</span>
            </div>

            <button onClick={onGoogleSignIn} disabled={isLoading} className="sign-in-google-btn">
              <GoogleIcon />
              המשך עם Google
            </button>

            {onDemoLogin && (
              <button onClick={onDemoLogin} disabled={isLoading} className="sign-in-demo-btn">
                {isLoading ? '...טוען את הדאשבורד' : 'כניסה לדמו'}
              </button>
            )}

            <p className="sign-in-signup-text">
              חדש בפלטפורמה? <a href="#" onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }} className="sign-in-signup-link">צור חשבון</a>
            </p>

            {demoCredentials && (
              <div className="sign-in-demo-creds">
                {demoCredentials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Left column: hero image + testimonials (RTL - left side) */}
      {heroImageSrc && (
        <section className="sign-in-hero-section">
          <div className="sign-in-hero-image" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="sign-in-testimonials">
              <div className="testimonial-card">
                <img src={testimonials[0].avatarSrc} className="testimonial-avatar" alt={testimonials[0].name} />
                <div className="testimonial-content">
                  <p className="testimonial-name">{testimonials[0].name}</p>
                  <p className="testimonial-handle">{testimonials[0].handle}</p>
                  <p className="testimonial-text">{testimonials[0].text}</p>
                </div>
              </div>
              {testimonials[1] && (
                <div className="testimonial-card testimonial-card-xl">
                  <img src={testimonials[1].avatarSrc} className="testimonial-avatar" alt={testimonials[1].name} />
                  <div className="testimonial-content">
                    <p className="testimonial-name">{testimonials[1].name}</p>
                    <p className="testimonial-handle">{testimonials[1].handle}</p>
                    <p className="testimonial-text">{testimonials[1].text}</p>
                  </div>
                </div>
              )}
              {testimonials[2] && (
                <div className="testimonial-card testimonial-card-2xl">
                  <img src={testimonials[2].avatarSrc} className="testimonial-avatar" alt={testimonials[2].name} />
                  <div className="testimonial-content">
                    <p className="testimonial-name">{testimonials[2].name}</p>
                    <p className="testimonial-handle">{testimonials[2].handle}</p>
                    <p className="testimonial-text">{testimonials[2].text}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SignInPage;
