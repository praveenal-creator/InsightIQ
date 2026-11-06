
import React, { useMemo, useState } from 'react';
import {
  Filter,
  Check,
  RotateCcw,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Database,
  Layers,
  Wand2
} from 'lucide-react';

import { Dataset, NavigationId } from '../types';
import { EmptyState } from '../components/common/EmptyState';

interface DataCleaningViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify: (
    title: string,
    description: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  onUpdateDatasetData?: (
    datasetId: string,
    updatedRows: Record<string, any>[]
  ) => void;
  onOpenUploadModal?: () => void;
}

interface Step {
  id: string;
  name: string;
  description: string;
  applied: boolean;
  type: 'trim' | 'dedup' | 'titleCase';
  colName?: string;
}

export const DataCleaningView: React.FC<DataCleaningViewProps> = (props) => {
  const { datasets, onOpenUploadModal } = props;

  if (!datasets || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            <span>Data Cleaning Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect missing values, remove duplicate records, and clean uploaded datasets.
          </p>
        </div>

        <EmptyState
          icon={Filter}
          title="No dataset available for cleaning"
          description="Upload a dataset to inspect its rows, detect missing values, and apply data cleaning transformations."
          actionLabel="Upload Dataset"
          onAction={onOpenUploadModal}
        />
      </div>
    );
  }

  return <CleaningWorkspace {...props} />;
};

