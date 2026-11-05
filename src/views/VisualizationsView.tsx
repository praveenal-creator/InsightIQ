import React, { useState } from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  SlidersHorizontal, 
  Download, 
  Database, 
  Share2,
  Sparkles
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';

interface VisualizationsViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNotify
}) => {
  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
  const [chartType, setChartType] = useState<'bar' | 'area' | 'donut'>('bar');
  const [dimension, setDimension] = useState<string>('tier');
  const [metric, setMetric] = useState<string>('monthly_arr');

  // Chart demonstration data synthesized from active dataset
  const barData = [
    { label: 'Enterprise Plus', value: 36500, count: 504, share: '42%' },
    { label: 'Enterprise', value: 21300, count: 320, share: '24%' },
    { label: 'Professional', value: 8000, count: 180, share: '9%' },
    { label: 'Starter', value: 2150, count: 90, share: '2%' }
  ];

  const timeSeriesData = [
    { month: 'Apr', value: 28400, baseline: 25000 },
    { month: 'May', value: 32100, baseline: 27500 },
    { month: 'Jun', value: 39800, baseline: 31000 },
    { month: 'Jul', value: 45200, baseline: 34000 },
    { month: 'Aug', value: 52400, baseline: 38000 },
    { month: 'Sep', value: 67950, baseline: 42000 }
  ];

  const donutData = [
    { label: 'North America', value: 48, color: '#22D3EE' },
    { label: 'Europe', value: 28, color: '#3B82F6' },
    { label: 'Asia Pacific', value: 16, color: '#818CF8' },
    { label: 'Latin America', value: 8, color: '#A855F7' }
  ];

  const maxBarValue = Math.max(...barData.map(d => d.value));
  const maxTimeValue = Math.max(...timeSeriesData.map(d => d.value));

  const handleExportChart = () => {
    onNotify('Chart Exported', `Vector visualization for ${currentDataset.name} was downloaded as SVG.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Visualizations Studio</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded font-mono">
              Vector SVG Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct high-fidelity analytical charts, compare cohort distributions, and export publication-ready visuals.
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
            onClick={handleExportChart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Control Strip & Chart Type Selector */}
      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Chart type tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg">
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'bar' ? 'bg-slate-800 text-cyan-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Cohort Bar</span>
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'area' ? 'bg-slate-800 text-cyan-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4 text-blue-400" />
            <span>Trend Area</span>
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'donut' ? 'bg-slate-800 text-cyan-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            <span>Geo Distribution</span>
          </button>
        </div>

        {/* Dimension & Metric selectors */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dimension:</span>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="tier">Customer Tier</option>
              <option value="region">Geographic Region</option>
              <option value="status">Renewal Probability</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Metric:</span>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="monthly_arr">Monthly ARR ($)</option>
              <option value="logins">Weekly Login Avg</option>
              <option value="tickets">Support Tickets</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Viewport */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {chartType === 'bar' && 'Monthly Recurring Revenue by Account Tier'}
              {chartType === 'area' && 'Trailing 6-Month ARR Growth & Baseline Target'}
              {chartType === 'donut' && 'Customer Geographic Distribution Breakdown'}
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Evaluated on {currentDataset.name} · Tabular figures with precision scaling
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              <span>Current Partition</span>
            </span>
            {chartType === 'area' && (
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                <span>Baseline Quota</span>
              </span>
            )}
          </div>
        </div>

        {/* Chart Renderings */}
        <div className="min-h-[340px] flex items-center justify-center pt-2">
          {chartType === 'bar' && (
            <div className="w-full space-y-4">
              {barData.map((item) => {
                const widthPct = Math.round((item.value / maxBarValue) * 100);
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-cyan-400 font-semibold tabular-nums">
                          ${item.value.toLocaleString()}
                        </span>
                        <span className="text-slate-500 tabular-nums">({item.share})</span>
                      </div>
                    </div>
                    <div className="w-full h-8 bg-[#090E1A] rounded-lg overflow-hidden border border-slate-800/80 relative flex items-center">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500/80 to-blue-500/90 rounded-md transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${widthPct}%` }}
                      >
                        <span className="text-[10px] font-mono text-slate-950 font-bold hidden sm:inline">
                          {item.count} accts
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {chartType === 'area' && (
            <div className="w-full">
              <svg className="w-full h-64 overflow-visible" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal guidelines */}
                {[0.25, 0.5, 0.75, 1].map((pct, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={200 - pct * 180}
                    x2="600"
                    y2={200 - pct * 180}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Baseline line */}
                <path
                  d="M 20 140 L 130 130 L 240 120 L 350 105 L 460 90 L 570 75"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Area fill */}
                <path
                  d="M 20 135 L 130 115 L 240 85 L 350 65 L 460 45 L 570 15 L 570 190 L 20 190 Z"
                  fill="url(#areaGradient)"
                />

                {/* Actual curve line */}
                <path
                  d="M 20 135 L 130 115 L 240 85 L 350 65 L 460 45 L 570 15"
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="3.5"
                />

                {/* Data points */}
                {[
                  { x: 20, y: 135, val: '$28.4k' },
                  { x: 130, y: 115, val: '$32.1k' },
                  { x: 240, y: 85, val: '$39.8k' },
                  { x: 350, y: 65, val: '$45.2k' },
                  { x: 460, y: 45, val: '$52.4k' },
                  { x: 570, y: 15, val: '$67.9k' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="5" fill="#0D1424" stroke="#22D3EE" strokeWidth="2.5" />
                    <text x={pt.x} y={pt.y - 10} fill="#E2E8F0" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      {pt.val}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="flex justify-between px-2 pt-4 text-xs font-mono text-slate-400">
                {timeSeriesData.map(d => (
                  <span key={d.month}>{d.month} 2026</span>
                ))}
              </div>
            </div>
          )}

          {chartType === 'donut' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
              {/* Circular SVG Donut */}
              <div className="relative w-52 h-52">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1E293B" strokeWidth="14" />
                  {/* Segment 1: North America 48% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#22D3EE"
                    strokeWidth="14"
                    strokeDasharray="114.6 238.8"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Europe 28% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#3B82F6"
                    strokeWidth="14"
                    strokeDasharray="66.8 238.8"
                    strokeDashoffset="-114.6"
                  />
                  {/* Segment 3: Asia Pacific 16% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#818CF8"
                    strokeWidth="14"
                    strokeDasharray="38.2 238.8"
                    strokeDashoffset="-181.4"
                  />
                  {/* Segment 4: Latin America 8% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#A855F7"
                    strokeWidth="14"
                    strokeDasharray="19.1 238.8"
                    strokeDashoffset="-219.6"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">48%</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Top Region</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-3 w-full max-w-xs">
                {donutData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-xs p-2 rounded bg-[#090E1A] border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="font-medium text-slate-200">{d.label}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-semibold tabular-nums">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
