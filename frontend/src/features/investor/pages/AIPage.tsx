import AIBusinessConsultant from '../../../components/AIBusinessConsultant';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';

export default function AIPage() {
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);

  return (
    <AIBusinessConsultant
      opportunities={[]}
      user={user}
      onLoginClick={() => openAuthModal('login')}
      inlineMode
    />
  );
}
