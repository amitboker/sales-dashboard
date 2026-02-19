import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { getOnboardingTarget, isOnboardingComplete } from '../lib/onboarding';

export default function ProtectedRoute({ children }) {
  const { user, loading, session } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');
  const [timedOut, setTimedOut] = useState(false);
  const [searchParams] = useSearchParams();
  const forceOnboarding = searchParams.get('forceOnboarding') === 'true';

  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

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
    console.log('[NAV] ProtectedRoute → /login because: not authenticated');
    return <Navigate to="/login" replace />;
  }

  // Demo users skip onboarding
  if (isDemoMode && !user && !session) {
    return children;
  }

  // Force onboarding override — for local testing
  if (forceOnboarding) {
    const target = getOnboardingTarget(user) || '/onboarding/name';
    console.log(`[NAV] ProtectedRoute → ${target} because: forceOnboarding=true`);
    return <Navigate to={target} replace />;
  }

  // Check onboarding status from user_metadata (instant — no async profile needed)
  if (user && !isOnboardingComplete(user)) {
    const target = getOnboardingTarget(user);
    console.log(`[NAV] ProtectedRoute → ${target} because: onboarding incomplete`, {
      meta: user.user_metadata,
    });
    return <Navigate to={target} replace />;
  }

  return children;
}
