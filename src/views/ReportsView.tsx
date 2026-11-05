import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Sparkles,
  Share2,
  Layers
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';

interface ReportsViewProps {
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  datasets,
  onNavigate,
  onNotify
}) => {
  const [selectedReportId, setSelectedReportId] = useState('rep-1');

  const reports = [
    {
      id: 'rep-1',
      title: 'Q3 2026 Executive Data Intelligence Brief',
      subtitle: 'Comprehensive performance, revenue velocity, and cohort retention synthesis',
      cadence: 'Weekly (Mondays at 06:00 UTC)',
      status: 'Generated Today',
      author: 'InsightIQ Automated Copilot',
      metrics: [
        { label: 'Active Pipeline Ingestion', value: '4.82M rows', delta: '+12.4%' },
        { label: 'Total Recurring ARR Tracked', value: '$1.48M', delta: '+18.6%' },
        { label: 'Clean Partition Score', value: '98.2%', delta: '+2.1%' },
        { label: 'High Churn Risk Accounts', value: '14 flagged', delta: '-6 MoM' }
      ]
    },
    {
      id: 'rep-2',
      title: 'Data Hygiene & Anomaly Audit Report',
      subtitle: 'Full schema conformance, null vector imputation, and duplicate detection',
      cadence: 'Daily at 00:00 UTC',
      status: 'Up to date',
      author: 'Data Operations Agent',
      metrics: [
        { label: 'Inspected Sources', value: '5 Databases', delta: '100% active' },
        { label: 'Null Values Imputed', value: '42 cells', delta: '0 fatal' },
        { label: 'Deduplicated Rows', value: '14 keys', delta: 'Purged' },
        { label: 'Outlier Alerts', value: '3 isolated', delta: 'Clamped' }
      ]
    },
    {
      id: 'rep-3',
      title: 'Predictive Churn Risk & Retention Forecast',
      subtitle: 'Random Forest model evaluation across 142k customer cohort partitions',
      cadence: 'Monthly',
      status: 'Published 3 days ago',
      author: 'Dr. Elena Rostova',
      metrics: [
        { label: 'Model ROC-AUC', value: '0.924', delta: '+0.018' },
        { label: 'Identified Flight Accounts', value: '88 accounts', delta: 'CS Assigned' },
        { label: 'Potential ARR Saved', value: '$340,000', delta: 'Target' },
        { label: 'Model Confidence', value: '98.4%', delta: 'High' }
      ]
    }
  ];

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handlePrint = () => {
    onNotify('Print / PDF Export Prepared', 'Opening browser print formatting dialog for executive brief.', 'info');
    window.print();
  };

  const handleDownloadCSV = () => {
    onNotify('Report Exported', 'Executive KPI matrix exported to CSV spreadsheet format.', 'success');
  };

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
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated intelligence briefs, data hygiene compliance audits, and scheduled stakeholder digests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Data</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export to PDF</span>
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
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              {rep.cadence}
            </span>
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
            <span className="tabular-nums">Document ID: {activeReport.id.toUpperCase()}-2026</span>
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
            <span>Cadence: <strong className="text-slate-200">{activeReport.cadence}</strong></span>
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

        {/* Narrative Section */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800/60 pb-1.5">
            1. Executive Findings & Key Takeaways
          </h3>
          <p>
            During the latest analytical aggregation window across all 5 production data pipelines, overall platform hygiene sustained a 98.2% conformance index. Cross-referencing between customer cohort telemetry and CRM billing signals demonstrates healthy retention across upper tier accounts ($10k+ ARR), alongside localized fragility in newly provisioned starter tiers.
          </p>
          <p>
            The automated anomaly detection models flagged 14 high-risk accounts exhibiting reduced weekly login velocity. Deploying automated Slack notifications to the dedicated Customer Success team is forecasted to prevent up to $340,000 in potential annualized churn.
          </p>
        </div>

        {/* Actionable Strategy Checklist */}
        <div className="p-4 bg-cyan-950/20 border border-cyan-900/40 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Recommended Strategic Directives</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Standardize Day-21 in-app customer onboarding sequence to boost weekly logins past the critical 12-session mark.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Enforce the newly constructed Data Cleaning recipe across morning ETL ingestion tasks.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>Retrain the XGBoost revenue model following the upcoming month-end settlement closure.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
