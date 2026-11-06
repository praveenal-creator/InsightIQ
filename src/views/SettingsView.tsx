
import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Database,
  Check,
  Trash2,
  ShieldCheck,
  HardDrive,
  Activity,
  FileBarChart,
  BrainCircuit,
  Table2
} from 'lucide-react';

interface SettingsViewProps {
  datasetCount: number;
  analysisCount: number;
  modelCount: number;
  reportCount: number;
  onClearProductionData?: () => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  datasetCount,
  analysisCount,
  modelCount,
  reportCount,
  onClearProductionData,
  onNotify
}) => {
  const [workspaceName, setWorkspaceName] = useState('My InsightIQ Workspace');
  const [syncCadence, setSyncCadence] = useState('15m');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    onNotify(
      'Settings Updated',
      'Your workspace preferences have been updated for this session.',
      'success'
    );
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all your stored datasets, analyses, models, and reports? This action cannot be undone.'
    );

    if (!confirmed) return;

    onClearProductionData?.();

    onNotify(
      'Workspace Cleared',
      'Your stored workspace data has been cleared.',
      'success'
    );
  };

  const storageItems = [
    {
      label: 'Datasets',
      count: datasetCount,
      icon: Table2,
      color: 'text-cyan-400'
    },
    {
      label: 'AI Analyses',
      count: analysisCount,
      icon: Activity,
      color: 'text-purple-400'
    },
    {
      label: 'ML Models',
      count: modelCount,
      icon: BrainCircuit,
      color: 'text-indigo-400'
    },
    {
      label: 'Saved Reports',
      count: reportCount,
      icon: FileBarChart,
      color: 'text-emerald-400'
    }
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Workspace Settings
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Manage your workspace preferences, data and application settings.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Workspace Configuration */}
        <div className="lg:col-span-7 space-y-6">

          <form
            onSubmit={handleSaveSettings}
            className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-5"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />

              <h2 className="text-sm font-semibold text-slate-100">
                General Workspace Configuration
              </h2>
            </div>

            <div className="space-y-4 text-xs">

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Workspace Name
                </label>

                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2">
                  Preferred Data Refresh Interval
                </label>

                <select
                  value={syncCadence}
                  onChange={(e) => setSyncCadence(e.target.value)}
                  className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="realtime">Real-time</option>
                  <option value="15m">Every 15 Minutes</option>
                  <option value="1h">Every Hour</option>
                  <option value="24h">Daily</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-500">
                These are workspace preferences. Automatic background
                synchronization will require a configured data connection.
              </p>

            </div>
          </form>

          {/* Account & Security */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-3">

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />

              <h2 className="text-sm font-semibold text-slate-100">
                Account & Security
              </h2>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#090E1A] rounded-lg border border-slate-800/70">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5" />

              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Supabase Authentication
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Your account authentication is managed through Supabase.
                  Access to your account is protected by your sign-in method.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              API key management and team permissions are not yet configured.
            </p>

          </div>

        </div>

        {/* Workspace Data */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />

                <h2 className="text-sm font-semibold text-slate-100">
                  Workspace Data
                </h2>
              </div>

              <span className="text-[10px] text-emerald-400 font-medium">
                Your Workspace
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Overview of the data currently available in your workspace.
            </p>

            <div className="grid grid-cols-2 gap-3">

              {storageItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="p-3 bg-[#090E1A] rounded-lg border border-slate-800/80"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {item.label}
                      </span>

                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>

                    <p className={`text-xl font-semibold font-mono mt-2 ${item.color}`}>
                      {item.count}
                    </p>
                  </div>
                );
              })}

            </div>

            <div className="p-3 bg-[#090E1A] rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />

                <span className="text-xs font-semibold text-slate-200">
                  Workspace Storage
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                Your workspace data is currently managed by the application's
                configured storage system.
              </p>
            </div>

          </div>

          {/* Data Management */}
          <div className="bg-[#0D1424] border border-rose-900/40 rounded-xl p-5 space-y-4">

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Trash2 className="w-4 h-4 text-rose-400" />

              <h2 className="text-sm font-semibold text-slate-100">
                Data Management
              </h2>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-200">
                Clear Workspace Data
              </p>

              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Remove your stored datasets, analyses, predictive models and
                reports from the workspace.
              </p>
            </div>

            <button
              onClick={handleClearData}
              disabled={!onClearProductionData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Workspace Data
            </button>

            <p className="text-[10px] text-slate-500">
              This action requires confirmation and cannot be undone.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
};
