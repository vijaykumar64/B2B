import { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Store, TrendingUp, Phone, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import type { NavItem } from '../../components/dashboard/DashboardSidebar';
import AdminDashboard from '../../components/AdminDashboard';

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview',      icon: LayoutDashboard, tabValue: 'overview' },
  { label: 'Approvals',     icon: CheckSquare,     tabValue: 'approvals' },
  { label: 'Brands',        icon: Store,           tabValue: 'opportunities' },
  { label: 'Lead Monitor',  icon: TrendingUp,      tabValue: 'leads' },
  { label: 'Call Requests', icon: Phone,           tabValue: 'callbacks' },
  { label: 'Users',         icon: Users,           tabValue: 'users' },
];

export default function AdminDashboardShell() {
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [activeTab]);

  return (
    <DashboardLayout
      navItems={ADMIN_NAV}
      brandName="Admin Dashboard"
      activeNavValue={activeTab}
      onNavClick={(item) => item.tabValue && setActiveTab(item.tabValue)}
    >
      <AdminDashboard activeTab={activeTab} onTabChange={setActiveTab} />
    </DashboardLayout>
  );
}
