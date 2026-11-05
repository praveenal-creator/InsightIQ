import React, { useState, useEffect, useRef } from 'react';
import { Search, Database, Sparkles, LineChart, Code2, ArrowRight, Settings, FileText, Filter, SlidersHorizontal, Table } from 'lucide-react';
import { NavigationId, Dataset } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: NavigationId) => void;
  datasets: Dataset[];
  onSelectDataset?: (datasetId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  datasets,
  onSelectDataset
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigationItems = [
    { id: 'overview', title: 'Overview Dashboard', icon: LineChart, category: 'Navigation' },
    { id: 'datasets', title: 'My Datasets & Repositories', icon: Database, category: 'Navigation' },
    { id: 'ai-analyst', title: 'AI Analyst Intelligence', icon: Sparkles, category: 'Intelligence' },
    { id: 'explore', title: 'Explore Data & Schema', icon: Table, category: 'Exploration' },
    { id: 'cleaning', title: 'Data Cleaning Pipeline Studio', icon: Filter, category: 'Pipelines' },
    { id: 'visualizations', title: 'Visualizations Studio', icon: LineChart, category: 'Analysis' },
    { id: 'predictive-lab', title: 'Predictive Lab & ML Modeling', icon: SlidersHorizontal, category: 'Machine Learning' },
    { id: 'sql-playground', title: 'SQL Playground Query Engine', icon: Code2, category: 'Query Engine' },
    { id: 'reports', title: 'Executive Reports & Briefs', icon: FileText, category: 'Reporting' },
    { id: 'settings', title: 'Workspace Settings & API Keys', icon: Settings, category: 'System' }
  ];

  const filteredNav = navigationItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDatasets = datasets.filter(ds =>
    ds.name.toLowerCase().includes(query.toLowerCase()) ||
    ds.format.toLowerCase().includes(query.toLowerCase()) ||
    ds.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command search"
        className="relative w-full max-w-xl bg-[#0D1424] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#090E1A]">
          <Search className="w-5 h-5 text-cyan-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, or search datasets..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation & Modules
            </div>
            <div className="space-y-0.5">
              {filteredNav.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id as NavigationId);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{item.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredDatasets.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Datasets ({filteredDatasets.length})
              </div>
              <div className="space-y-0.5">
                {filteredDatasets.map(ds => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      if (onSelectDataset) onSelectDataset(ds.id);
                      onNavigate('explore');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">{ds.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {ds.format}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredDatasets.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No results found for "{query}". Try searching for "SQL", "Churn", or "Cohorts".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
