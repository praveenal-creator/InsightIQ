
import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Download,
  Database
} from 'lucide-react';

import { Dataset } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { exportToCsv } from '../utils/exportCsv';

interface VisualizationsViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  onOpenUploadModal?: () => void;
}

type ChartType = 'bar' | 'area' | 'donut';
type Aggregation = 'sum' | 'avg' | 'count';

interface ChartEntry {
  label: string;
  value: number;
  count: number;
  share: string;
}

interface DonutEntry {
  label: string;
  value: number;
  rawVal: number;
  color: string;
}

const PALETTE = [
  '#22D3EE',
  '#3B82F6',
  '#818CF8',
  '#A855F7',
  '#EC4899',
  '#10B981'
];

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNotify,
  onOpenUploadModal
}) => {
  if (!datasets || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Visualizations Studio
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Create charts and explore patterns in your uploaded datasets.
          </p>
        </div>

        <EmptyState
          icon={BarChart3}
          title="No datasets available"
          description="Upload a CSV or JSON dataset to start creating visualizations from its available records."
          actionLabel="Upload Dataset"
          onAction={onOpenUploadModal}
        />
      </div>
    );
  }

  return (
    <VisualizationWorkspace
      datasets={datasets}
      selectedDatasetId={selectedDatasetId}
      onSelectDataset={onSelectDataset}
      onNotify={onNotify}
    />
  );
};

interface VisualizationWorkspaceProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
}