const CleaningWorkspace: React.FC<DataCleaningViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigate,
  onNotify,
  onUpdateDatasetData
}) => {
  const currentDataset =
    datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const columns = currentDataset.schema || [];
  const rawRows = currentDataset.sampleData || [];

  const [pipelineSteps, setPipelineSteps] = useState<Step[]>([
    {
      id: 'step-trim',
      name: 'Trim Leading and Trailing Whitespace',
      description: 'Removes unnecessary spaces from string values in every column.',
      applied: true,
      type: 'trim'
    },
    {
      id: 'step-dedup',
      name: 'Remove Exact Duplicate Rows',
      description: 'Keeps only one copy of identical records.',
      applied: true,
      type: 'dedup'
    }
  ]);

  const [previewMode, setPreviewMode] = useState<'clean' | 'diff'>('diff');

  const { nullCount, dupCount } = useMemo(() => {
    let nulls = 0;
    const seen = new Set<string>();
    let duplicates = 0;

    rawRows.forEach(row => {
      const rowKey = JSON.stringify(row);

      if (seen.has(rowKey)) {
        duplicates++;
      } else {
        seen.add(rowKey);
      }

      Object.values(row).forEach(value => {
        if (
          value === null ||
          value === undefined ||
          value === ''
        ) {
          nulls++;
        }
      });
    });

    return {
      nullCount: nulls,
      dupCount: duplicates
    };
  }, [rawRows]);

  const cleanedRows = useMemo(() => {
    let rows = rawRows.map(row => ({ ...row }));

    pipelineSteps.forEach(step => {
      if (!step.applied) return;

      if (step.type === 'trim') {
        rows = rows.map(row => {
          const transformed: Record<string, any> = {};

          Object.entries(row).forEach(([key, value]) => {
            transformed[key] =
              typeof value === 'string' ? value.trim() : value;
          });

          return transformed;
        });
      }

      if (step.type === 'dedup') {
        const seen = new Set<string>();

        rows = rows.filter(row => {
          const key = JSON.stringify(row);

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        });
      }

      if (step.type === 'titleCase' && step.colName) {
        rows = rows.map(row => {
          const value = row[step.colName!];

          if (typeof value !== 'string') return row;

          return {
            ...row,
            [step.colName!]: value
              .trim()
              .toLowerCase()
              .replace(/\b\w/g, char => char.toUpperCase())
          };
        });
      }
    });

    return rows;
  }, [rawRows, pipelineSteps]);

  const handleToggleStep = (id: string) => {
    setPipelineSteps(previous =>
      previous.map(step =>
        step.id === id
          ? { ...step, applied: !step.applied }
          : step
      )
    );
  };

  const handleAddCustomStep = () => {
    const firstCol = columns[0]?.name;

    if (!firstCol) {
      onNotify(
        'No columns available',
        'This dataset does not have any columns to transform.',
        'error'
      );
      return;
    }

    const newStep: Step = {
      id: `step-${Date.now()}`,
      name: `Standardize Text Case: ${firstCol}`,
      description: `Converts text values in ${firstCol} to Title Case.`,
      applied: true,
      type: 'titleCase',
      colName: firstCol
    };

    setPipelineSteps(previous => [...previous, newStep]);

    onNotify(
      'Step Added',
      `Title Case transformation added for ${firstCol}.`,
      'success'
    );
  };

  const handleApplyPipeline = () => {
    if (!onUpdateDatasetData) {
      onNotify(
        'Update unavailable',
        'The dataset update handler is not connected.',
        'error'
      );
      return;
    }

    const activeSteps = pipelineSteps.filter(step => step.applied);

    onUpdateDatasetData(currentDataset.id, cleanedRows);

    onNotify(
      'Cleaning Completed',
      `Applied ${activeSteps.length} transformations to ${currentDataset.name}. Processed ${rawRows.length} available rows.`,
      'success'
    );
  };

  const handleResetPipeline = () => {
    setPipelineSteps(previous =>
      previous.map(step => ({ ...step, applied: false }))
    );

    onNotify(
      'Pipeline Reset',
      'All transformations have been disabled. The preview now shows the original rows.',
      'info'
    );
  };

  const displayedRows =
    previewMode === 'clean' ? cleanedRows : cleanedRows;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-400" />
              <span>Data Cleaning Studio</span>
            </h1>

            <span className="text-xs px-2 py-0.5 bg-cyan-950/50 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              Data Transformation
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Create cleaning pipelines for{' '}
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
            onClick={handleApplyPipeline}
            disabled={!onUpdateDatasetData}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Pipeline</span>
          </button>
        </div>
      </div>

      {/* Actual dataset metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Available Rows
            </span>
            <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
              {rawRows.length}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Rows available for inspection
            </span>
          </div>
          <ShieldCheck className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Missing Values
            </span>
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {nullCount}
            </span>
            <span className="text-[10px] text-cyan-400 block">
              {nullCount === 0 ? 'No missing values found' : 'Missing cells detected'}
            </span>
          </div>
          <Check className="w-8 h-8 text-cyan-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Duplicate Rows
            </span>
            <span className="text-2xl font-bold text-slate-100 font-mono tabular-nums">
              {dupCount}
            </span>
            <span className="text-[10px] text-emerald-400 block">
              {dupCount === 0 ? 'No exact duplicates' : 'Duplicate records detected'}
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/30" />
        </div>

        <div className="p-4 bg-[#0D1424] border border-slate-800/80 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Columns
            </span>
            <span className="text-2xl font-bold text-cyan-400 font-mono tabular-nums">
              {columns.length}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Available fields
            </span>
          </div>
          <AlertCircle className="w-8 h-8 text-cyan-400/30" />
        </div>

      </div>

      {/* Pipeline and preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Transformation steps */}
        <div className="lg:col-span-5 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">
                Transformation Steps
              </h2>
              <span className="text-xs text-slate-400">
                ({pipelineSteps.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetPipeline}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Disable all transformations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleAddCustomStep}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Step</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {pipelineSteps.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">
                No transformation steps. Add a step to begin.
              </p>
            )}

            {pipelineSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  step.applied
                    ? 'bg-[#090E1A] border-cyan-800/60'
                    : 'bg-[#080C16] border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">
                        {step.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {step.description}
                      </p>
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
        </div>

        {/* Table preview */}
        <div className="lg:col-span-7 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">
                Processed Data Preview
              </h2>
            </div>

            <span className="text-xs text-cyan-400">
              {cleanedRows.length} rows after transformations
            </span>
          </div>

          <div className="p-4 overflow-x-auto flex-1">
            {columns.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No schema information is available for this dataset.
              </p>
            ) : (
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    {columns.map(column => (
                      <th
                        key={column.name}
                        className="px-3 py-2.5 whitespace-nowrap text-cyan-400 font-mono"
                      >
                        {column.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {displayedRows.slice(0, 6).map((row, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">
                      {columns.map(column => {
                        const value = row[column.name];

                        return (
                          <td
                            key={column.name}
                            className="px-3 py-2.5 whitespace-nowrap tabular-nums text-slate-200"
                          >
                            {value !== null && value !== undefined && value !== ''
                              ? String(value)
                              : <span className="text-slate-600">NULL</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {displayedRows.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">
                No rows available after the selected transformations.
              </p>
            )}
          </div>

          <div className="p-3 border-t border-slate-800 bg-[#090E1A] text-xs text-slate-400 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>
                Previewing available rows from {currentDataset.name}.
              </span>
            </span>

            <button
              onClick={() => onNavigate('explore')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Explore full data</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
