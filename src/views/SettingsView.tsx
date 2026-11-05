import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Key, 
  Bell, 
  Users, 
  Database, 
  RefreshCw, 
  Check, 
  Copy, 
  ShieldCheck, 
  Sliders,
  Trash2,
  Plus
} from 'lucide-react';
import { NavigationId } from '../types';

interface SettingsViewProps {
  isDemoMode: boolean;
  datasetCount: number;
  analysisCount: number;
  modelCount: number;
  reportCount: number;
  onResetDemoData: () => void;
  onLoadDemoMode?: () => void;
  onExitDemoMode?: () => void;
  onClearProductionData?: () => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isDemoMode,
  datasetCount,
  analysisCount,
  modelCount,
  reportCount,
  onResetDemoData,
  onLoadDemoMode,
  onExitDemoMode,
  onClearProductionData,
  onNotify
}) => {
  const [workspaceName, setWorkspaceName] = useState('Acme Enterprise Intelligence');
  const [syncCadence, setSyncCadence] = useState('15m');
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Dr. Elena Rostova', email: 'elena.rostova@enterprise.internal', role: 'Principal Admin', status: 'Active' },
    { id: 2, name: 'Marcus Vance', email: 'marcus.v@enterprise.internal', role: 'Lead Data Engineer', status: 'Active' },
    { id: 3, name: 'Priya Sharma', email: 'priya.s@enterprise.internal', role: 'ML Ops Specialist', status: 'Active' },
    { id: 4, name: 'Alex Thorne', email: 'alex.t@enterprise.internal', role: 'Financial Analyst', status: 'Active' }
  ]);

  const apiKey = 'iq_live_99482bf47a1188d019ec449c2a71f008';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
    onNotify('API Key Copied', 'Production key copied to system clipboard.', 'info');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onNotify('Settings Saved', 'Workspace configuration updated across all distributed worker clusters.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              <span>Workspace Settings</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded font-mono">
              Cluster Node us-east-1a
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure telemetry cadence, workspace governance, member permissions, and demonstration state.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Workspace Info & API Keys */}
        <div className="lg:col-span-7 space-y-6">
          {/* General Workspace Info */}
          <form onSubmit={handleSaveSettings} className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">General Workspace Configuration</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ingestion Refresh Cadence</label>
                  <select
                    value={syncCadence}
                    onChange={(e) => setSyncCadence(e.target.value)}
                    className="w-full bg-[#090E1A] border border-slate-700/80 rounded-lg px-3 py-2 text-slate-100 focus:outline-none cursor-pointer"
                  >
                    <option value="realtime">Continuous Real-time Streaming</option>
                    <option value="15m">Every 15 Minutes</option>
                    <option value="1h">Hourly Batch</option>
                    <option value="24h">Daily Midnight Consolidation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Region</label>
                  <input
                    type="text"
                    disabled
                    value="US-East (N. Virginia) · Tier 1"
                    className="w-full bg-[#080C16] border border-slate-800 rounded-lg px-3 py-2 text-slate-500"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* API Access & Service Credentials */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-slate-100">Live API Authentication</h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Status: Enabled</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400">
                Use this token to query schemas, trigger pipeline executions, and fetch AI briefs via HTTP REST:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-[#090E1A] font-mono text-cyan-300 border border-slate-700/80 rounded-lg px-3 py-2 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{apiKeyCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-100">Team Governance ({teamMembers.length})</h2>
              </div>
              <button
                onClick={() => onNotify('Invite Modal', 'Team invitation dialog opened.', 'info')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Invite Member</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {teamMembers.map(m => (
                <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{m.name}</span>
                    <span className="text-slate-400 block text-[11px]">{m.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Demo Data Control & System State */}
        <div className="lg:col-span-5 space-y-6">
          {/* Environment & Data Mode Manager */}
          <div className="bg-[#0D1424] border border-cyan-900/60 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-slate-100">Environment & Data Mode</h2>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                isDemoMode ? 'bg-amber-950/70 text-amber-300 border border-amber-800/80' : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/80'
              }`}>
                {isDemoMode ? 'Demo Mode' : 'Clean Production'}
              </span>
            </div>

            <div className={`p-3 rounded-lg text-xs space-y-2 border ${
              isDemoMode 
                ? 'bg-amber-950/20 border-amber-800/40 text-amber-200/90' 
                : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200/90'
            }`}>
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{isDemoMode ? 'Demonstration Dataset Fixtures Active' : 'Clean Production Mode Enforced'}</span>
              </div>
              <p className="leading-relaxed text-[11px] text-slate-300">
                {isDemoMode 
                  ? 'Showing 5 synthetic enterprise datasets, sample analyses, and simulated predictive models. Your real uploads remain safely isolated.' 
                  : 'Zero fabricated records. All dashboard KPIs, queries, and reports reflect strictly your uploaded files and actual in-memory queries.'}
              </p>
            </div>

            {/* Current Storage Metrics */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#090E1A] rounded-lg border border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Datasets</span>
                <span className="font-mono font-semibold text-cyan-300">{datasetCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">AI Analyses</span>
                <span className="font-mono font-semibold text-purple-300">{analysisCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ML Models</span>
                <span className="font-mono font-semibold text-indigo-300">{modelCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Saved Reports</span>
                <span className="font-mono font-semibold text-emerald-300">{reportCount}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {isDemoMode ? (
                <>
                  {onExitDemoMode && (
                    <button
                      onClick={() => {
                        onExitDemoMode();
                        onNotify('Switched to Production', 'Returned to clean workspace with zero demo records.', 'info');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Exit Demo Mode (Return to Clean Production)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onResetDemoData();
                      onNotify('Sample Data Reinitialized', 'Factory demonstration fixtures reloaded.', 'success');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Sample Datasets</span>
                  </button>
                </>
              ) : (
                <>
                  {onLoadDemoMode && (
                    <button
                      onClick={() => {
                        onLoadDemoMode();
                        onNotify('Demo Mode Enabled', 'Loaded 5 synthetic enterprise datasets for feature evaluation.', 'info');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Load Sample Datasets (Demo Mode)</span>
                    </button>
                  )}
                  {onClearProductionData && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear all stored user datasets and reset your workspace?')) {
                          onClearProductionData();
                          onNotify('Workspace Reset', 'All user datasets, analyses, and history cleared.', 'info');
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Stored User Data</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* System Telemetry & Cluster Nodes */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              System Infrastructure Specs
            </h3>
            <div className="space-y-2 font-mono text-slate-400">
              <div className="flex justify-between">
                <span>OLAP Worker Nodes:</span>
                <span className="text-slate-200">8 / 8 Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>In-Memory Storage:</span>
                <span className="text-slate-200">694.3 MB Allocated</span>
              </div>
              <div className="flex justify-between">
                <span>Schema Validator:</span>
                <span className="text-emerald-400">Strict Active</span>
              </div>
              <div className="flex justify-between">
                <span>UI Architecture:</span>
                <span className="text-cyan-300">Vite + React 19 + Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
