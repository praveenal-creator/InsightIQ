import React from 'react';
import {
  LayoutDashboard,
  Database,
  Sparkles,
  Table,
  Filter,
  BarChart3,
  Cpu,
  Terminal,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Layers
} from 'lucide-react';
import { NavigationId } from '../../types';
import { Tooltip } from '../common/Tooltip';

interface SidebarProps {
  currentView: NavigationId;
  onNavigate: (view: NavigationId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  datasetCount: number;
}

interface NavItem {
  id: NavigationId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  datasetCount
}) => {
  const navSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Workspace',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'datasets', label: 'My Datasets', icon: Database, badge: datasetCount }
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { id: 'ai-analyst', label: 'AI Analyst', icon: Sparkles },
        { id: 'explore', label: 'Explore Data', icon: Table },
        { id: 'visualizations', label: 'Visualizations', icon: BarChart3 }
      ]
    },
    {
      title: 'Engineering & Lab',
      items: [
        { id: 'cleaning', label: 'Data Cleaning', icon: Filter },
        { id: 'predictive-lab', label: 'Predictive Lab', icon: Cpu },
        { id: 'sql-playground', label: 'SQL Playground', icon: Terminal }
      ]
    },
    {
      title: 'Governance',
      items: [
        { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  const handleNavClick = (id: NavigationId) => {
    onNavigate(id);
    if (isMobileOpen) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080D1A] border-r border-slate-800/80 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20 shrink-0">
            <Layers className="w-5 h-5 text-[#080D1A]" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                Insight<span className="text-cyan-400">IQ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase truncate">
                Data Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-100 rounded-lg"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                const navButton = (
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate text-left flex-1">{item.label}</span>
                    )}
                    {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );

                if (isCollapsed && !isMobileOpen) {
                  return (
                    <Tooltip key={item.id} content={item.label} position="right" className="w-full">
                      {navButton}
                    </Tooltip>
                  );
                }

                return <div key={item.id}>{navButton}</div>;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060A14]/60">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Insight Engine v2.4</span>
            </span>
            <span className="text-[10px] text-slate-400">Enterprise</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" title="System Ready" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <div className="fixed top-0 bottom-0 z-30 transition-all duration-300" style={{ width: isCollapsed ? 72 : 260 }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative w-[280px] max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
