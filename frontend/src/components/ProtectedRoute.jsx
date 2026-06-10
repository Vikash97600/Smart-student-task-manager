import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-bg)' }}>
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
