import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const isDemoMode = !!localStorage.getItem('demo_first_name');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  // Allow demo mode users for dev/testing; in production, only real admins
  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  if (user && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
