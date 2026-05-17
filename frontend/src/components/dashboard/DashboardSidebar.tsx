import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, X, Home, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  tabValue?: string;
  badge?: number;
}

interface DashboardSidebarProps {
  navItems: NavItem[];
  collapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  // For tab-based dashboards (admin):
  activeTabValue?: string;
  onNavClick?: (item: NavItem) => void;
  brandName?: string;
  brandLogo?: React.ReactNode;
}

export function DashboardSidebar({
  navItems,
  collapsed,
  onToggle,
  onClose,
  activeTabValue,
  onNavClick,
  brandName = 'BharatBrand',
  brandLogo,
}: DashboardSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const isActive = (item: NavItem) => {
    if (item.href) {
      if (item.href === '/brand' || item.href === '/admin') {
        return pathname === item.href;
      }
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    if (item.tabValue && activeTabValue) {
      return activeTabValue === item.tabValue;
    }
    return false;
  };

  const handleItemClick = (item: NavItem) => {
    if (item.href) {
      navigate(item.href);
      onClose?.();
    } else if (onNavClick) {
      onNavClick(item);
      onClose?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className={cn('flex items-center border-b border-sidebar-border h-16 px-3 flex-shrink-0', collapsed ? 'justify-center' : 'justify-between gap-2')}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {brandLogo}
            <span className="font-black text-sm truncate text-sidebar-foreground">{brandName}</span>
          </div>
        )}
        {onClose ? (
          <button onClick={onClose} aria-label="Close sidebar" className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        ) : onToggle ? (
          <button onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground flex-shrink-0">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      {/* Nav items */}
      <nav aria-label="Dashboard navigation" className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.href ?? item.tabValue}
              onClick={() => handleItemClick(item)}
              title={collapsed ? item.label : undefined}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                collapsed ? 'justify-center' : 'justify-start',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer: navigation escape + logout */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-1 flex-shrink-0">
        <button
          onClick={() => navigate('/', { state: { skipRoleRedirect: true } })}
          title={collapsed ? 'Back to Home' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <Home className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Back to Home</span>}
        </button>
        <button
          onClick={async () => { await logout(); navigate('/'); }}
          title={collapsed ? 'Log out' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-destructive/80 hover:bg-destructive/10 hover:text-destructive',
            collapsed ? 'justify-center' : 'justify-start'
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}
