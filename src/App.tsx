/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationId, Dataset, Analysis, ActivityItem, NotificationItem } from './types';
import { 
  INITIAL_DATASETS, 
  INITIAL_ANALYSES, 
  INITIAL_ACTIVITIES, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

// Layout & Navigation Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DemoBanner } from './components/common/DemoBanner';
import { CommandPalette } from './components/common/CommandPalette';
import { UploadDatasetModal } from './components/common/UploadDatasetModal';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Views for all 10 Navigation Items
import { OverviewView } from './views/OverviewView';
import { DatasetsView } from './views/DatasetsView';
import { AiAnalystView } from './views/AiAnalystView';
import { ExploreDataView } from './views/ExploreDataView';
import { DataCleaningView } from './views/DataCleaningView';
import { VisualizationsView } from './views/VisualizationsView';
import { PredictiveLabView } from './views/PredictiveLabView';
import { SqlPlaygroundView } from './views/SqlPlaygroundView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  // Hash Routing Logic
  const getInitialView = (): NavigationId => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validViews: NavigationId[] = [
      'overview',
      'datasets',
      'ai-analyst',
      'explore',
      'cleaning',
      'visualizations',
      'predictive-lab',
      'sql-playground',
      'reports',
      'settings'
    ];
    return validViews.includes(hash as NavigationId) ? (hash as NavigationId) : 'overview';
  };

  const [currentView, setCurrentView] = useState<NavigationId>(getInitialView);
  const [datasets, setDatasets] = useState<Dataset[]>(INITIAL_DATASETS);
  const [analyses, setAnalyses] = useState<Analysis[]>(INITIAL_ANALYSES);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Cross-view selection state
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(INITIAL_DATASETS[0]?.id || '');
  const [injectedSqlQuery, setInjectedSqlQuery] = useState<string | undefined>(undefined);

  // Layout UI states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const validViews: NavigationId[] = [
        'overview',
        'datasets',
        'ai-analyst',
        'explore',
        'cleaning',
        'visualizations',
        'predictive-lab',
        'sql-playground',
        'reports',
        'settings'
      ];
      if (validViews.includes(hash as NavigationId)) {
        setCurrentView(hash as NavigationId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view: NavigationId) => {
    setCurrentView(view);
    window.location.hash = `#/${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Helpers
  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Notification handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All Caught Up', 'Marked all notifications as read.', 'info');
  };

  // Reset demonstration data
  const handleResetDemoData = () => {
    setDatasets(INITIAL_DATASETS);
    setAnalyses(INITIAL_ANALYSES);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedDatasetId(INITIAL_DATASETS[0].id);
    addToast('Demo State Reinitialized', 'Restored 5 synthetic datasets, metrics, and default queries.', 'success');
  };

  // Ingest new dataset
  const handleAddDataset = (newDataset: Dataset) => {
    setDatasets(prev => [newDataset, ...prev]);
    setSelectedDatasetId(newDataset.id);
    
    // Log activity
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      user: 'Dr. Elena Rostova',
      avatar: 'ER',
      action: 'Connected new data stream',
      target: `${newDataset.name} (${newDataset.rows.toLocaleString()} rows, ${newDataset.format})`,
      type: 'upload'
    };
    setActivities(prev => [newActivity, ...prev]);

    // Push notification
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Dataset Ingestion Succeeded',
      message: `${newDataset.name} was indexed with 0 schema violations.`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      linkTo: 'explore'
    };
    setNotifications(prev => [newNotification, ...prev]);

    addToast('Dataset Connected', `${newDataset.name} has been indexed.`, 'success');
  };

  // Delete dataset
  const handleDeleteDataset = (id: string) => {
    const ds = datasets.find(d => d.id === id);
    setDatasets(prev => prev.filter(d => d.id !== id));
    if (selectedDatasetId === id) {
      const remaining = datasets.filter(d => d.id !== id);
      if (remaining.length > 0) {
        setSelectedDatasetId(remaining[0].id);
      }
    }
    addToast('Dataset Removed', `${ds?.name || 'Dataset'} was detached from the data lake.`, 'info');
  };

  // Cross-view bridge: from AI Analyst to SQL Playground
  const handleRunQueryInPlayground = (sql: string) => {
    setInjectedSqlQuery(sql);
    handleNavigate('sql-playground');
    addToast('Query Injected into SQL Playground', 'Ready for live execution evaluation.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      {/* Clear Demonstration Data Notification Bar */}
      <DemoBanner onResetDemoData={handleResetDemoData} />

      {/* Main App Layout */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Responsive Collapsible Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          datasetCount={datasets.length}
        />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <Header
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          />

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentView === 'overview' && (
              <OverviewView
                onNavigate={handleNavigate}
                datasets={datasets}
                analyses={analyses}
                activities={activities}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onSelectDatasetForExplore={(id) => {
                  setSelectedDatasetId(id);
                  handleNavigate('explore');
                }}
                onNotify={addToast}
              />
            )}

            {currentView === 'datasets' && (
              <DatasetsView
                datasets={datasets}
                onNavigate={handleNavigate}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onSelectDatasetForExplore={(id) => {
                  setSelectedDatasetId(id);
                  handleNavigate('explore');
                }}
                onDeleteDataset={handleDeleteDataset}
              />
            )}

            {currentView === 'ai-analyst' && (
              <AiAnalystView
                datasets={datasets}
                onNavigate={handleNavigate}
                onRunQueryInPlayground={handleRunQueryInPlayground}
                onNotify={addToast}
              />
            )}

            {currentView === 'explore' && (
              <ExploreDataView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'cleaning' && (
              <DataCleaningView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'visualizations' && (
              <VisualizationsView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'predictive-lab' && (
              <PredictiveLabView
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'sql-playground' && (
              <SqlPlaygroundView
                datasets={datasets}
                initialQuery={injectedSqlQuery}
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                datasets={datasets}
                onNavigate={handleNavigate}
                onNotify={addToast}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                onResetDemoData={handleResetDemoData}
                onNotify={addToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals & Overlays */}
      <UploadDatasetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddDataset={handleAddDataset}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
        datasets={datasets}
        onSelectDataset={setSelectedDatasetId}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
