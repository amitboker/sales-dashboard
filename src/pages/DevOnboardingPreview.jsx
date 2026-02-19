import { useState, useCallback } from 'react';
import OnboardingPage from './OnboardingPage';
import { AuthContext } from '../lib/auth';

/**
 * Dev-only preview wrapper for the onboarding flow.
 * Mocks the auth context so OnboardingPage works without a real user session.
 * Never writes to the database — completeOnboarding is a no-op.
 */
export default function DevOnboardingPreview() {
  const isDev = import.meta.env.DEV;

  if (!isDev) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: '"Heebo", sans-serif', color: '#828282' }}>
        Not available in production
      </div>
    );
  }

  return <DevOnboardingInner />;
}

function DevOnboardingInner() {
  const [key, setKey] = useState(0);

  const mockCompleteOnboarding = useCallback(async () => {
    // No-op — don't write to DB. Just log for dev visibility.
    console.log('[dev] completeOnboarding called (no-op)');
  }, []);

  const mockAuth = {
    user: { id: 'dev-preview', email: 'dev@preview.local' },
    session: {},
    profile: { onboardingCompleted: false },
    profileLoading: false,
    isAdmin: false,
    loading: false,
    signUp: async () => {},
    signIn: async () => {},
    signInWithGoogle: async () => {},
    signOut: async () => {},
    completeOnboarding: mockCompleteOnboarding,
  };

  return (
    <div>
      <div style={{
        position: 'fixed', top: 12, left: 12, zIndex: 9999,
        background: '#1f2a33', color: '#DAFD68', padding: '6px 14px',
        borderRadius: 8, fontSize: 13, fontFamily: '"Heebo", sans-serif',
        display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>
        <span>Dev Preview</span>
        <button
          onClick={() => setKey((k) => k + 1)}
          style={{
            background: '#DAFD68', color: '#1f2a33', border: 'none', borderRadius: 6,
            padding: '3px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Restart Onboarding
        </button>
      </div>
      <AuthContext.Provider value={mockAuth}>
        <OnboardingPage key={key} />
      </AuthContext.Provider>
    </div>
  );
}
