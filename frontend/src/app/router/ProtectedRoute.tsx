import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

function AuthSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, isAuthReady } = useAuthStore();

  // If user is already hydrated from session storage, render immediately — no spinner on reload
  if (user) return <Outlet />;
  // Still awaiting the /auth/me check (token present but not yet validated)
  if (!isAuthReady) return <AuthSpinner />;
  // Auth fully checked, no valid user
  return <Navigate to="/" replace />;
}
