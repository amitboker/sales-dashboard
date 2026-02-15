import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({ children }) {
  const { user, loading, session, profile, profileLoading } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');
  const [timedOut, setTimedOut] = useState(false);

  // Fallback: if loading takes more than 8 s, stop waiting
  useEffect(() => {
    if (!loading && !profileLoading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading, profileLoading]);

  // Still loading auth session
  if (loading && !timedOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Not authenticated and not demo → login
  if (!user && !isDemoMode && !session) {
    return <Navigate to="/login" replace />;
  }

  // Demo users skip onboarding check
  if (isDemoMode && !user && !session) {
    return children;
  }

  // Authenticated user: wait for profile to determine onboarding status
  if ((user || session) && profileLoading && !timedOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Authenticated but has NOT completed onboarding → redirect to /onboarding
  if ((user || session) && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
