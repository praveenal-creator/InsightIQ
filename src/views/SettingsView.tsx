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
  onResetDemoData: () => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDemoData,
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
          {/* Demonstration Environment Control */}
          <div className="bg-[#0D1424] border border-cyan-900/60 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Demonstration Data Engine</h2>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Clear Demonstration Labeling</span>
              </div>
              <p className="leading-relaxed">
                All records, analyses, and ML telemetry loaded in InsightIQ are synthetic demonstration assets designed to illustrate enterprise B2B workflows.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-xs text-slate-400">
                Need to reset uploaded tables, revert cleaning recipes, and restore all default dataset fixtures?
              </p>

              <button
                onClick={() => {
                  onResetDemoData();
                  onNotify('Demonstration State Reset', 'All datasets and pipeline recipes have been reinitialized.', 'success');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset to Factory Demo State</span>
              </button>
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
