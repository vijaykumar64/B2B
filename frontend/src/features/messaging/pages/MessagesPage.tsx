import { useParams } from 'react-router-dom';
import LeadInbox from '../../../components/LeadInbox';
import { useAuthStore } from '../../../stores/authStore';

export default function MessagesPage() {
  const { chatId } = useParams<{ chatId?: string }>();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return <LeadInbox user={user} initialChatId={chatId} />;
}
