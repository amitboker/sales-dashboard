import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * OAuth callback handler.
 * Supabase redirects here with hash params (#access_token=...).
 * The Supabase JS client auto-detects the hash and sets the session.
 * We navigate to /dashboard — ProtectedRoute will redirect to /onboarding
 * if the user hasn't completed onboarding yet.
 */
export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      navigate('/login');
      return;
    }

    // Supabase auto-picks up the hash fragment on page load.
    // Wait for the session to be available, then redirect.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        // No session found — might still be processing.
        // Listen for auth state change as fallback.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, s) => {
            if (s) {
              subscription.unsubscribe();
              navigate('/dashboard', { replace: true });
            }
          }
        );
        // Safety: if nothing happens in 5s, go to login
        const timer = setTimeout(() => {
          subscription.unsubscribe();
          navigate('/login', { replace: true });
        }, 5000);
        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      }
    });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Heebo", sans-serif',
      direction: 'rtl',
      color: 'var(--color-muted, #828282)',
      fontSize: '15px',
    }}>
      מתחבר...
    </div>
  );
}
