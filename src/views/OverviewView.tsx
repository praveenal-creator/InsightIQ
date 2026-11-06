
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
  Clock,
  FileCode2,
  Download
} from 'lucide-react';

import { NavigationId, Dataset, Analysis, ActivityItem } from '../types';
import { Tooltip } from '../components/common/Tooltip';
import { exportAnalysesToCsv, exportToCsv } from '../utils/exportCsv';
import { EmptyState } from '../components/common/EmptyState';

interface OverviewViewProps {
  onNavigate: (view: NavigationId) => void;
  datasets: Dataset[];
  analyses: Analysis[];
  activities: ActivityItem[];
  queryHistoryCount?: number;
  onOpenUploadModal: () => void;
  onSelectDatasetForExplore: (datasetId: string) => void;
  onNotify?: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  datasets,
  analyses,
  activities,
  queryHistoryCount = 0,
  onOpenUploadModal,
  onSelectDatasetForExplore,
  onNotify
}) => {
  const [activityFilter, setActivityFilter] = useState<
    'all' | 'clean' | 'ai' | 'query' | 'upload'
  >('all');

  const totalRows = datasets.reduce(
    (acc, curr) => acc + curr.rows,
    0
  );

  const avgHealthScore = datasets.length > 0
    ? Math.round(
        datasets.reduce((acc, curr) => acc + curr.healthScore, 0) /
        datasets.length
      )
    : 0;

  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter((activity) => activity.type === activityFilter);

  const handleExportAllAnalyses = () => {
    if (analyses.length === 0) {
      onNotify?.('Export Notice', 'No analyses to export.', 'info');
      return;
    }

    const filename = `insightiq_analyses_${Date.now()}.csv`;
    const ok = exportAnalysesToCsv(analyses, filename);

    if (ok) {
      onNotify?.(
        'Analyses Exported',
        `Exported ${analyses.length} analyses as ${filename}.`,
        'success'
      );
    }
  };

  const handleExportSingleAnalysis = (analysis: Analysis) => {
    const filename = `analysis_${analysis.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')}_${Date.now()}.csv`;

    const ok = exportAnalysesToCsv([analysis], filename);

    if (ok) {
      onNotify?.(
        'Analysis Exported',
        `Analysis "${analysis.title}" exported successfully.`,
        'success'
      );
    }
  };

  const handleExportDatasetCsv = (dataset: Dataset) => {
    if (!dataset.sampleData || dataset.sampleData.length === 0) {
      onNotify?.(
        'Export Notice',
        'No exportable records are available for this dataset.',
        'info'
      );
      return;
    }

    const filename = `${dataset.name
      .toLowerCase()
      .replace(/\s+/g, '_')}_records_${Date.now()}.csv`;

    const ok = exportToCsv(dataset.sampleData, filename);

    if (ok) {
      onNotify?.(
        'Dataset Exported',
        `${dataset.sampleData.length} records exported from ${dataset.name}.`,
        'success'
      );
    }
  };

  const activityIcons = {
    clean: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
    ai: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
    query: <Terminal className="w-3.5 h-3.5 text-purple-400" />,
    upload: <Upload className="w-3.5 h-3.5 text-blue-400" />,
    export: <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
  };

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0C1527] via-[#0E1A33] to-[#0A1324] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">

        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div className="space-y-2">

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                InsightIQ Analytics Workspace
              </span>

              <span className="text-slate-600">·</span>

              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Workspace Overview
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {datasets.length === 0
                ? 'Welcome to InsightIQ Analytics'
                : 'Workspace Executive Overview'}
            </h1>

            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {datasets.length === 0 ? (
                'Upload your first CSV or JSON dataset to explore records, clean data, run SQL queries and discover insights.'
              ) : (
                <>
                  You currently have{' '}
                  <strong className="text-slate-200">
                    {datasets.length} datasets
                  </strong>
                  {' '}containing{' '}
                  <span className="text-cyan-300 font-semibold tabular-nums">
                    {totalRows.toLocaleString()} records
                  </span>
                  {' '}and{' '}
                  <span className="text-cyan-300 font-semibold tabular-nums">
                    {analyses.length} AI analyses
                  </span>.
                </>
              )}
            </p>

          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-lg shadow-md transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            Upload Dataset
          </button>

        </div>
      </div>

      {/* Workspace Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Datasets */}
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Total Datasets
            </span>

            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-bold text-white tabular-nums">
              {datasets.length}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>{totalRows.toLocaleString()} total rows</span>
            <span className="text-cyan-400">
              {datasets.length > 0 ? 'Available' : 'No data'}
            </span>
          </div>

        </div>

        {/* AI Analyses */}
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              AI Discoveries
            </span>

            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-bold text-white tabular-nums">
              {analyses.length}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Saved analyses</span>
            <span className="text-cyan-400">
              {analyses.length > 0 ? 'Available' : 'No analyses'}
            </span>
          </div>

        </div>

        {/* Data Health */}
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Data Hygiene Score
            </span>

            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-bold text-white tabular-nums">
              {datasets.length > 0 ? `${avgHealthScore}%` : '—'}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Average dataset score</span>
            <span className="text-emerald-400">
              {datasets.length > 0 ? 'Calculated' : 'No data'}
            </span>
          </div>

        </div>

        {/* SQL Queries */}
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all">

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              SQL Queries
            </span>

            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {queryHistoryCount}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex justify-between">
            <span>Recorded queries</span>
            <span className="text-purple-400">
              {queryHistoryCount > 0 ? 'Available' : 'No queries'}
            </span>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">

        <div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Quick Actions
          </span>

          <p className="text-xs text-slate-400 mt-1">
            Access your data analysis tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Upload Dataset
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ai-analyst')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-700/50 rounded-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask AI Analyst
          </button>

          <button
            type="button"
            onClick={() => onNavigate('visualizations')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            Build Visualization
          </button>

          <button
            type="button"
            onClick={() => onNavigate('sql-playground')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#0D1424] hover:bg-slate-800 border border-slate-700 rounded-lg cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            Run SQL Query
          </button>

        </div>
      </div>

      {/* Recent Datasets and Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Datasets */}
        <div className="lg:col-span-7 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A]">

            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />

              <h2 className="text-sm font-semibold text-slate-100">
                Recent Datasets
              </h2>

              <span className="text-[11px] text-slate-400">
                ({datasets.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('datasets')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

          </div>

          {datasets.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Database}
                title="No datasets available"
                description="Upload a CSV or JSON file to start querying, cleaning and visualizing your records."
                actionLabel="Upload Dataset"
                onAction={onOpenUploadModal}
              />
            </div>
          ) : (
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

                  {datasets.slice(0, 5).map((ds) => (
                    <tr
                      key={ds.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-100 group-hover:text-cyan-300">
                            {ds.name}
                          </span>

                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {ds.updatedAt}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60 rounded">
                          {ds.format}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-right font-mono tabular-nums">
                        {ds.rows.toLocaleString()}
                      </td>

                      <td className="px-3 py-3.5 text-center">
                        <span className="text-xs font-medium font-mono text-emerald-400">
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
                            className="px-2 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-slate-800 hover:bg-cyan-900/40 border border-slate-700/80 rounded cursor-pointer"
                          >
                            Explore
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigate('cleaning')}
                            className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded cursor-pointer"
                          >
                            Clean
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportDatasetCsv(ds)}
                            className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded cursor-pointer"
                            title="Export dataset as CSV"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent AI Analyses */}
        <div className="lg:col-span-5 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A]">

            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />

              <h2 className="text-sm font-semibold text-slate-100">
                Recent AI Analyses
              </h2>

              <span className="text-[11px] text-slate-400 font-mono">
                ({analyses.length})
              </span>
            </div>

            <div className="flex items-center gap-2">

              {analyses.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportAllAnalyses}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-cyan-300 bg-slate-800 border border-slate-700/60 rounded-md cursor-pointer"
                  title="Export analyses as CSV"
                >
                  <Download className="w-3 h-3 text-cyan-400" />
                  Export CSV
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigate('ai-analyst')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Copilot Hub
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

          {analyses.length === 0 ? (
            <div className="p-8 flex-1 flex items-center justify-center">
              <EmptyState
                icon={Sparkles}
                title="No analyses yet"
                description="Use the AI Analyst to examine your datasets and generate insights."
                actionLabel="Open AI Analyst"
                onAction={() => onNavigate('ai-analyst')}
              />
            </div>
          ) : (
            <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">

              {analyses.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#090E1A]/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                >

                  <div className="flex items-start justify-between gap-2">

                    <div>
                      <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">
                        {item.category} · {item.datasetName}
                      </span>

                      <h3 className="text-xs font-semibold text-slate-100 mt-1 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400">
                        {item.createdAt}
                      </span>

                      <div className="text-xs font-mono font-semibold text-cyan-300">
                        {item.confidence}% conf
                      </div>
                    </div>

                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {item.keyMetric}:
                      </span>

                      <span className={`text-xs font-mono font-medium ${
                        item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.metricChange}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">

                      <button
                        type="button"
                        onClick={() => handleExportSingleAnalysis(item)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
                        title="Export this analysis"
                      >
                        <Download className="w-3 h-3 text-cyan-400" />
                        CSV
                      </button>

                      <button
                        type="button"
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
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-[#090E1A] gap-3">

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-cyan-400" />

            <h2 className="text-sm font-semibold text-slate-100">
              Recent Workspace Activity
            </h2>

            <span className="text-[11px] text-slate-400">
              ({filteredActivities.length} events)
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg">

            {(['all', 'clean', 'ai', 'query', 'upload'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActivityFilter(filter)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activityFilter === filter
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'clean'
                    ? 'Cleaning'
                    : filter === 'ai'
                      ? 'AI'
                      : filter === 'query'
                        ? 'SQL'
                        : 'Uploads'}
              </button>
            ))}

          </div>
        </div>

        <div className="p-5">

          {filteredActivities.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Clock}
                title="No activity recorded yet"
                description="Dataset uploads, cleaning operations, SQL queries and AI analyses will appear here."
              />
            </div>
          ) : (
            <div className="relative border-l border-slate-800 ml-4 space-y-6">

              {filteredActivities.map((act) => (
                <div key={act.id} className="relative pl-6">

                  <div className="absolute -left-3 top-0.5 w-6 h-6 rounded-full bg-[#080D1A] border border-slate-700 flex items-center justify-center">
                    {activityIcons[act.type]}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {act.user}
                      </span>

                      <span className="text-slate-600">·</span>

                      <span className="text-xs text-slate-400">
                        {act.action}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {act.timestamp}
                    </span>

                  </div>

                  <p className="text-xs font-mono text-slate-300 mt-1 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                    {act.target}
                  </p>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
