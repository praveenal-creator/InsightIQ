
import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Check,
  ExternalLink,
  User as UserIcon,
  Sliders,
  LogOut,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';

import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
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
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get the real Supabase user
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        console.error('Unable to load user:', error.message);
        return;
      }

      setUser(data.user);
    };

    loadUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Real user information
  const email = user?.email ?? '';
  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split('@')[0] ||
    'User';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join('') || 'U';

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Actual Supabase logout
  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);
    setSignOutError('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setSignOutError(error.message);
        setSigningOut(false);
        return;
      }

      setShowUserMenu(false);
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : 'Unable to sign out.'
      );
      setSigningOut(false);
    }
  };

  const getBreadcrumbs = () => {
    const map: Record<NavigationId, { section: string; title: string }> = {
      overview: { section: 'Workspace', title: 'Executive Overview' },
      datasets: { section: 'Workspace', title: 'My Datasets' },
      'ai-analyst': { section: 'Intelligence', title: 'AI Analyst' },
      explore: { section: 'Intelligence', title: 'Data Explorer' },
      visualizations: { section: 'Intelligence', title: 'Visualizations' },
      cleaning: { section: 'Engineering', title: 'Data Cleaning Studio' },
      'predictive-lab': { section: 'Engineering', title: 'Predictive ML Lab' },
      'sql-playground': { section: 'Engineering', title: 'SQL Playground' },
      reports: { section: 'Governance', title: 'Executive Reports' },
      settings: { section: 'Governance', title: 'Workspace Settings' }
    };

    return map[currentView] || {
      section: 'InsightIQ',
      title: 'Workspace'
    };
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#080D1A]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">

      {/* Left side */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 truncate"
        >
          <span className="hidden sm:inline">InsightIQ</span>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-600" />
          <span className="hidden md:inline">{breadcrumbs.section}</span>
          <ChevronRight className="hidden md:inline w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-100 font-semibold truncate">
            {breadcrumbs.title}
          </span>
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* Search */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer"
          title="Search anything"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">
            Search datasets, metrics...
          </span>
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />

            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0D1424] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">

              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-100">
                  Notifications ({unreadCount} unread)
                </span>

                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsAsRead}
                    className="text-[11px] text-cyan-400 cursor-pointer"
                  >
                    <Check className="w-3 h-3 inline mr-1" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 hover:bg-slate-800/40"
                    >
                      <div className="flex justify-between gap-2">
                        <h4 className="text-xs font-medium text-slate-200">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        {item.message}
                      </p>

                      <div className="flex justify-between mt-2">
                        {item.linkTo ? (
                          <button
                            onClick={() => {
                              onNavigate(item.linkTo!);
                              onMarkNotificationAsRead(item.id);
                              setShowNotifications(false);
                            }}
                            className="text-[11px] text-cyan-400 cursor-pointer"
                          >
                            Open <ExternalLink className="w-3 h-3 inline" />
                          </button>
                        ) : <span />}

                        {!item.read && (
                          <button
                            onClick={() => onMarkNotificationAsRead(item.id)}
                            className="text-[10px] text-slate-400 cursor-pointer"
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

        {/* Real User Profile */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200">
                {fullName}
              </span>
              <span className="text-[10px] text-slate-400">
                {email}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0D1424] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 text-xs">

              <div className="px-3.5 py-3 border-b border-slate-800">
                <p className="font-semibold text-slate-100 truncate">
                  {fullName}
                </p>

                <p className="text-[11px] text-slate-400 truncate">
                  {email}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticated account</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 text-left"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile & Permissions</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 text-left"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Workspace Preferences</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('ai-analyst');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60 text-left"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>InsightIQ Copilot</span>
                </button>
              </div>

              {/* Actual Sign Out */}
              <div className="pt-1 border-t border-slate-800">
                {signOutError && (
                  <p className="px-3.5 py-2 text-rose-400">
                    {signOutError}
                  </p>
                )}

                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-400 hover:bg-rose-950/20 text-left disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>
                    {signingOut ? 'Signing out...' : 'Sign out'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
