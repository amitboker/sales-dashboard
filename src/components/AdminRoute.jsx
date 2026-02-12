import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  const isDemoAdmin = !!localStorage.getItem('demo_first_name');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  if (!isAdmin && !isDemoAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
