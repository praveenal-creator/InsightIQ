
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Auth from './components/auth/Auth';

import {
  NavigationId,
  Dataset,
  Analysis,
  ActivityItem,
  NotificationItem,
  PredictiveModel,
  ReportItem,
  SqlQueryRecord
} from './types';

// Layout & Navigation Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { UploadDatasetModal } from './components/common/UploadDatasetModal';
import { listDatasetsFromApi, deleteDatasetApi } from './utils/datasetApi';
import { ToastContainer, ToastMessage } from './components/common/Toast';

// Views
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

const STORAGE_KEYS = {
  DATASETS: 'insightiq_prod_datasets',
  ANALYSES: 'insightiq_prod_analyses',
  ACTIVITIES: 'insightiq_prod_activities',
  MODELS: 'insightiq_prod_models',
  REPORTS: 'insightiq_prod_reports',
  QUERY_HISTORY: 'insightiq_query_history'
};

export default function App() {
  // ==========================================
  // SUPABASE AUTHENTICATION
  // ==========================================

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Session error:', error);
      }

      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================================
  // HASH ROUTING
  // ==========================================

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

    return validViews.includes(hash as NavigationId)
      ? (hash as NavigationId)
      : 'overview';
  };

  const [currentView, setCurrentView] = useState<NavigationId>(getInitialView);

  // ==========================================
  // USER DATA
  // ==========================================

  const [productionDatasets, setProductionDatasets] = useState<Dataset[]>([]);
  const [productionAnalyses, setProductionAnalyses] = useState<Analysis[]>([]);
  const [productionActivities, setProductionActivities] = useState<ActivityItem[]>([]);
  const [productionModels, setProductionModels] = useState<PredictiveModel[]>([]);
  const [productionReports, setProductionReports] = useState<ReportItem[]>([]);
  const [queryHistory, setQueryHistory] = useState<SqlQueryRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load user data after authentication.
  // Datasets are fetched from the authenticated cloud API.
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setProductionDatasets([]);
      setProductionAnalyses([]);
      setProductionActivities([]);
      setProductionModels([]);
      setProductionReports([]);
      setQueryHistory([]);
      setNotifications([]);
      return () => {
        cancelled = true;
      };
    }

    const loadStoredData = <T,>(key: string): T[] => {
      try {
        const stored = localStorage.getItem(`${key}_${user.id}`);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    };

    setProductionDatasets([]);
    setProductionAnalyses(loadStoredData<Analysis>(STORAGE_KEYS.ANALYSES));
    setProductionActivities(loadStoredData<ActivityItem>(STORAGE_KEYS.ACTIVITIES));
    setProductionModels(loadStoredData<PredictiveModel>(STORAGE_KEYS.MODELS));
    setProductionReports(loadStoredData<ReportItem>(STORAGE_KEYS.REPORTS));
    setQueryHistory(loadStoredData<SqlQueryRecord>(STORAGE_KEYS.QUERY_HISTORY));
    setNotifications([]);

    const loadCloudDatasets = async () => {
      try {
        const cloudDatasets = await listDatasetsFromApi();
        if (!cancelled) {
          setProductionDatasets(cloudDatasets);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Could not load cloud datasets:', error);
        }
      }
    };

    loadCloudDatasets();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ==========================================
  // DATA ALIASES
  // ==========================================

  const datasets = productionDatasets;
  const analyses = productionAnalyses;
  const activities = productionActivities;
  const models = productionModels;
  const reports = productionReports;

  // ==========================================
  // SELECTED DATASET
  // ==========================================

  const [selectedDatasetId, setSelectedDatasetId] = useState('');

  useEffect(() => {
    if (datasets.length > 0 && !datasets.some(d => d.id === selectedDatasetId)) {
      setSelectedDatasetId(datasets[0].id);
    }

    if (datasets.length === 0) {
      setSelectedDatasetId('');
    }
  }, [datasets, selectedDatasetId]);

  // ==========================================
  // UI STATES
  // ==========================================

  const [injectedSqlQuery, setInjectedSqlQuery] = useState<string | undefined>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ==========================================
  // HASH ROUTING SYNC
  // ==========================================

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

  // ==========================================
  // COMMAND PALETTE SHORTCUT
  // ==========================================

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

  // ==========================================
  // STORAGE HELPER
  // ==========================================

  const saveData = (key: string, value: unknown) => {
    if (!user) return;

    try {
      localStorage.setItem(
        `${key}_${user.id}`,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Could not save data:', error);
    }
  };

  // ==========================================
  // TOAST HELPERS
  // ==========================================

  const addToast = (
    title: string,
    description?: string,
    type: 'success' | 'info' | 'error' = 'info'
  ) => {
    const id = `toast-${Date.now()}`;

    const newToast: ToastMessage = {
      id,
      title,
      description,
      type
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All Caught Up', 'Marked all notifications as read.', 'info');
  };

  // ==========================================
  // CLEAR WORKSPACE
  // ==========================================

  const handleClearProductionData = () => {
    setProductionDatasets([]);
    setProductionAnalyses([]);
    setProductionActivities([]);
    setProductionModels([]);
    setProductionReports([]);
    setQueryHistory([]);
    setNotifications([]);

    if (user) {
      Object.values(STORAGE_KEYS).forEach(key => {
        try {
          localStorage.removeItem(`${key}_${user.id}`);
        } catch {}
      });
    }

    setSelectedDatasetId('');

    addToast(
      'Workspace Reset',
      'Your browser workspace data has been cleared.',
      'info'
    );
  };

  // ==========================================
  // ADD DATASET
  // ==========================================

  const handleAddDataset = (newDataset: Dataset) => {
    const updated = [newDataset, ...productionDatasets];

    setProductionDatasets(updated);

    setSelectedDatasetId(newDataset.id);

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      user: 'You',
      avatar: 'ME',
      action: 'Uploaded dataset',
      target: `${newDataset.name} (${newDataset.rows.toLocaleString()} rows, ${newDataset.format})`,
      type: 'upload'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);

    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Dataset Ingestion Succeeded',
      message: `${newDataset.name} was indexed.`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      linkTo: 'explore'
    };

    setNotifications(prev => [newNotification, ...prev]);

    addToast(
      'Dataset Connected',
      `${newDataset.name} has been indexed.`,
      'success'
    );
  };

  // ==========================================
  // DELETE DATASET
  // ==========================================

  const handleDeleteDataset = async (id: string) => {
    const ds = productionDatasets.find(d => d.id === id);

    try {
      await deleteDatasetApi(id);

      const updated = productionDatasets.filter(d => d.id !== id);
      setProductionDatasets(updated);

      if (selectedDatasetId === id) {
        setSelectedDatasetId(updated.length > 0 ? updated[0].id : '');
      }

      addToast(
        'Dataset Removed',
        `${ds?.name || 'Dataset'} was permanently removed from cloud storage.`,
        'success'
      );
    } catch (error) {
      console.error('Could not delete cloud dataset:', error);
      addToast(
        'Delete Failed',
        error instanceof Error ? error.message : 'Could not delete dataset from cloud storage.',
        'error'
      );
    }
  };

  // ==========================================
  // SAVE AI ANALYSIS
  // ==========================================

  const handleSaveAnalysis = (newAnalysis: Analysis) => {
    const updated = [newAnalysis, ...productionAnalyses];

    setProductionAnalyses(updated);
    saveData(STORAGE_KEYS.ANALYSES, updated);

    const newActivity: ActivityItem = {
      id: `act-ai-${Date.now()}`,
      timestamp: 'Just now',
      user: 'AI Copilot',
      avatar: 'AI',
      action: 'Completed analysis',
      target: newAnalysis.title,
      type: 'ai'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  };

  // ==========================================
  // SAVE ML MODEL
  // ==========================================

  const handleSaveModel = (newModel: PredictiveModel) => {
    const updated = [newModel, ...productionModels];

    setProductionModels(updated);
    saveData(STORAGE_KEYS.MODELS, updated);

    const newActivity: ActivityItem = {
      id: `act-ml-${Date.now()}`,
      timestamp: 'Just now',
      user: 'Predictive Lab',
      avatar: 'ML',
      action: 'Trained model',
      target: newModel.name,
      type: 'ai'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  };

  // ==========================================
  // GENERATE REPORT
  // ==========================================

  const handleGenerateReport = (newReport: ReportItem) => {
    const updated = [newReport, ...productionReports];

    setProductionReports(updated);
    saveData(STORAGE_KEYS.REPORTS, updated);

    const newActivity: ActivityItem = {
      id: `act-rep-${Date.now()}`,
      timestamp: 'Just now',
      user: 'Report Generator',
      avatar: 'RP',
      action: 'Generated brief',
      target: newReport.title,
      type: 'clean'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  };

  // ==========================================
  // LOG SQL QUERY
  // ==========================================

  const handleLogQuery = (record: SqlQueryRecord) => {
    const updated = [record, ...queryHistory.slice(0, 49)];

    setQueryHistory(updated);
    saveData(STORAGE_KEYS.QUERY_HISTORY, updated);

    const newActivity: ActivityItem = {
      id: `act-sql-${Date.now()}`,
      timestamp: 'Just now',
      user: 'SQL Engine',
      avatar: 'SQL',
      action: 'Executed query',
      target: `${record.rowCount} rows returned (${record.durationMs}ms)`,
      type: 'query'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  };

  // ==========================================
  // UPDATE DATASET
  // ==========================================

  const handleUpdateDatasetData = (
    datasetId: string,
    updatedRows: Record<string, any>[]
  ) => {
    const updated = productionDatasets.map(d => {
      if (d.id === datasetId) {
        return {
          ...d,
          sampleData: updatedRows,
          rows: updatedRows.length
        };
      }

      return d;
    });

    setProductionDatasets(updated);


    const newActivity: ActivityItem = {
      id: `act-clean-${Date.now()}`,
      timestamp: 'Just now',
      user: 'Data Hygiene',
      avatar: 'DH',
      action: 'Applied cleaning recipe',
      target: `${updatedRows.length} cleaned rows committed`,
      type: 'clean'
    };

    const updatedActivities = [newActivity, ...productionActivities];

    setProductionActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  };

  // ==========================================
  // AI ANALYST TO SQL PLAYGROUND
  // ==========================================

  const handleRunQueryInPlayground = (sql: string) => {
    setInjectedSqlQuery(sql);
    handleNavigate('sql-playground');

    addToast(
      'Query Injected into SQL Playground',
      'Ready for execution.',
      'info'
    );
  };

  // ==========================================
  // AUTHENTICATION LOADING
  // ==========================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-cyan-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Loading InsightIQ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // ==========================================
  // AUTHENTICATED DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">

      <div className="flex flex-1 min-h-0 relative">

        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
          datasetCount={datasets.length}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

          <Header
            currentView={currentView}
            onNavigate={handleNavigate}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            notifications={notifications}
            onMarkNotificationAsRead={handleMarkNotificationAsRead}
            onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">

            {currentView === 'overview' && (
              <OverviewView
                onNavigate={handleNavigate}
                datasets={datasets}
                analyses={analyses}
                activities={activities}
                queryHistoryCount={queryHistory.length}
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
                onSaveAnalysis={handleSaveAnalysis}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'explore' && (
              <ExploreDataView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'cleaning' && (
              <DataCleaningView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
                onUpdateDatasetData={handleUpdateDatasetData}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'visualizations' && (
              <VisualizationsView
                datasets={datasets}
                selectedDatasetId={selectedDatasetId}
                onSelectDataset={setSelectedDatasetId}
                onNavigate={handleNavigate}
                onNotify={addToast}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'predictive-lab' && (
              <PredictiveLabView
                models={models}
                datasets={datasets}
                onNavigate={handleNavigate}
                onNotify={addToast}
                onSaveModel={handleSaveModel}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'sql-playground' && (
              <SqlPlaygroundView
                datasets={datasets}
                initialQuery={injectedSqlQuery}
                onNavigate={handleNavigate}
                onNotify={addToast}
                queryHistory={queryHistory}
                onLogQuery={handleLogQuery}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                reports={reports}
                datasets={datasets}
                analyses={analyses}
                onNavigate={handleNavigate}
                onNotify={addToast}
                onGenerateReport={handleGenerateReport}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                datasetCount={datasets.length}
                analysisCount={analyses.length}
                modelCount={models.length}
                reportCount={reports.length}
                onClearProductionData={handleClearProductionData}
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

      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
      />

    </div>
  );
}
