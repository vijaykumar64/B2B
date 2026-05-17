import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, HelpCircle } from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import type { NavItem } from '../../components/dashboard/DashboardSidebar';

const BRAND_NAV: NavItem[] = [
  { label: 'Opportunities', icon: LayoutDashboard, href: '/brand' },
  { label: 'Leads',         icon: Users,           href: '/brand/leads' },
  { label: 'Support',       icon: HelpCircle,      href: '/brand/support' },
];

export function BrandDashboardShell() {
  return (
    <DashboardLayout navItems={BRAND_NAV} brandName="Brand Dashboard">
      <Outlet />
    </DashboardLayout>
  );
}
