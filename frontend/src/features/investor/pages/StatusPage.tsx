import ApplicationStatus from '../../../components/ApplicationStatus';
import { SkeletonTable } from '../../../components/skeletons/SkeletonTable';
import { EmptyState } from '../../../components/EmptyState';
import { useApplications } from '../../../hooks/useApplications';
import { usePageMeta } from '../../../hooks/usePageMeta';

export default function StatusPage() {
  const { applications, isLoading, error } = useApplications();
  usePageMeta('My Applications', 'Track the status of your franchise and dealership applications.');

  if (isLoading) {
    return (
      <div className="container-safe py-10">
        <SkeletonTable rows={6} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-safe py-16">
        <EmptyState
          title="Couldn't load applications"
          description="There was a problem fetching your applications. Please try again."
          action={<button onClick={() => window.location.reload()} className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Retry</button>}
        />
      </div>
    );
  }

  return <ApplicationStatus applications={applications} />;
}
