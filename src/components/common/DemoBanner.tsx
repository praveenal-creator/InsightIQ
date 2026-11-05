import React, { useState } from 'react';
import { Database, Info, RefreshCw, X, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoBannerProps {
  isDemoMode: boolean;
  onResetDemoData: () => void;
  onExitDemoMode?: () => void;
  onLoadDemoMode?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  isDemoMode,
  onResetDemoData,
  onExitDemoMode,
  onLoadDemoMode
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsDismissed(false)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg shadow-lg border transition-all cursor-pointer ${
            isDemoMode
              ? 'bg-amber-950/90 text-amber-300 border-amber-700 hover:border-amber-500'
              : 'bg-[#0D1424] text-slate-300 border-slate-700 hover:border-cyan-500'
          }`}
        >
          {isDemoMode ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Mode Active</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Production Mode (Clean)</span>
            </>
          )}
        </button>
      </div>
    );
  }

  if (isDemoMode) {
    return (
      <div className="relative z-30 bg-[#161208] border-b border-amber-800/60 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-slate-200">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase tracking-wider text-[11px]">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Demo Mode Active</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-amber-200/90">
              Showing pre-loaded synthetic datasets, sample AI analyses, and predictive simulations. Real user uploads are kept separate.
            </span>
            <button
              onClick={() => setShowInfo(!showInfo)}
              aria-label="Toggle demo explanation"
              className="text-amber-300 hover:text-white underline underline-offset-2 ml-1 cursor-pointer"
            >
              Details
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onExitDemoMode && (
              <button
                onClick={onExitDemoMode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-slate-950 bg-amber-400 hover:bg-amber-300 font-semibold rounded-md transition-colors cursor-pointer text-xs"
              >
                <span>Exit Demo Mode</span>
              </button>
            )}
            <button
              onClick={onResetDemoData}
              className="flex items-center gap-1.5 px-2.5 py-1 text-amber-200 hover:text-amber-100 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 rounded-md transition-colors cursor-pointer text-xs"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Reset Samples</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss banner"
              className="text-amber-400/80 hover:text-amber-200 cursor-pointer p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="mt-2 pt-2 border-t border-amber-900/60 text-amber-200/80 max-w-7xl mx-auto text-xs grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>Contains 5 synthetic enterprise datasets: SaaS Cohorts, Global Orders, Credit Fraud, IoT Telemetry, and Ad Campaigns.</span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>Exiting Demo Mode returns you to your clean production workspace where only real user data is displayed.</span>
            </div>
            <div className="flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <span>All sample datasets and simulated models are segregated and never mixed with real data.</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Production Mode (Clean)
  return (
    <div className="relative z-30 bg-[#090F1D] border-b border-slate-800/80 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-slate-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clean Production Mode</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs">
            Zero demo data. Real dashboard metrics, SQL history, and ML models are calculated strictly from your uploaded files.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onLoadDemoMode && (
            <button
              onClick={onLoadDemoMode}
              className="flex items-center gap-1.5 px-2.5 py-1 text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors cursor-pointer text-xs"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Load Sample Datasets (Demo Mode)</span>
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