const VisualizationWorkspace: React.FC<VisualizationWorkspaceProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNotify
}) => {
  const currentDataset =
    datasets.find(dataset => dataset.id === selectedDatasetId) || datasets[0];

  const categoricalCols = currentDataset.schema.filter(
    column => column.type === 'VARCHAR' || column.type === 'BOOLEAN'
  );

  const numericCols = currentDataset.schema.filter(
    column =>
      column.type === 'INTEGER' ||
      column.type === 'DECIMAL' ||
      column.type === 'FLOAT'
  );

  const defaultDimension =
    categoricalCols[0]?.name ||
    currentDataset.schema[0]?.name ||
    '';

  const defaultMetric = numericCols[0]?.name || 'record_count';

  const [chartType, setChartType] = useState<ChartType>('bar');
  const [dimension, setDimension] = useState(defaultDimension);
  const [metric, setMetric] = useState(defaultMetric);
  const [aggregation, setAggregation] = useState<Aggregation>('sum');

  useEffect(() => {
    setDimension(defaultDimension);
    setMetric(defaultMetric);
  }, [currentDataset.id, defaultDimension, defaultMetric]);

  const previewRows = currentDataset.sampleData || [];

  const { chartData, donutData, maxBarValue } = useMemo(() => {
    if (previewRows.length === 0 || !dimension) {
      return {
        chartData: [] as ChartEntry[],
        donutData: [] as DonutEntry[],
        maxBarValue: 1
      };
    }

    const groupMap = new Map<string, { sum: number; count: number }>();

    previewRows.forEach(row => {
      const rawDimensionValue = row[dimension];

      const dimensionValue =
        rawDimensionValue !== undefined && rawDimensionValue !== null
          ? String(rawDimensionValue)
          : 'Unspecified';

      const rawMetricValue =
        metric === 'record_count' ? 1 : row[metric];

      const parsedMetricValue =
        typeof rawMetricValue === 'number'
          ? rawMetricValue
          : Number(rawMetricValue);

      const metricValue = Number.isFinite(parsedMetricValue)
        ? parsedMetricValue
        : 0;

      if (!groupMap.has(dimensionValue)) {
        groupMap.set(dimensionValue, { sum: 0, count: 0 });
      }

      const entry = groupMap.get(dimensionValue)!;

      entry.sum += metricValue;
      entry.count += 1;
    });

    const entries: ChartEntry[] = Array.from(groupMap.entries()).map(
      ([label, stats]) => {
        let value = stats.sum;

        if (aggregation === 'avg') {
          value = stats.count > 0
            ? Math.round((stats.sum / stats.count) * 100) / 100
            : 0;
        } else if (aggregation === 'count') {
          value = stats.count;
        }

        return {
          label,
          value,
          count: stats.count,
          share: '0%'
        };
      }
    );

    entries.sort((a, b) => b.value - a.value);

    const topEntries = entries.slice(0, 6);

    const absoluteTotal = topEntries.reduce(
      (sum, entry) => sum + Math.abs(entry.value),
      0
    );

    const maxValue = Math.max(
      ...topEntries.map(entry => Math.abs(entry.value)),
      1
    );

    const formattedEntries = topEntries.map(entry => ({
      ...entry,
      share: absoluteTotal > 0
        ? `${Math.round((Math.abs(entry.value) / absoluteTotal) * 100)}%`
        : '0%'
    }));

    const formattedDonut = formattedEntries.map((entry, index) => ({
      label: entry.label,
      value: absoluteTotal > 0
        ? (Math.abs(entry.value) / absoluteTotal) * 100
        : 0,
      rawVal: entry.value,
      color: PALETTE[index % PALETTE.length]
    }));

    return {
      chartData: formattedEntries,
      donutData: formattedDonut,
      maxBarValue: maxValue
    };
  }, [previewRows, dimension, metric, aggregation]);

  const handleExportChart = () => {
    if (chartData.length === 0) {
      onNotify(
        'Nothing to Export',
        'There are no chart records available for export.',
        'info'
      );
      return;
    }

    const exportRows = chartData.map(item => ({
      dimension: item.label,
      metric: item.value,
      record_count: item.count,
      percentage: item.share
    }));

    const filename = `visualization_${Date.now()}.csv`;
    const success = exportToCsv(exportRows, filename);

    onNotify(
      success ? 'Export Succeeded' : 'Export Failed',
      success
        ? `Exported ${exportRows.length} chart records to ${filename}.`
        : 'The chart data could not be exported.',
      success ? 'success' : 'error'
    );
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Visualizations Studio
            </h1>

            <span className="text-xs px-2 py-0.5 bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded font-mono">
              Data Preview Charts
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Explore available records in{' '}
            <span className="text-slate-200 font-medium">
              {currentDataset.name}
            </span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />

            <select
              value={currentDataset.id}
              onChange={event => onSelectDataset(event.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              {datasets.map(dataset => (
                <option
                  key={dataset.id}
                  value={dataset.id}
                  className="bg-[#0D1424] text-slate-200"
                >
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportChart}
            disabled={chartData.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg flex-wrap">

          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'bar'
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Distribution Bar
          </button>

          <button
            onClick={() => setChartType('area')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'area'
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-4 h-4 text-blue-400" />
            Sequence Curve
          </button>

          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              chartType === 'donut'
                ? 'bg-slate-800 text-cyan-300 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4 text-purple-400" />
            Category Share
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Dimension:</span>

            <select
              value={dimension}
              onChange={event => setDimension(event.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
            >
              {currentDataset.schema.map(column => (
                <option key={column.name} value={column.name}>
                  {column.name} ({column.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Metric:</span>

            <select
              value={metric}
              onChange={event => setMetric(event.target.value)}
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
            >
              {numericCols.map(column => (
                <option key={column.name} value={column.name}>
                  {column.name}
                </option>
              ))}

              <option value="record_count">Record Frequency</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Aggregate:</span>

            <select
              value={aggregation}
              onChange={event =>
                setAggregation(event.target.value as Aggregation)
              }
              className="bg-[#0D1424] border border-slate-700/80 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="sum">Sum</option>
              <option value="avg">Average</option>
              <option value="count">Count</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-semibold text-white">
              {metric.toUpperCase()} by {dimension.toUpperCase()} ({aggregation.toUpperCase()})
            </h3>

            <span className="text-xs text-slate-400 mt-1 block">
              Calculated from {previewRows.length.toLocaleString()} available preview records in {currentDataset.name}
            </span>
          </div>

          <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            Calculated preview data
          </span>
        </div>

        <div className="min-h-[340px] flex items-center justify-center pt-2">
          {chartData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {previewRows.length === 0
                ? 'No preview records are available for this dataset.'
                : `No data found for dimension "${dimension}". Select another field.`}
            </div>
          ) : chartType === 'bar' ? (
            <div className="w-full space-y-4">
              {chartData.map(item => {
                const widthPct = Math.max(
                  Math.round(
                    (Math.abs(item.value) / maxBarValue) * 100
                  ),
                  2
                );

                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-semibold text-slate-200 truncate">
                        {item.label}
                      </span>

                      <div className="flex items-center gap-3 font-mono shrink-0">
                        <span className="text-cyan-400 font-semibold tabular-nums">
                          {item.value.toLocaleString()}
                        </span>

                        <span className="text-slate-500 tabular-nums">
                          ({item.share})
                        </span>
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
              <svg
                className="w-full h-64 overflow-visible"
                viewBox="0 0 600 200"
                role="img"
                aria-label="Dataset sequence chart"
              >
                <defs>
                  <linearGradient
                    id="areaGradientDynamic"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[0.25, 0.5, 0.75, 1].map((percentage, index) => (
                  <line
                    key={index}
                    x1="0"
                    y1={200 - percentage * 180}
                    x2="600"
                    y2={200 - percentage * 180}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                  />
                ))}

                {(() => {
                  const stepX = 560 / Math.max(chartData.length - 1, 1);

                  const points = chartData.map((entry, index) => ({
                    x: 20 + index * stepX,
                    y: 190 - (
                      (Math.abs(entry.value) / maxBarValue) * 160
                    ),
                    value: entry.value
                  }));

                  const linePath = points
                    .map((point, index) =>
                      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                    )
                    .join(' ');

                  const areaPath = points.length > 0
                    ? `${linePath} L ${points[points.length - 1].x} 190 L ${points[0].x} 190 Z`
                    : '';

                  return (
                    <>
                      <path d={areaPath} fill="url(#areaGradientDynamic)" />

                      <path
                        d={linePath}
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="3"
                      />

                      {points.map((point, index) => (
                        <g key={index}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="5"
                            fill="#0D1424"
                            stroke="#22D3EE"
                            strokeWidth="2.5"
                          />

                          <text
                            x={point.x}
                            y={point.y - 10}
                            fill="#E2E8F0"
                            fontSize="10"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {point.value.toLocaleString()}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>

              <div className="flex justify-between gap-2 px-2 pt-4 text-xs font-mono text-slate-400">
                {chartData.map(entry => (
                  <span
                    key={entry.label}
                    className="truncate max-w-[80px]"
                    title={entry.label}
                  >
                    {entry.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full">
              <div className="relative w-52 h-52 shrink-0">
                <svg
                  className="w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Category distribution donut chart"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#1E293B"
                    strokeWidth="14"
                  />

                  {(() => {
                    const circumference = 2 * Math.PI * 38;
                    let offsetAccum = 0;

                    return donutData.map((segment, index) => {
                      const strokeDash =
                        (segment.value / 100) * circumference;

                      const currentOffset = offsetAccum;
                      offsetAccum -= strokeDash;

                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={segment.color}
                          strokeWidth="14"
                          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                          strokeDashoffset={currentOffset}
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold font-mono text-white tabular-nums">
                    {Math.round(donutData[0]?.value || 0)}%
                  </span>

                  <span className="text-[10px] text-slate-400 uppercase tracking-wider truncate max-w-[100px]">
                    {donutData[0]?.label || 'Top Segment'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 w-full max-w-xs">
                {donutData.map(segment => (
                  <div
                    key={segment.label}
                    className="flex items-center justify-between gap-3 text-xs p-2 rounded bg-[#090E1A] border border-slate-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: segment.color }}
                      />

                      <span className="font-medium text-slate-200 truncate">
                        {segment.label}
                      </span>
                    </div>

                    <span className="font-mono text-cyan-300 font-semibold tabular-nums ml-2">
                      {segment.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-cyan-400 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Visualization data scope
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Charts are calculated from the preview records currently
              available in the selected dataset. They do not necessarily
              represent every row in the original uploaded file.
              Export CSV downloads the calculated chart summary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
