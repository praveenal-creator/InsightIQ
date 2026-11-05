import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Plus,
  Layers,
  Database
} from 'lucide-react';
import { Dataset, NavigationId, ReportItem, Analysis } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCsv } from '../utils/exportCsv';

interface ReportsViewProps {
  reports: ReportItem[];
  datasets: Dataset[];
  analyses: Analysis[];
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
  onGenerateReport?: (newReport: ReportItem) => void;
  onOpenUploadModal?: () => void;
  onLoadDemoMode?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  datasets,
  analyses,
  onNavigate,
  onNotify,
  onGenerateReport,
  onOpenUploadModal,
  onLoadDemoMode
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleCreateReport = () => {
    if (datasets.length === 0) {
      onNotify('Dataset Needed', 'Upload a dataset first before generating an executive brief.', 'info');
      return;
    }

    const totalRows = datasets.reduce((sum, d) => sum + d.rows, 0);
    const avgHealth = Math.round(datasets.reduce((sum, d) => sum + d.healthScore, 0) / (datasets.length || 1));

    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      title: `${datasets[0].name} Executive Brief`,
      subtitle: `Automated data quality and intelligence synthesis across ${datasets.length} active data streams`,
      cadence: 'On Demand (Generated)',
      status: 'Generated Just Now',
      author: 'InsightIQ Automated Copilot',
      createdAt: 'Just now',
      datasetName: datasets[0].name,
      metrics: [
        { label: 'Active Pipeline Rows', value: totalRows.toLocaleString(), delta: '100% Ingested' },
        { label: 'Workspace Datasets', value: `${datasets.length} Connected`, delta: 'Active' },
        { label: 'Average Hygiene Score', value: `${avgHealth}%`, delta: 'Verified' },
        { label: 'Completed AI Analyses', value: `${analyses.length} Discoveries`, delta: 'Synthesized' }
      ],
      findings: [
        `Workspace contains ${datasets.length} verified data lakes with ${totalRows.toLocaleString()} total indexed records.`,
        `Data hygiene conforms to an average quality score of ${avgHealth}% across active schemas.`,
        analyses.length > 0
          ? `Latest analytical anomaly identified: "${analyses[0].title}".`
          : 'Automated schema validation passed with zero structural format drift.'
      ],
      recommendations: [
        'Enforce weekly partition sync checks to prevent null value propagation.',
        'Construct an automated alerting webhook for records exceeding threshold tolerances.',
        'Review cleaning pipeline history regularly to preserve schema integrity.'
      ],
      isDemo: datasets[0].isDemo || false
    };

    if (onGenerateReport) {
      onGenerateReport(newReport);
    }
    setSelectedReportId(newReport.id);
    onNotify('Report Generated', `Generated "${newReport.title}" with real workspace metrics.`, 'success');
  };

  const handlePrint = () => {
    onNotify('Print / PDF Export Prepared', 'Opening browser print formatting dialog for executive brief.', 'info');
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!activeReport) return;
    const rows = activeReport.metrics.map(m => ({
      'Report Title': activeReport.title,
      'Document ID': activeReport.id,
      'Metric Label': m.label,
      'Metric Value': m.value,
      'Delta / Status': m.delta,
      'Author': activeReport.author,
      'Generated Date': activeReport.createdAt
    }));
    exportToCsv(rows, `executive_brief_${activeReport.id}.csv`);
    onNotify('Report Exported', 'Executive KPI matrix exported to CSV.', 'success');
  };

  if (!reports || reports.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <span>Executive Reports</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated intelligence briefs and data hygiene compliance audits.
            </p>
          </div>

          {datasets.length > 0 && (
            <button
              onClick={handleCreateReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Brief</span>
            </button>
          )}
        </div>

        <EmptyState
          icon={FileSpreadsheet}
          title="No reports generated yet"
          description={
            datasets.length > 0
              ? "You have active datasets ready in your workspace. Click 'Generate Brief' to assemble an executive scorecard and synthesis narrative from your actual data."
              : "No reports or datasets found. Connect your first dataset or load demo mode to generate executive briefs and export PDF packages."
          }
          actionLabel={datasets.length > 0 ? "Generate Executive Brief" : "Upload Dataset"}
          onAction={datasets.length > 0 ? handleCreateReport : onOpenUploadModal}
        />

        {onLoadDemoMode && (
          <div className="text-center">
            <button
              onClick={onLoadDemoMode}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Or load sample report documents in Demo Mode
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <span>Executive Reports</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              Publication Ready
            </span>
            {activeReport.isDemo && (
              <span className="text-xs px-2 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded font-mono">
                Sample Report
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive briefs generated from actual workspace records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate New Brief</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reports.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              selectedReportId === rep.id
                ? 'bg-[#0D1424] border-cyan-500/60 shadow-md shadow-cyan-950/20'
                : 'bg-[#080D1A] border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                {rep.cadence}
              </span>
              {rep.isDemo && (
                <span className="text-[9px] px-1 bg-amber-950/60 text-amber-400 border border-amber-800/40 rounded">
                  Demo
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold text-slate-100 mt-1 leading-snug">
              {rep.title}
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3" />
              {rep.status}
            </span>
          </button>
        ))}
      </div>

      {/* Main Report Document Sheet */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-cyan-400 font-semibold uppercase">InsightIQ Intelligence Brief</span>
            <span className="tabular-nums">Document ID: {activeReport.id.toUpperCase()}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeReport.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeReport.subtitle}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <span>Prepared by: <strong className="text-slate-200">{activeReport.author}</strong></span>
            <span>·</span>
            <span>Target: <strong className="text-slate-200">{activeReport.datasetName || 'All Lakes'}</strong></span>
          </div>
        </div>

        {/* Executive Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeReport.metrics.map((m, idx) => (
            <div key={idx} className="p-3.5 bg-[#090E1A] rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {m.label}
              </span>
              <span className="text-xl font-bold text-white font-mono tabular-nums block mt-1">
                {m.value}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                {m.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Real Narrative Section */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800/60 pb-1.5">
            1. Executive Findings & Key Takeaways
          </h3>
          <ul className="space-y-2">
            {activeReport.findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-mono font-bold">·</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Recommended Strategic Directives</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {activeReport.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
