import { useNavigate, useParams } from 'react-router-dom';
import OpportunityDetailView from '../../../components/OpportunityDetailView';
import { SkeletonCard } from '../../../components/skeletons/SkeletonCard';
import { EmptyState } from '../../../components/EmptyState';
import { useOpportunities } from '../../../hooks/useOpportunities';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { Button } from '../../../components/ui/button';

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunities, isLoading } = useOpportunities();
  const user = useAuthStore((s) => s.user);
  const { openAuthModal, openQuestionsModal } = useUIStore();

  const opportunity = opportunities.find((o) => o.id === id);

  usePageMeta(opportunity?.brand_name ?? 'Opportunity Details');

  if (isLoading) {
    return (
      <div className="container-safe py-10 max-w-2xl">
        <SkeletonCard />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container-safe py-16">
        <EmptyState
          title="Opportunity not found"
          description="This listing may have been removed or the link is incorrect."
          action={<Button onClick={() => navigate(-1)}>Go Back</Button>}
        />
      </div>
    );
  }

  return (
    <OpportunityDetailView
      opportunity={opportunity}
      allOpportunities={opportunities}
      onBack={() => navigate(-1)}
      onApply={(oppId) => {
        const opp = opportunities.find((o) => o.id === oppId);
        if (!opp) return;
        if (!user) { openAuthModal('login'); return; }
        openQuestionsModal(opp);
      }}
      onEnquire={(opp) => {
        if (!user) { openAuthModal('login'); return; }
        openQuestionsModal(opp);
      }}
      isLoggedIn={!!user}
      user={user}
      onLoginClick={(mode) => openAuthModal(mode ?? 'signup')}
      onViewOpportunity={(oppId) => navigate(`/opportunity/${oppId}`)}
    />
  );
}
