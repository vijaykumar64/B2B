import { useLocation } from 'react-router-dom';
import BrandOwnerPanel from '../../../components/BrandOwnerPanel';
import { useOpportunities } from '../../../hooks/useOpportunities';
import { useAuthStore } from '../../../stores/authStore';

export default function BrandPage() {
  const { pathname } = useLocation();
  const { opportunities } = useOpportunities();
  const user = useAuthStore((s) => s.user);

  const activeTab =
    pathname.endsWith('/leads') ? 'brand-leads' :
    pathname.endsWith('/support') ? 'support' :
    'brand-opportunities';

  if (!user) return null;

  return (
    <BrandOwnerPanel
      user={user}
      opportunities={opportunities}
      activeTab={activeTab}
    />
  );
}
