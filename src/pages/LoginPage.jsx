import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../components/LoadingOverlay';
import { SignInPage } from '../components/ui/sign-in';

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
      <SignInPage
        title={<span>ברוכים הבאים</span>}
        description="היכנס לחשבון שלך והמשך במסע איתנו"
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={testimonials}
        onSignIn={handleLogin}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
        onDemoLogin={handleDemoLogin}
        isLoading={isLoading}
      />
    </>
  );
}

export default LoginPage;
