import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const OWNER_EMAIL = 'amitboker@gmail.com';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="login__btn-spinner" />
      </div>
    );
  }

  if (!user || user.email !== OWNER_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
