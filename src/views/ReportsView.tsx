
import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Clock,
  Sparkles,
  Plus,
  Info,
  AlertCircle
} from 'lucide-react';

import { Dataset, NavigationId, ReportItem, Analysis } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCsv } from '../utils/exportCsv';

interface ReportsViewProps {
  reports: ReportItem[];
  datasets: Dataset[];
  analyses: Analysis[];
  onNavigate: (view: NavigationId) => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  onGenerateReport?: (newReport: ReportItem) => void;
  onOpenUploadModal?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  datasets,
  analyses,
  onNavigate,
  onNotify,
  onOpenUploadModal
}) => {
  const [selectedReportId, setSelectedReportId] = useState(
    reports[0]?.id || ''
  );

  const activeReport =
    reports.find(report => report.id === selectedReportId) || reports[0];

  // Report generation is unavailable until a real backend is connected.
  const handleCreateReport = () => {
    onNotify(
      'Report Generation Unavailable',
      'The report-generation backend is not connected yet. No synthetic findings or recommendations have been generated.',
      'info'
    );
  };

  const handlePrint = () => {
    if (!activeReport) return;

    window.print();
  };

  const handleDownloadCSV = () => {
    if (!activeReport) return;

    if (!activeReport.metrics || activeReport.metrics.length === 0) {
      onNotify(
        'No Report Metrics',
        'This saved report does not contain metrics to export.',
        'info'
      );
      return;
    }

    const rows = activeReport.metrics.map(metric => ({
      'Report Title': activeReport.title,
      'Document ID': activeReport.id,
      'Metric Label': metric.label,
      'Metric Value': metric.value,
      'Delta / Status': metric.delta,
      'Author': activeReport.author,
      'Generated Date': activeReport.createdAt
    }));

    exportToCsv(
      rows,
      `executive_brief_${activeReport.id}.csv`
    );

    onNotify(
      'Report Exported',
      'Saved report metrics have been exported to CSV.',
      'success'
    );
  };

  // Empty state
  if (!reports || reports.length === 0) {
    return (
      <div className="space-y-6">

        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              Executive Reports
            </h1>

            <p className="text-xs text-slate-400 mt-1">
              Saved reports and downloadable workspace summaries.
            </p>
          </div>

          <button
            onClick={handleCreateReport}
            disabled
            title="Requires report-generation backend integration"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-800 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate Report
          </button>

        </div>

        <EmptyState
          icon={FileSpreadsheet}
          title="No saved reports available"
          description={
            datasets.length > 0
              ? 'Your workspace contains datasets, but no saved reports are available. Connect the report-generation backend to create reports from actual analysis results.'
              : 'Upload a dataset to begin your analysis workflow. Reports will appear here once they have been generated and saved.'
          }
          actionLabel={
            datasets.length > 0
              ? 'Explore Datasets'
              : 'Upload Dataset'
          }
          onAction={
            datasets.length > 0
              ? () => onNavigate('datasets')
              : onOpenUploadModal
          }
        />

        <div className="bg-[#0D1424] border border-amber-800/40 rounded-xl p-4 flex gap-3">

          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-amber-300">
              Report generation integration pending
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Automated executive summaries, AI-generated findings,
              recommendations and PDF report generation require a
              connected backend. InsightIQ will not create fabricated
              report content.
            </p>
          </div>

        </div>

      </div>
    );
  }

  if (!activeReport) {
    return null;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">

        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            Executive Reports
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Saved report records and downloadable metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">

          <button
            onClick={handleCreateReport}
            disabled
            title="Requires report-generation backend integration"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-800 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Generate Report
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>

        </div>

      </div>

      {/* Report Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {reports.map(report => (

          <button
            key={report.id}
            onClick={() => setSelectedReportId(report.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              activeReport.id === report.id
                ? 'bg-[#0D1424] border-cyan-500/60 shadow-md shadow-cyan-950/20'
                : 'bg-[#080D1A] border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
            }`}
          >

            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
              {report.cadence}
            </span>

            <h3 className="text-xs font-semibold text-slate-100 mt-2 leading-snug">
              {report.title}
            </h3>

            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
              <Clock className="w-3 h-3" />
              {report.status}
            </span>

          </button>

        ))}

      </div>

      {/* Saved Report Document */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 space-y-2">

          <div className="flex items-center justify-between text-xs text-slate-400 gap-3 flex-wrap">

            <span className="font-mono text-cyan-400 font-semibold uppercase">
              InsightIQ Saved Report
            </span>

            <span className="tabular-nums">
              Document ID: {activeReport.id.toUpperCase()}
            </span>

          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeReport.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeReport.subtitle}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 flex-wrap">

            <span>
              Author:{' '}
              <strong className="text-slate-200">
                {activeReport.author}
              </strong>
            </span>

            <span>·</span>

            <span>
              Dataset:{' '}
              <strong className="text-slate-200">
                {activeReport.datasetName || 'Not specified'}
              </strong>
            </span>

            <span>·</span>

            <span>
              Created:{' '}
              <strong className="text-slate-200">
                {activeReport.createdAt}
              </strong>
            </span>

          </div>

        </div>

        {/* Stored Metrics */}
        <div className="space-y-3">

          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Recorded Metrics
          </h3>

          {activeReport.metrics.length === 0 ? (

            <p className="text-xs text-slate-500 py-3">
              No metrics are available in this report.
            </p>

          ) : (

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {activeReport.metrics.map((metric, index) => (

                <div
                  key={`${metric.label}-${index}`}
                  className="p-3.5 bg-[#090E1A] rounded-xl border border-slate-800"
                >

                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {metric.label}
                  </span>

                  <span className="text-xl font-bold text-white font-mono tabular-nums block mt-1 break-words">
                    {metric.value}
                  </span>

                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {metric.delta}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Stored Findings */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">

          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800/60 pb-1.5">
            Recorded Findings
          </h3>

          {activeReport.findings.length === 0 ? (

            <p className="text-xs text-slate-500">
              No findings are stored in this report.
            </p>

          ) : (

            <ul className="space-y-2">

              {activeReport.findings.map((finding, index) => (

                <li key={index} className="flex items-start gap-2">

                  <span className="text-cyan-400 font-mono font-bold">
                    ·
                  </span>

                  <span>{finding}</span>

                </li>

              ))}

            </ul>

          )}

        </div>

        {/* Stored Recommendations */}
        <div className="p-4 bg-[#090E1A] border border-slate-800 rounded-xl space-y-3">

          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs uppercase tracking-wider">

            <Sparkles className="w-4 h-4 text-cyan-400" />

            <span>Recorded Recommendations</span>

          </div>

          {activeReport.recommendations.length === 0 ? (

            <p className="text-xs text-slate-500">
              No recommendations are stored in this report.
            </p>

          ) : (

            <ul className="space-y-2 text-xs text-slate-300">

              {activeReport.recommendations.map((recommendation, index) => (

                <li key={index} className="flex items-start gap-2">

                  <span className="text-cyan-400 shrink-0">
                    {index + 1}.
                  </span>

                  <span>{recommendation}</span>

                </li>

              ))}

            </ul>

          )}

        </div>

      </div>

      {/* Backend Integration Status */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 flex gap-3">

        <Info className="w-5 h-5 text-cyan-400 shrink-0" />

        <div>
          <h3 className="text-sm font-semibold text-white">
            Report Generation Backend
          </h3>

          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Existing saved reports can be viewed, printed and exported.
            New report generation and AI-powered recommendations are
            not connected to a verified backend yet.
          </p>
        </div>

      </div>

    </div>
  );
};
