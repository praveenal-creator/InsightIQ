import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Check, 
  ExternalLink, 
  User, 
  Sliders, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { NavigationId, NotificationItem } from '../../types';

interface HeaderProps {
  currentView: NavigationId;
  onNavigate: (view: NavigationId) => void;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    const map: Record<NavigationId, { section: string; title: string }> = {
      'overview': { section: 'Workspace', title: 'Executive Overview' },
      'datasets': { section: 'Workspace', title: 'My Datasets' },
      'ai-analyst': { section: 'Intelligence', title: 'AI Analyst' },
      'explore': { section: 'Intelligence', title: 'Data Explorer' },
      'visualizations': { section: 'Intelligence', title: 'Visualizations' },
      'cleaning': { section: 'Engineering', title: 'Data Cleaning Studio' },
      'predictive-lab': { section: 'Engineering', title: 'Predictive ML Lab' },
      'sql-playground': { section: 'Engineering', title: 'SQL Playground' },
      'reports': { section: 'Governance', title: 'Executive Reports' },
      'settings': { section: 'Governance', title: 'Workspace Settings' }
    };
    return map[currentView] || { section: 'InsightIQ', title: 'Workspace' };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#080D1A]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate">
          <span className="hidden sm:inline text-slate-400">InsightIQ</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-400 hidden md:inline">{breadcrumbs.section}</span>
          <ChevronRight className="hidden md:inline w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-100 font-semibold truncate">{breadcrumbs.title}</span>
        </nav>
      </div>

      {/* Right side: Search trigger, Notifications, User menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Global Search Shortcut button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
          title="Search anything (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Search datasets, metrics...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700/60 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0D1424] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#090E1A]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-cyan-500/20 text-cyan-300 rounded">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsAsRead}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 transition-colors ${
                        item.read ? 'bg-transparent opacity-75' : 'bg-cyan-950/20'
                      } hover:bg-slate-800/40`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-slate-200">{item.title}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-1">
                        {item.linkTo ? (
                          <button
                            onClick={() => {
                              onNavigate(item.linkTo!);
                              onMarkNotificationAsRead(item.id);
                              setShowNotifications(false);
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open in {item.linkTo}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : <div />}
                        {!item.read && (
                          <button
                            onClick={() => onMarkNotificationAsRead(item.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-300 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 text-left rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              ER
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">Dr. Elena Rostova</span>
              <span className="text-[10px] text-slate-400 leading-tight">Principal Data Scientist</span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0D1424] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-800">
                <p className="font-semibold text-slate-100">Dr. Elena Rostova</p>
                <p className="text-[11px] text-slate-400 truncate">elena.rostova@enterprise.internal</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-cyan-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin & Analytics Lead</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile & Permissions</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                >
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>Workspace Preferences</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('ai-analyst');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>InsightIQ Copilot</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
