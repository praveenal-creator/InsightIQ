import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart2, 
  Sparkles, 
  RotateCcw,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { PREDICTIVE_MODELS } from '../data/mockData';
import { NavigationId } from '../types';

interface PredictiveLabViewProps {
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const PredictiveLabView: React.FC<PredictiveLabViewProps> = ({
  onNavigate,
  onNotify
}) => {
  const [selectedModelId, setSelectedModelId] = useState(PREDICTIVE_MODELS[0].id);
  const activeModel = PREDICTIVE_MODELS.find(m => m.id === selectedModelId) || PREDICTIVE_MODELS[0];

  // Interactive What-If Simulator State
  const [simLogins, setSimLogins] = useState(14);
  const [simTickets, setSimTickets] = useState(3);
  const [simSeats, setSimSeats] = useState(45);
  const [simArr, setSimArr] = useState(5500);

  // Dynamic churn calculation algorithm
  const baseRisk = 0.45;
  const loginFactor = (30 - simLogins) * 0.025;
  const ticketFactor = simTickets * 0.06;
  const seatBonus = (simSeats > 50 ? -0.12 : 0);
  const calculatedRisk = Math.min(Math.max(baseRisk + loginFactor + ticketFactor + seatBonus, 0.04), 0.96);
  const riskPercentage = Math.round(calculatedRisk * 100);

  const getRiskTier = (pct: number) => {
    if (pct < 30) return { label: 'Low Risk', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30' };
    if (pct < 60) return { label: 'Moderate Risk', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-950/30' };
    if (pct < 80) return { label: 'High Churn Danger', color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-950/30' };
    return { label: 'Critical Flight Risk', color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-950/60' };
  };

  const riskTier = getRiskTier(riskPercentage);

  const handleRetrain = () => {
    onNotify('Model Retraining Queued', `${activeModel.name} is compiling on the distributed GPU cluster.`, 'info');
  };

  const handleResetSim = () => {
    setSimLogins(24);
    setSimTickets(1);
    setSimSeats(80);
    setSimArr(8500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Predictive Lab</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-purple-950/80 text-purple-400 border border-purple-800/60 rounded font-mono">
              Scikit-Learn & XGBoost Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Model validation metrics, feature importance coefficients, and live parameter what-if simulators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedModelId}
            onChange={(e) => setSelectedModelId(e.target.value)}
            className="px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {PREDICTIVE_MODELS.map(m => (
              <option key={m.id} value={m.id} className="bg-[#0D1424]">
                {m.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleRetrain}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Retrain Model</span>
          </button>
        </div>
      </div>

      {/* Model Benchmark Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            ROC-AUC Score
          </span>
          <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
            {activeModel.rocAuc.toFixed(3)}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Superior Discrimination</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Overall Accuracy
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {activeModel.accuracy}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Test Partition (k-fold=5)</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Weighted F1 Score
          </span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">
            {activeModel.f1Score.toFixed(3)}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Harmonic Mean</span>
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Algorithm Architecture
          </span>
          <span className="text-xs font-semibold text-slate-200 block truncate mt-1">
            {activeModel.algorithm}
          </span>
          <span className="text-[10px] text-purple-400 block mt-1 font-mono">Target: {activeModel.targetMetric}</span>
        </div>
      </div>

      {/* 2-Column Section: Model Diagnostics & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Columns: Feature Importance & Confusion Matrix */}
        <div className="lg:col-span-6 space-y-6">
          {/* Feature Importance */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Gini Feature Importance</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Sum = 1.00</span>
            </div>

            <div className="space-y-3">
              {activeModel.features.map(f => (
                <div key={f.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{f.name}</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {(f.importance * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#090E1A] rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${f.importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-100">Confusion Matrix Evaluation</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Holdout n=13,804</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-center">
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                <span className="text-[10px] text-emerald-300 uppercase block">True Negative (Retained)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.trueNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Accuracy 98.8%</span>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                <span className="text-[10px] text-rose-300 uppercase block">False Positive (False Alarm)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.falsePositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Type I Error</span>
              </div>

              <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg">
                <span className="text-[10px] text-rose-300 uppercase block">False Negative (Missed Risk)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.falseNegative.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Type II Error</span>
              </div>

              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg">
                <span className="text-[10px] text-cyan-300 uppercase block">True Positive (Churn Saved)</span>
                <span className="text-lg font-bold text-white tabular-nums">
                  {activeModel.confusionMatrix.truePositive.toLocaleString()}
                </span>
                <span className="text-[10px] text-cyan-400 block mt-0.5">Recall 91.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 6 Columns: Interactive What-If Simulator */}
        <div className="lg:col-span-6 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">Live What-If Churn Simulator</h3>
              </div>
              <button
                onClick={handleResetSim}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Adjust customer engagement levers below to simulate real-time model inference predictions.
            </p>

            {/* Parameter Sliders */}
            <div className="space-y-4 mt-5">
              {/* Slider 1: Logins */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Weekly Login Frequency</span>
                  <span className="font-mono text-cyan-300 font-bold tabular-nums">{simLogins} logins/wk</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={simLogins}
                  onChange={(e) => setSimLogins(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Support Tickets */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Support Tickets (Past 30 Days)</span>
                  <span className="font-mono text-cyan-300 font-bold tabular-nums">{simTickets} tickets</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simTickets}
                  onChange={(e) => setSimTickets(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Active Seats */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Licensed Active Seats</span>
                  <span className="font-mono text-cyan-300 font-bold tabular-nums">{simSeats} seats</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="350"
                  value={simSeats}
                  onChange={(e) => setSimSeats(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4: Monthly ARR */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Contract Monthly ARR</span>
                  <span className="font-mono text-cyan-300 font-bold tabular-nums">${simArr.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="500"
                  value={simArr}
                  onChange={(e) => setSimArr(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Prediction Gauge Card */}
          <div className={`p-5 rounded-xl border ${riskTier.border} ${riskTier.bg} transition-all duration-300 space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Simulated Output
                </span>
                <h4 className={`text-base font-bold ${riskTier.color}`}>{riskTier.label}</h4>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                  {riskPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 block">Flight Probability</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {riskPercentage > 60 ? (
                <span>
                  Critical intervention trigger: At {simLogins} logins/week with {simTickets} open tickets, this account requires immediate Customer Success outreach before renewal cycle.
                </span>
              ) : (
                <span>
                  Healthy cohort trajectory: High usage velocity and low friction tickets maintain strong renewal likelihood (&gt;80%).
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
