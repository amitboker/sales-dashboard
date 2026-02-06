import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import './SignUpPage.css';

function SignUpPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    navigate('/onboarding');
  };

  return (
    <>
      <LoadingOverlay isVisible={isLoading} />
      <div className="signup">
        <div className="signup__card">
          <h1 className="signup__title">צור חשבון</h1>
          <p className="signup__subtitle">כמה פרטים קצרים ומתחילים לעבוד</p>

          <form className="signup__form" onSubmit={handleSubmit}>
            <div className="signup__row">
              <div className="signup__field">
                <label className="signup__label">שם פרטי</label>
                <input className="signup__input" type="text" placeholder="שם פרטי" required />
              </div>
              <div className="signup__field">
                <label className="signup__label">שם משפחה</label>
                <input className="signup__input" type="text" placeholder="שם משפחה" required />
              </div>
            </div>

            <div className="signup__field">
              <label className="signup__label">אימייל</label>
              <input className="signup__input" type="email" placeholder="you@company.com" required dir="ltr" />
            </div>

            <div className="signup__field">
              <label className="signup__label">טלפון</label>
              <input className="signup__input" type="tel" placeholder="050-000-0000" />
            </div>

            <div className="signup__field">
              <label className="signup__label">סיסמה</label>
              <input className="signup__input" type="password" placeholder="בחר סיסמה" required dir="ltr" />
            </div>

            <button className="signup__submit" type="submit" disabled={isLoading}>
              {isLoading ? 'יוצר חשבון...' : 'צור חשבון'}
            </button>
          </form>

          <button className="signup__link" type="button" onClick={() => navigate('/login')}>
            כבר יש לך חשבון? התחבר
          </button>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
