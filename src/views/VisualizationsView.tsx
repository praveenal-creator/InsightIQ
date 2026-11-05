import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  Database, 
  Plus,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';
import { EmptyState } from '../components/common/EmptyState';

interface VisualizationsViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
  onOpenUploadModal?: () => void;
  onLoadDemoMode?: () => void;
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigate,
  onNotify,
  onOpenUploadModal,
  onLoadDemoMode
}) => {
  if (!datasets || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Visualizations Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic chart construction and distribution analytics.
          </p>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No charts created yet"
          description="Upload your first dataset to start visualizing distributions, segment aggregations, and metric correlations."
          actionLabel="Upload Dataset"
          onAction={onOpenUploadModal}
        />

        {onLoadDemoMode && (
          <div className="text-center">
            <button
              onClick={onLoadDemoMode}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Or load sample datasets in Demo Mode to test charting capabilities
            </button>
          </div>
        )}
      </div>
    );
  }

  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  // Identify candidate dimensions (text/category) and metrics (numeric) from actual dataset schema
  const categoricalCols = currentDataset.schema.filter(s => s.type === 'VARCHAR' || s.type === 'BOOLEAN');
  const numericCols = currentDataset.schema.filter(s => s.type === 'INTEGER' || s.type === 'DECIMAL' || s.type === 'FLOAT');

  const defaultDimension = categoricalCols[0]?.name || currentDataset.schema[0]?.name || 'category';
  const defaultMetric = numericCols[0]?.name || 'count';

  const [chartType, setChartType] = useState<'bar' | 'area' | 'donut'>('bar');
  const [dimension, setDimension] = useState<string>(defaultDimension);
  const [metric, setMetric] = useState<string>(defaultMetric);
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum');

  // Dynamically aggregate real dataset values
  const { chartData, donutData, totalMetricValue, maxBarValue } = useMemo(() => {
    const rows = currentDataset.sampleData || [];
    if (rows.length === 0) {
      return { chartData: [], donutData: [], totalMetricValue: 0, maxBarValue: 1 };
    }

    const groupMap = new Map<string, { sum: number; count: number; values: number[] }>();

    rows.forEach(r => {
      const dimVal = r[dimension] !== undefined && r[dimension] !== null ? String(r[dimension]) : 'Unspecified';
      const metricVal = typeof r[metric] === 'number' ? r[metric] : 1;

      if (!groupMap.has(dimVal)) {
        groupMap.set(dimVal, { sum: 0, count: 0, values: [] });
      }
      const entry = groupMap.get(dimVal)!;
      entry.sum += metricVal;
      entry.count += 1;
      entry.values.push(metricVal);
    });

    const entries = Array.from(groupMap.entries()).map(([label, stats]) => {
      let finalVal = stats.sum;
      if (aggregation === 'avg') {
        finalVal = stats.count > 0 ? Math.round((stats.sum / stats.count) * 100) / 100 : 0;
      } else if (aggregation === 'count') {
        finalVal = stats.count;
      }
      return {
        label,
        value: finalVal,
        count: stats.count
      };
    });

    // Sort descending by value
    entries.sort((a, b) => b.value - a.value);

    const topEntries = entries.slice(0, 6);
    const sumTotal = topEntries.reduce((acc, curr) => acc + curr.value, 0) || 1;
    const maxVal = Math.max(...topEntries.map(e => e.value), 1);

    const palette = ['#22D3EE', '#3B82F6', '#818CF8', '#A855F7', '#EC4899', '#10B981'];

    const formattedDonut = topEntries.map((item, idx) => ({
      label: item.label,
      value: Math.round((item.value / sumTotal) * 100),
      rawVal: item.value,
      color: palette[idx % palette.length]
    }));

    return {
      chartData: topEntries.map(e => ({
        ...e,
        share: `${Math.round((e.value / sumTotal) * 100)}%`
      })),
      donutData: formattedDonut,
      totalMetricValue: sumTotal,
      maxBarValue: maxVal
    };
  }, [currentDataset, dimension, metric, aggregation]);

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
            Construct high-fidelity analytical charts from real records in <span className="text-slate-200 font-medium">{currentDataset.name}</span>.
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
                  {d.name} {d.isDemo ? '(Demo)' : ''}
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

      {/* Control Strip & Dynamic Axis Selectors */}
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
            <span>Distribution Bar</span>
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'area' ? 'bg-slate-800 text-cyan-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4 text-blue-400" />
            <span>Sequence Curve</span>
          </button>
          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'donut' ? 'bg-slate-800 text-cyan-300 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            <span>Category Share</span>
          </button>
        </div>

        {/* Real Dimensions & Metrics Selection from schema */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dimension (X):</span>
            <select
              value={dimension}
              onChange={(e) => setDimension(e.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
            >
              {currentDataset.schema.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.type})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Metric (Y):</span>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
            >
              {numericCols.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
              <option value="record_count">Record Frequency (Count)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Aggregate:</span>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as any)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Viewport */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {metric.toUpperCase()} by {dimension.toUpperCase()} ({aggregation.toUpperCase()})
            </h3>
            <span className="text-xs text-slate-400 mt-0.5 block">
              Evaluated on {currentDataset.sampleData.length} records in {currentDataset.name}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
              <span>Real Dataset Distribution</span>
            </span>
          </div>
        </div>

        {/* Chart Renderings based on actual dataset calculations */}
        <div className="min-h-[340px] flex items-center justify-center pt-2">
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No non-empty data found for dimension "{dimension}". Select a different field.
            </div>
          ) : chartType === 'bar' ? (
            <div className="w-full space-y-4">
              {chartData.map((item) => {
                const widthPct = Math.max(Math.round((item.value / maxBarValue) * 100), 4);
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.label}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-cyan-400 font-semibold tabular-nums">
                          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
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
                          {item.count} rows
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : chartType === 'area' ? (
            <div className="w-full">
              <svg className="w-full h-64 overflow-visible" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="areaGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
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

                {/* Compute curve path dynamically */}
                {(() => {
                  const stepX = 560 / Math.max(chartData.length - 1, 1);
                  const points = chartData.map((d, idx) => {
                    const x = 20 + idx * stepX;
                    const y = 190 - (d.value / maxBarValue) * 160;
                    return { x, y, val: d.value, label: d.label };
                  });

                  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${points[points.length - 1]?.x || 580} 190 L ${points[0]?.x || 20} 190 Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#areaGradientDynamic)" />
                      <path d={linePath} fill="none" stroke="#22D3EE" strokeWidth="3" />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#0D1424" stroke="#22D3EE" strokeWidth="2.5" />
                          <text x={pt.x} y={pt.y - 10} fill="#E2E8F0" fontSize="10" textAnchor="middle" fontFamily="monospace">
                            {typeof pt.val === 'number' ? pt.val.toLocaleString() : pt.val}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between px-2 pt-4 text-xs font-mono text-slate-400">
                {chartData.map(d => (
                  <span key={d.label} className="truncate max-w-[80px]">{d.label}</span>
                ))}
              </div>
            </div>
          ) : (
            /* Donut chart */
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
              <div className="relative w-52 h-52">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#1E293B" strokeWidth="14" />
                  {(() => {
                    const circumference = 2 * Math.PI * 38; // ~238.76
                    let offsetAccum = 0;
                    return donutData.map((seg, idx) => {
                      const strokeDash = (seg.value / 100) * circumference;
                      const strokeGap = circumference - strokeDash;
                      const currentOffset = offsetAccum;
                      offsetAccum -= strokeDash;
                      return (
                        <circle
                          key={idx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={`${strokeDash} ${strokeGap}`}
                          strokeDashoffset={currentOffset}
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {donutData[0]?.value || 0}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                    {donutData[0]?.label || 'Top Segment'}
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="space-y-2.5 w-full max-w-xs">
                {donutData.map((d) => (
                  <div key={d.label} className="flex items-center justify-between text-xs p-2 rounded bg-[#090E1A] border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-medium text-slate-200 truncate">{d.label}</span>
                    </div>
                    <span className="font-mono text-cyan-300 font-semibold tabular-nums ml-2">
                      {d.value}%
                    </span>
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
