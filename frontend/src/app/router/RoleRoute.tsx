import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

type UserRole = 'investor' | 'brand_owner' | 'admin';

interface RoleRouteProps {
  role: UserRole | UserRole[];
}

export function RoleRoute({ role }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user);
  const allowed = Array.isArray(role) ? role : [role];

  if (!user || !allowed.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
