/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { 
  SAMPLE_DATASETS, 
  SAMPLE_ANALYSES, 
  SAMPLE_ACTIVITIES, 
  SAMPLE_NOTIFICATIONS,
  SAMPLE_MODELS,
  SAMPLE_REPORTS
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

const STORAGE_KEYS = {
  DEMO_MODE: 'insightiq_demo_mode',
  DATASETS: 'insightiq_prod_datasets',
  ANALYSES: 'insightiq_prod_analyses',
  ACTIVITIES: 'insightiq_prod_activities',
  MODELS: 'insightiq_prod_models',
  REPORTS: 'insightiq_prod_reports',
  QUERY_HISTORY: 'insightiq_query_history'
};

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

  // Demo Mode toggle state (defaults to false for clean production)
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
    } catch {
      return false;
    }
  });

  // Production User Datasets (Persistent in LocalStorage)
  const [productionDatasets, setProductionDatasets] = useState<Dataset[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DATASETS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Production User Analyses
  const [productionAnalyses, setProductionAnalyses] = useState<Analysis[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ANALYSES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Production User Activities
  const [productionActivities, setProductionActivities] = useState<ActivityItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Production User ML Models
  const [productionModels, setProductionModels] = useState<PredictiveModel[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MODELS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Production User Reports
  const [productionReports, setProductionReports] = useState<ReportItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // SQL Query Execution History
  const [queryHistory, setQueryHistory] = useState<SqlQueryRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUERY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // In-memory demo datasets copy for when demo mode is active and user edits them
  const [activeDemoDatasets, setActiveDemoDatasets] = useState<Dataset[]>(SAMPLE_DATASETS);
  const [activeDemoAnalyses, setActiveDemoAnalyses] = useState<Analysis[]>(SAMPLE_ANALYSES);
  const [activeDemoActivities, setActiveDemoActivities] = useState<ActivityItem[]>(SAMPLE_ACTIVITIES);
  const [activeDemoModels, setActiveDemoModels] = useState<PredictiveModel[]>(SAMPLE_MODELS);
  const [activeDemoReports, setActiveDemoReports] = useState<ReportItem[]>(SAMPLE_REPORTS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Effective state combining production + demo data if demo mode is enabled
  const datasets = useMemo(() => {
    if (isDemoMode) {
      return [...productionDatasets, ...activeDemoDatasets];
    }
    return productionDatasets;
  }, [isDemoMode, productionDatasets, activeDemoDatasets]);

  const analyses = useMemo(() => {
    if (isDemoMode) {
      return [...productionAnalyses, ...activeDemoAnalyses];
    }
    return productionAnalyses;
  }, [isDemoMode, productionAnalyses, activeDemoAnalyses]);

  const activities = useMemo(() => {
    if (isDemoMode) {
      return [...productionActivities, ...activeDemoActivities];
    }
    return productionActivities;
  }, [isDemoMode, productionActivities, activeDemoActivities]);

  const models = useMemo(() => {
    if (isDemoMode) {
      return [...productionModels, ...activeDemoModels];
    }
    return productionModels;
  }, [isDemoMode, productionModels, activeDemoModels]);

  const reports = useMemo(() => {
    if (isDemoMode) {
      return [...productionReports, ...activeDemoReports];
    }
    return productionReports;
  }, [isDemoMode, productionReports, activeDemoReports]);

  // Selected dataset for exploration / cleaning / visualizations
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');

  useEffect(() => {
    if (datasets.length > 0 && !datasets.some(d => d.id === selectedDatasetId)) {
      setSelectedDatasetId(datasets[0].id);
    }
  }, [datasets, selectedDatasetId]);

  // Cross-view bridge: from AI Analyst to SQL Playground
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

  // Demo Mode Switchers
  const handleLoadDemoMode = () => {
    setIsDemoMode(true);
    setActiveDemoDatasets(SAMPLE_DATASETS);
    setActiveDemoAnalyses(SAMPLE_ANALYSES);
    setActiveDemoActivities(SAMPLE_ACTIVITIES);
    setActiveDemoModels(SAMPLE_MODELS);
    setActiveDemoReports(SAMPLE_REPORTS);
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
    } catch {}
    addToast('Demo Mode Enabled', 'Loaded 5 sample enterprise datasets and simulation models.', 'info');
  };

  const handleExitDemoMode = () => {
    setIsDemoMode(false);
    try {
      localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'false');
    } catch {}
    addToast('Clean Production Active', 'Switched to clean workspace showing only real user data.', 'success');
  };

  const handleResetDemoData = () => {
    setActiveDemoDatasets(SAMPLE_DATASETS);
    setActiveDemoAnalyses(SAMPLE_ANALYSES);
    setActiveDemoActivities(SAMPLE_ACTIVITIES);
    setActiveDemoModels(SAMPLE_MODELS);
    setActiveDemoReports(SAMPLE_REPORTS);
    addToast('Demo State Reinitialized', 'Restored 5 synthetic datasets, metrics, and default queries.', 'success');
  };

  const handleClearProductionData = () => {
    setProductionDatasets([]);
    setProductionAnalyses([]);
    setProductionActivities([]);
    setProductionModels([]);
    setProductionReports([]);
    setQueryHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.DATASETS);
      localStorage.removeItem(STORAGE_KEYS.ANALYSES);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
      localStorage.removeItem(STORAGE_KEYS.MODELS);
      localStorage.removeItem(STORAGE_KEYS.REPORTS);
      localStorage.removeItem(STORAGE_KEYS.QUERY_HISTORY);
    } catch {}
    addToast('Workspace Reset', 'All user datasets, analyses, and history have been cleared.', 'info');
  };

  // Ingest new dataset (always saves as real user dataset)
  const handleAddDataset = (newDataset: Dataset) => {
    const updated = [newDataset, ...productionDatasets];
    setProductionDatasets(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(updated));
    } catch {}

    setSelectedDatasetId(newDataset.id);
    
    // Log user activity
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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}

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
    if (ds?.isDemo) {
      setActiveDemoDatasets(prev => prev.filter(d => d.id !== id));
    } else {
      const updated = productionDatasets.filter(d => d.id !== id);
      setProductionDatasets(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(updated));
      } catch {}
    }

    if (selectedDatasetId === id) {
      const remaining = datasets.filter(d => d.id !== id);
      if (remaining.length > 0) {
        setSelectedDatasetId(remaining[0].id);
      } else {
        setSelectedDatasetId('');
      }
    }
    addToast('Dataset Removed', `${ds?.name || 'Dataset'} was detached from the data lake.`, 'info');
  };

  // Save AI Analysis
  const handleSaveAnalysis = (newAnalysis: Analysis) => {
    const updated = [newAnalysis, ...productionAnalyses];
    setProductionAnalyses(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(updated));
    } catch {}

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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}
  };

  // Save ML Model
  const handleSaveModel = (newModel: PredictiveModel) => {
    const updated = [newModel, ...productionModels];
    setProductionModels(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(updated));
    } catch {}

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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}
  };

  // Generate Report
  const handleGenerateReport = (newReport: ReportItem) => {
    const updated = [newReport, ...productionReports];
    setProductionReports(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(updated));
    } catch {}

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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}
  };

  // Log SQL Query
  const handleLogQuery = (record: SqlQueryRecord) => {
    const updated = [record, ...queryHistory.slice(0, 49)];
    setQueryHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.QUERY_HISTORY, JSON.stringify(updated));
    } catch {}

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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}
  };

  // Update Dataset rows (from Data Cleaning Studio)
  const handleUpdateDatasetData = (datasetId: string, updatedRows: Record<string, any>[]) => {
    const isTargetDemo = activeDemoDatasets.some(d => d.id === datasetId);
    if (isTargetDemo) {
      setActiveDemoDatasets(prev => prev.map(d => {
        if (d.id === datasetId) {
          return { ...d, sampleData: updatedRows, rows: updatedRows.length };
        }
        return d;
      }));
    } else {
      const updated = productionDatasets.map(d => {
        if (d.id === datasetId) {
          return { ...d, sampleData: updatedRows, rows: updatedRows.length };
        }
        return d;
      });
      setProductionDatasets(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(updated));
      } catch {}
    }

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
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
    } catch {}
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
      <DemoBanner 
        isDemoMode={isDemoMode}
        onResetDemoData={handleResetDemoData}
        onExitDemoMode={handleExitDemoMode}
        onLoadDemoMode={handleLoadDemoMode}
      />

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
                queryHistoryCount={queryHistory.length}
                isDemoMode={isDemoMode}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onSelectDatasetForExplore={(id) => {
                  setSelectedDatasetId(id);
                  handleNavigate('explore');
                }}
                onNotify={addToast}
                onLoadDemoMode={handleLoadDemoMode}
                onExitDemoMode={handleExitDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
                isDemoMode={isDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
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
                onLoadDemoMode={handleLoadDemoMode}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                isDemoMode={isDemoMode}
                datasetCount={datasets.length}
                analysisCount={analyses.length}
                modelCount={models.length}
                reportCount={reports.length}
                onResetDemoData={handleResetDemoData}
                onLoadDemoMode={handleLoadDemoMode}
                onExitDemoMode={handleExitDemoMode}
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

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
