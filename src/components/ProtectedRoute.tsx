import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-lasnoches-bg flex items-center justify-center text-white font-oswald tracking-widest">Verificando Reiatsu...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
