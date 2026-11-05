import React, { useState } from 'react';
import { Database, Info, RefreshCw, X } from 'lucide-react';

interface DemoBannerProps {
  onResetDemoData: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onResetDemoData }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-[#0D1424] border border-cyan-900/60 rounded-lg shadow-lg hover:border-cyan-500/60 transition-all cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Demo Data Active</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-30 bg-[#090F1D] border-b border-cyan-950/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
            <Database className="w-3.5 h-3.5" />
            <span>Demonstration Environment</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">
            All datasets, AI insights, and ML metrics are synthetic domain demonstrations.
          </span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            aria-label="Toggle demo data explanation"
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer"
          >
            Details
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetDemoData}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-cyan-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3 h-3 text-cyan-400" />
            <span>Reset Demo Datasets</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss demo banner"
            className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-slate-300 max-w-7xl mx-auto text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <span>5 pre-loaded enterprise datasets across SaaS, E-Commerce, Fraud, IoT, and Marketing.</span>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <span>You can add custom datasets, run live SQL queries, explore distributions, and test ML churn simulations.</span>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
            <span>State updates are preserved in local browser session memory.</span>
          </div>
        </div>
      )}
    </div>
  );
};
