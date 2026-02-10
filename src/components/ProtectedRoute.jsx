import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({ children }) {
  const { user, loading, session } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');
  const [timedOut, setTimedOut] = useState(false);

  // Fallback: if loading takes more than 8 s, stop waiting
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Allow access if we have a session (even if user state hasn't synced yet)
  // or if in demo mode
  if (!user && !isDemoMode && !session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
