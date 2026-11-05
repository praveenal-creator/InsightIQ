import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  ArrowUpRight, 
  Upload, 
  Plus, 
  BarChart2, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileCode2,
  RefreshCw,
  Download
} from 'lucide-react';
import { NavigationId, Dataset, Analysis, ActivityItem } from '../types';
import { CardSkeleton, TableRowSkeleton } from '../components/common/Skeleton';
import { Tooltip } from '../components/common/Tooltip';
import { exportAnalysesToCsv, exportToCsv } from '../utils/exportCsv';

interface OverviewViewProps {
  onNavigate: (view: NavigationId) => void;
  datasets: Dataset[];
  analyses: Analysis[];
  activities: ActivityItem[];
  onOpenUploadModal: () => void;
  onSelectDatasetForExplore: (datasetId: string) => void;
  onNotify?: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  datasets,
  analyses,
  activities,
  onOpenUploadModal,
  onSelectDatasetForExplore,
  onNotify
}) => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'q3'>('7d');
  const [activityFilter, setActivityFilter] = useState<'all' | 'clean' | 'ai' | 'query' | 'upload'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulateReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  const totalRows = datasets.reduce((acc, curr) => acc + curr.rows, 0);
  const avgHealthScore = Math.round(datasets.reduce((acc, curr) => acc + curr.healthScore, 0) / (datasets.length || 1));

  const filteredActivities = activityFilter === 'all' 
    ? activities 
    : activities.filter(a => a.type === activityFilter);

  const handleExportAllAnalyses = () => {
    const filename = `insightiq_recent_analyses_${Date.now()}.csv`;
    const ok = exportAnalysesToCsv(analyses, filename);
    if (ok && onNotify) {
      onNotify('Analyses Exported', `Exported ${analyses.length} analysis discoveries as ${filename}`, 'success');
    }
  };

  const handleExportSingleAnalysis = (analysis: Analysis) => {
    const filename = `analysis_${analysis.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}.csv`;
    const ok = exportAnalysesToCsv([analysis], filename);
    if (ok && onNotify) {
      onNotify('Analysis Exported', `Analysis "${analysis.title}" exported as ${filename}`, 'success');
    }
  };

  const handleExportDatasetCsv = (ds: Dataset) => {
    if (!ds.sampleData || ds.sampleData.length === 0) return;
    const filename = `${ds.name.toLowerCase().replace(/\s+/g, '_')}_records_${Date.now()}.csv`;
    const ok = exportToCsv(ds.sampleData, filename);
    if (ok && onNotify) {
      onNotify('Dataset Exported', `Exported ${ds.sampleData.length} records from ${ds.name} as CSV`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0C1527] via-[#0E1A33] to-[#0A1324] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Production Intelligence Hub
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Cluster Nominal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, Dr. Elena Rostova
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your automated pipelines processed <span className="text-cyan-300 font-semibold tabular-nums">4.82M rows</span> across 5 active data lakes today. 4 new AI anomaly discoveries require your review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Time filter selector */}
            <div className="flex items-center p-1 bg-[#080D1A]/80 border border-slate-800 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              {(['7d', '30d', 'q3'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range === '7d' ? 'Last 7d' : range === '30d' ? '30d' : 'Q3 2026'}
                </button>
              ))}
            </div>

            <Tooltip content="Simulate live skeleton refresh">
              <button
                type="button"
                onClick={handleSimulateReload}
                className="p-2 text-slate-400 hover:text-cyan-300 bg-[#080D1A] border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer"
                aria-label="Refresh overview data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </Tooltip>

            <button
              type="button"
              onClick={onOpenUploadModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-md shadow-cyan-950 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dataset Summary Cards (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Metric Card 1 */}
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Datasets</span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                  {datasets.length}
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                  <TrendingUp className="w-3 h-3" />
                  +2 this mo
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>{(totalRows / 1000000).toFixed(2)}M indexed records</span>
                <span className="text-cyan-400 font-mono">100% active</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">AI Discoveries</span>
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                  342
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                  <TrendingUp className="w-3 h-3" />
                  +18.4%
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>98.4% avg confidence</span>
                <span className="text-cyan-400 font-mono">4 critical</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Data Hygiene Score</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                  {avgHealthScore}%
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5">
                  Optimal
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>0 unaddressed anomalies</span>
                <span className="text-emerald-400 font-mono">Tier 1</span>
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Query Runtime Avg</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Terminal className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                  18ms
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 tabular-nums">
                  -4ms MoM
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
                <span>1,480 queries logged</span>
                <span className="text-purple-400 font-mono">100% cache</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quick Actions
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400">Direct shortcuts to high-frequency engineering workflows</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ai-analyst')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask AI Analyst</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('visualizations')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Build Visualization</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('sql-playground')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Run SQL Query</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section: Recent Datasets & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Recent Datasets */}
        <div className="lg:col-span-7 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A]">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Recent Datasets</h2>
              <span className="text-[11px] text-slate-400 tabular-nums">({datasets.length} Active)</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('datasets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View all datasets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dataset Name</th>
                  <th className="px-3 py-3">Format</th>
                  <th className="px-3 py-3 text-right">Rows</th>
                  <th className="px-3 py-3 text-center">Health</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <>
                    <TableRowSkeleton columns={5} />
                    <TableRowSkeleton columns={5} />
                    <TableRowSkeleton columns={5} />
                  </>
                ) : (
                  datasets.slice(0, 4).map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {ds.name}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {ds.updatedAt}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700/60 rounded">
                          {ds.format}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-300">
                        {ds.rows.toLocaleString()}
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="text-xs font-medium font-mono text-emerald-400 tabular-nums">
                          {ds.healthScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDatasetForExplore(ds.id);
                              onNavigate('explore');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-slate-800 hover:bg-cyan-900/40 border border-slate-700/80 rounded transition-colors cursor-pointer"
                          >
                            Explore
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('cleaning')}
                            className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          >
                            Clean
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportDatasetCsv(ds)}
                            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Export sample dataset as CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Columns: Recent Analyses */}
        <div className="lg:col-span-5 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Recent AI Analyses</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportAllAnalyses}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors cursor-pointer"
                title="Export all recent analysis results as a CSV file"
              >
                <Download className="w-3 h-3 text-cyan-400" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ai-analyst')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Copilot Hub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
            {analyses.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-lg bg-[#090E1A]/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">
                      {item.category} · {item.datasetName}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-100 mt-0.5 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 tabular-nums">{item.createdAt}</span>
                    <div className="text-xs font-mono font-semibold text-cyan-300 tabular-nums">
                      {item.confidence}% conf
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{item.keyMetric}:</span>
                    <span className={`text-xs font-mono font-medium ${item.isPositive ? 'text-emerald-400' : 'text-rose-400'} tabular-nums`}>
                      {item.metricChange}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleExportSingleAnalysis(item)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 font-medium cursor-pointer"
                      title="Download this specific analysis result as a CSV file"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => onNavigate('ai-analyst')}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      Investigate →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A] gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">Live Activity Audit Feed</h2>
            <span className="text-[11px] text-slate-400 tabular-nums">({filteredActivities.length} events logged)</span>
          </div>

          {/* Activity Category Filters */}
          <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg">
            {(['all', 'clean', 'ai', 'query', 'upload'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActivityFilter(filter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activityFilter === filter
                    ? 'bg-slate-800 text-cyan-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'clean' ? 'Cleaning' : filter === 'ai' ? 'AI' : filter === 'query' ? 'SQL' : 'Ingest'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          <div className="relative border-l border-slate-800 ml-4 space-y-6">
            {filteredActivities.map((act) => {
              const iconMap = {
                clean: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
                ai: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
                query: <Terminal className="w-3.5 h-3.5 text-purple-400" />,
                upload: <Upload className="w-3.5 h-3.5 text-blue-400" />,
                export: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              };

              return (
                <div key={act.id} className="relative pl-6">
                  {/* Timeline bullet node */}
                  <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-[#080D1A] border border-slate-700 flex items-center justify-center">
                    {iconMap[act.type]}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{act.user}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-400">{act.action}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums">{act.timestamp}</span>
                  </div>

                  <p className="text-xs font-mono text-slate-300 mt-1 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {act.target}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
