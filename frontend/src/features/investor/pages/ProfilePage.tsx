import { useNavigate } from 'react-router-dom';
import UserProfile from '../../../components/UserProfile';
import { useAuthStore } from '../../../stores/authStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return <UserProfile user={user} onLogout={handleLogout} />;
}
