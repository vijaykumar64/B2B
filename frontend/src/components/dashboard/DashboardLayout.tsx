import { useState } from 'react';
import { Menu } from 'lucide-react';
import { DashboardSidebar, type NavItem } from './DashboardSidebar';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  navItems: NavItem[];
  children: React.ReactNode;
  brandName?: string;
  // For tab-based (admin) dashboards:
  activeNavValue?: string;
  onNavClick?: (item: NavItem) => void;
}

export function DashboardLayout({
  navItems,
  children,
  brandName,
  activeNavValue,
  onNavClick,
}: DashboardLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 border-r-2 border-sidebar-border transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <DashboardSidebar
          navItems={navItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTabValue={activeNavValue}
          onNavClick={onNavClick}
          brandName={brandName}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 z-50 shadow-2xl">
            <DashboardSidebar
              navItems={navItems}
              collapsed={false}
              onClose={() => setMobileOpen(false)}
              activeTabValue={activeNavValue}
              onNavClick={onNavClick}
              brandName={brandName}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-black text-sm text-foreground">{brandName ?? 'Dashboard'}</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
