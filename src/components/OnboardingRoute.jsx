import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { isOnboardingComplete } from '../lib/onboarding';

/**
 * Guard for /onboarding/* routes:
 * - Not authenticated → /login
 * - Onboarding already completed → /dashboard (unless ?forceOnboarding=true)
 * - Otherwise → show onboarding step
 */
export default function OnboardingRoute({ children }) {
  const { user, session, loading } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');
  const [timedOut, setTimedOut] = useState(false);
  const [searchParams] = useSearchParams();
  const forceOnboarding = searchParams.get('forceOnboarding') === 'true';

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

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
    console.log('[NAV] OnboardingRoute → /login because: not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Demo users skip onboarding
  if (isDemoMode && !user && !session) {
    console.log('[NAV] OnboardingRoute → /dashboard because: demo mode');
    return <Navigate to="/dashboard" replace />;
  }

  // Force onboarding override — always show onboarding
  if (forceOnboarding) {
    console.log('[NAV] OnboardingRoute: forceOnboarding=true — showing step');
    return children;
  }

  // Onboarding already completed → dashboard
  if (user && isOnboardingComplete(user)) {
    console.log('[NAV] OnboardingRoute → /dashboard because: onboarding already completed', {
      meta: user.user_metadata,
    });
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
