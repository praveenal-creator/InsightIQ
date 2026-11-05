import React, { useState } from 'react';
import { 
  Filter, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Database,
  Layers,
  Wand2
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';

interface DataCleaningViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, description: string, type: 'success' | 'info' | 'error') => void;
}

interface Step {
  id: string;
  name: string;
  description: string;
  applied: boolean;
}

export const DataCleaningView: React.FC<DataCleaningViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigate,
  onNotify
}) => {
  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const [pipelineSteps, setPipelineSteps] = useState<Step[]>([
    {
      id: 'step-1',
      name: 'Impute Missing Weekly Logins with Cohort Median',
      description: 'Replaced 42 null values in login_frequency_weekly using median (18.0)',
      applied: true
    },
    {
      id: 'step-2',
      name: 'Deduplicate Redundant Customer Key Partitions',
      description: 'Purged 14 duplicate sync tokens matching primary key customer_id',
      applied: true
    },
    {
      id: 'step-3',
      name: 'Cap Extreme Outliers on Monthly ARR via 1.5x IQR',
      description: 'Soft-clamped 3 synthetic test accounts exceeding $45,000 threshold',
      applied: false
    }
  ]);

  const [previewMode, setPreviewMode] = useState<'clean' | 'diff'>('diff');

  const handleToggleStep = (id: string) => {
    setPipelineSteps(prev =>
      prev.map(s => (s.id === id ? { ...s, applied: !s.applied } : s))
    );
  };

  const handleAddStep = () => {
    const newStep: Step = {
      id: `step-${Date.now()}`,
      name: 'Standardize ISO Region Country Codes',
      description: 'Converts mixed country abbreviations into standard UN M49 codes',
      applied: true
    };
    setPipelineSteps(prev => [...prev, newStep]);
    onNotify('Cleaning Step Added', 'Standardize ISO Region was staged into the active pipeline.', 'info');
  };

  const handleApplyPipeline = () => {
    onNotify('Pipeline Successfully Executed', `Applied ${pipelineSteps.filter(s => s.applied).length} transformations to ${currentDataset.name}. Data hygiene improved to 99.4%.`, 'success');
  };

  const handleResetPipeline = () => {
    setPipelineSteps(prev => prev.map(s => ({ ...s, applied: false })));
    onNotify('Pipeline Reverted', 'Reverted staging changes to base ingestion schema.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <span>Data Cleaning Studio</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded font-mono">
              Auto-Hygiene Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct reproducible cleaning recipes: impute missing values, eradicate duplicate vectors, and clamp outliers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentDataset.id}
              onChange={(e) => onSelectDataset(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-[#0D1424] text-slate-200">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyPipeline}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Pipeline</span>
          </button>
        </div>
      </div>

      {/* Hygiene Score & Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Health Score</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">98.2%</span>
            <span className="text-[10px] text-slate-400 block">+4.8% after pipeline</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Null Values</span>
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">0 / 142k</span>
            <span className="text-[10px] text-cyan-400 block">Fully Imputed</span>
          </div>
          <Check className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Duplicate Keys</span>
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">0 Found</span>
            <span className="text-[10px] text-emerald-400 block">Exact Match Deduplicated</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Outlier Extremes</span>
            <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">3 Isolated</span>
            <span className="text-[10px] text-slate-400 block">Z-Score &gt; 3.5</span>
          </div>
          <AlertCircle className="w-8 h-8 text-amber-400/30" />
        </div>
      </div>

      {/* 2-Column: Pipeline Steps & Before/After Live Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Step Builder */}
        <div className="lg:col-span-5 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Pipeline Recipe</h2>
              <span className="text-xs text-slate-400">({pipelineSteps.length} Steps)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetPipeline}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Reset all steps"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleAddStep}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {pipelineSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  step.applied
                    ? 'bg-[#090E1A] border-cyan-800/60 shadow-xs'
                    : 'bg-[#080C16] border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">{step.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={step.applied}
                    onChange={() => handleToggleStep(step.id)}
                    className="accent-cyan-400 w-4 h-4 rounded cursor-pointer shrink-0 mt-1"
                    aria-label={`Toggle step ${step.name}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 bg-[#090E1A] flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {pipelineSteps.filter(s => s.applied).length} active transformation steps
            </span>
            <button
              onClick={handleApplyPipeline}
              className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Re-run full batch →
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Before vs After Preview */}
        <div className="lg:col-span-7 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Live Diff Preview</h2>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setPreviewMode('diff')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  previewMode === 'diff' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Highlight Cleaned Cells
              </button>
              <button
                onClick={() => setPreviewMode('clean')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  previewMode === 'clean' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Clean State Only
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Customer ID</th>
                  <th className="px-3 py-2.5">Tier</th>
                  <th className="px-3 py-2.5 text-right">Monthly ARR</th>
                  <th className="px-3 py-2.5 text-right">Weekly Logins</th>
                  <th className="px-3 py-2.5 text-right">Tickets (30d)</th>
                  <th className="px-3 py-2.5 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {currentDataset.sampleData.slice(0, 6).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2.5 text-slate-200 font-semibold">{String(row.customer_id || `ID-${idx}`)}</td>
                    <td className="px-3 py-2.5 text-slate-300">{String(row.tier || 'Standard')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-200">
                      ${Number(row.monthly_arr || 4500).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {idx === 1 && previewMode === 'diff' ? (
                        <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
                          19.0 (Imputed)
                        </span>
                      ) : (
                        <span>{String(row.login_frequency_weekly || 18)}</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-300">
                      {String(row.support_tickets_30d || 1)}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {Number(row.churn_risk_score || 0.15) > 0.6 ? (
                        <span className="text-rose-400 font-semibold">{String(row.churn_risk_score)}</span>
                      ) : (
                        <span className="text-emerald-400">{String(row.churn_risk_score)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-800 bg-[#090E1A] text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Cyan badges indicate values transformed by current pipeline.</span>
            </span>
            <button
              onClick={() => onNavigate('explore')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Explore full table</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
