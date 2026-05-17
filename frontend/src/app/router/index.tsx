import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

const LandingPage = lazy(() => import('../../features/investor/pages/LandingPage'));
const BrowsePage = lazy(() => import('../../features/investor/pages/BrowsePage'));
const StatusPage = lazy(() => import('../../features/investor/pages/StatusPage'));
const ProfilePage = lazy(() => import('../../features/investor/pages/ProfilePage'));
const AIPage = lazy(() => import('../../features/investor/pages/AIPage'));
const OpportunityDetailPage = lazy(() => import('../../features/investor/pages/OpportunityDetailPage'));
const BrandPage = lazy(() => import('../../features/brand/pages/BrandPage'));
const MessagesPage = lazy(() => import('../../features/messaging/pages/MessagesPage'));
const BrandLandingPageImport = lazy(() => import('../../components/BrandLandingPage'));
const BrandDashboardShell = lazy(() =>
  import('../../features/brand/BrandDashboardShell').then((m) => ({ default: m.BrandDashboardShell }))
);
const AdminDashboardShell = lazy(() => import('../../features/admin/AdminDashboardShell'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
  </div>
);

function BrandLandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  return (
    <Suspense fallback={<PageLoader />}>
      <BrandLandingPageImport
        onStartSignUp={() => openAuthModal('signup')}
        isLoggedIn={!!user}
        onGoToDashboard={() => navigate('/brand')}
      />
    </Suspense>
  );
}

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  // ── Public layout (Navbar + Footer via AppShell) ──────────────────────────
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: wrap(<LandingPage />) },
      { path: 'find-franchise', element: wrap(<BrowsePage typeFilter="franchise" />) },
      { path: 'find-dealership', element: wrap(<BrowsePage typeFilter="dealership" />) },
      { path: 'find-distribution', element: wrap(<BrowsePage typeFilter="distribution" />) },
      { path: 'opportunity/:id', element: wrap(<OpportunityDetailPage />) },
      { path: 'ask-ai', element: wrap(<AIPage />) },
      { path: 'join', element: <BrandLandingPage /> },

      // Protected — any logged-in user
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: wrap(<ProfilePage />) },
          { path: 'messages', element: wrap(<MessagesPage />) },
          { path: 'messages/:chatId', element: wrap(<MessagesPage />) },
        ],
      },

      // Investor-only
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <RoleRoute role="investor" />,
            children: [
              { path: 'status', element: wrap(<StatusPage />) },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },

  // ── Brand dashboard (sidebar layout — no global Navbar/Footer) ────────────
  {
    path: '/brand',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute role="brand_owner" />,
        children: [
          {
            element: wrap(<BrandDashboardShell />),
            children: [
              { index: true, element: wrap(<BrandPage />) },
              { path: 'leads', element: wrap(<BrandPage />) },
              { path: 'support', element: wrap(<BrandPage />) },
            ],
          },
        ],
      },
    ],
  },

  // ── Admin dashboard (sidebar layout — no global Navbar/Footer) ────────────
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute role="admin" />,
        children: [
          { index: true, element: wrap(<AdminDashboardShell />) },
        ],
      },
    ],
  },
]);
