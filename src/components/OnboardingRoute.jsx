import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

/**
 * Guard for the /onboarding route:
 * - Not authenticated → /login
 * - Authenticated + onboardingCompleted → /dashboard
 * - Authenticated + not completed → show onboarding
 * - Demo mode → /dashboard (skip onboarding)
 */
export default function OnboardingRoute({ children }) {
  const { user, session, loading, profile, profileLoading } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading && !profileLoading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading, profileLoading]);

  // Still loading auth
  if (loading && !timedOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Not authenticated and not demo
  if (!user && !session && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  // Demo users skip onboarding
  if (isDemoMode && !user && !session) {
    return <Navigate to="/dashboard" replace />;
  }

  // Wait for profile to load for authenticated users
  if (profileLoading && !timedOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Already completed onboarding → go to dashboard
  if (profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
