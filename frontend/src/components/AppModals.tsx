import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import CallRequestModal from './CallRequestModal';
import FeedbackModal from './FeedbackModal';
import CompleteProfileModal from './CompleteProfileModal';
import CustomQuestionsModal from './CustomQuestionsModal';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { api } from '../lib/api';
import { createNotification } from '../lib/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';

export function AppModals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user, setUser } = useAuthStore();
  const {
    isAuthModalOpen, authMode, authInitialRole, closeAuthModal,
    isFeedbackModalOpen, closeFeedbackModal,
    isCallModalOpen, callModalType, closeCallModal,
    isCompleteProfileOpen, closeCompleteProfile,
    isQuestionsModalOpen, selectedOpportunity, closeQuestionsModal,
  } = useUIStore();

  const handleLogin = (userData: any) => {
    setUser({ ...userData, isLoggedIn: true });
  };

  const handleApply = async (responses: { questionId: string; question: string; answer: string }[]) => {
    if (!selectedOpportunity || !user) return;

    const userPhone = responses?.find((r) => r.questionId === 'mobile')?.answer || '';

    try {
      await api.post('/applications', {
        opportunityId: selectedOpportunity.id,
        opportunityName: selectedOpportunity.brand_name,
        owner_uid: selectedOpportunity.owner_uid,
        type: selectedOpportunity.type,
        userPhone,
        status: 'pending',
        dateApplied: new Date().toISOString(),
        lastUpdate: new Date().toISOString(),
        responses: responses || [],
        referralCode: localStorage.getItem('referralCode') || null,
      });

      if (selectedOpportunity.owner_uid) {
        await createNotification({
          userId: selectedOpportunity.owner_uid,
          title: `New Application: ${selectedOpportunity.brand_name}`,
          message: `${user.name} has applied for your listing. Please review the investor profile.`,
          type: 'application',
          actionRequired: true,
          link: 'leads',
        });
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.applications.all() });
      toast.success(`Application submitted for ${selectedOpportunity.brand_name}!`, {
        description: "Track status in 'Track Status'.",
      });
      closeQuestionsModal();
      navigate('/status');
    } catch {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLogin={handleLogin}
        initialMode={authMode}
        initialRole={authInitialRole}
      />

      <CallRequestModal
        isOpen={isCallModalOpen}
        onClose={closeCallModal}
        type={callModalType}
        user={user}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
        user={user}
      />

      {user && (
        <CompleteProfileModal
          user={user}
          isOpen={isCompleteProfileOpen}
          onClose={closeCompleteProfile}
        />
      )}

      <CustomQuestionsModal
        isOpen={isQuestionsModalOpen}
        onClose={closeQuestionsModal}
        opportunity={selectedOpportunity}
        onSubmit={handleApply}
        user={user}
      />
    </>
  );
}
