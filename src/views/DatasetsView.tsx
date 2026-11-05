import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  ArrowRight, 
  Trash2, 
  Download, 
  Table, 
  Filter, 
  Clock, 
  ShieldCheck, 
  FileCode,
  Eye
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';

interface DatasetsViewProps {
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onOpenUploadModal: () => void;
  onSelectDatasetForExplore: (datasetId: string) => void;
  onDeleteDataset: (datasetId: string) => void;
  onLoadDemoMode?: () => void;
  isDemoMode?: boolean;
}

export const DatasetsView: React.FC<DatasetsViewProps> = ({
  datasets,
  onNavigate,
  onOpenUploadModal,
  onSelectDatasetForExplore,
  onDeleteDataset,
  onLoadDemoMode,
  isDemoMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeSchemaModal, setActiveSchemaModal] = useState<Dataset | null>(null);
  const [activePreviewModal, setActivePreviewModal] = useState<Dataset | null>(null);

  const formats = ['All', 'CSV', 'Parquet', 'Snowflake', 'BigQuery', 'JSON'];

  const filteredDatasets = datasets.filter((ds) => {
    const matchesQuery = 
      ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ds.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFormat = selectedFormat === 'All' || ds.format === selectedFormat;
    return matchesQuery && matchesFormat;
  });

  const totalRows = datasets.reduce((sum, d) => sum + d.rows, 0);

  const handleExportCSV = (ds: Dataset) => {
    if (!ds.sampleData || ds.sampleData.length === 0) return;
    const headers = Object.keys(ds.sampleData[0]).join(',');
    const rows = ds.sampleData.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ds.name.toLowerCase().replace(/\s+/g, '_')}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Datasets
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 rounded">
              {datasets.length} Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise data lake storage with automated schema validation and synthetic demonstration rows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Dataset</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090F1E] border border-slate-800/80 rounded-xl p-3.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dataset name, tags, description..."
            className="w-full bg-[#0D1424] border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Format tabs and View toggle */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg">
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-slate-800 text-cyan-300 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#060A14] border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dataset List / Grid */}
      {datasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="Upload your first dataset"
          description="Connect a CSV or JSON file to start exploring schemas, running SQL queries, and generating predictive models."
          actionLabel="Connect Dataset"
          onAction={onOpenUploadModal}
          secondaryActionLabel={onLoadDemoMode ? "Load Sample Datasets (Demo Mode)" : undefined}
          onSecondaryAction={onLoadDemoMode}
        />
      ) : filteredDatasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title="No matching datasets found"
          description={`No datasets match the filter "${searchQuery}". Reset filters or upload a new data stream.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedFormat('All');
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDatasets.map((ds) => (
            <div
              key={ds.id}
              className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5 flex-wrap">
                        <span>{ds.name}</span>
                        {ds.isDemo && (
                          <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded">
                            Demo
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{ds.format}</span>
                        <span>·</span>
                        <span>{ds.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-medium text-emerald-400 tabular-nums">
                      {ds.healthScore}%
                    </span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ds.description}
                </p>

                {/* Metrics ribbon */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#090E1A] rounded-lg border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Rows</span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {ds.rows.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Columns</span>
                    <span className="font-mono font-semibold text-slate-200 tabular-nums">
                      {ds.columns} fields
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {ds.tags.map(t => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded border border-slate-700/50">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveSchemaModal(ds)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Inspect Schema"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActivePreviewModal(ds)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Sample Row Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExportCSV(ds)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteDataset(ds.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                    title="Delete Dataset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectDatasetForExplore(ds.id);
                    onNavigate('explore');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dataset Name</th>
                  <th className="px-3 py-3">Format</th>
                  <th className="px-3 py-3 text-right">Rows</th>
                  <th className="px-3 py-3 text-right">Cols</th>
                  <th className="px-3 py-3">Size</th>
                  <th className="px-3 py-3 text-center">Quality</th>
                  <th className="px-3 py-3">Freshness</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredDatasets.map((ds) => (
                  <tr key={ds.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{ds.name}</span>
                          {ds.isDemo && (
                            <span className="px-1.5 py-0.2 text-[9px] font-mono uppercase bg-amber-950/70 text-amber-300 border border-amber-800/60 rounded">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{ds.description}</div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                        {ds.format}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-300">
                      {ds.rows.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono tabular-nums text-slate-300">
                      {ds.columns}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-slate-400">
                      {ds.size}
                    </td>
                    <td className="px-3 py-3.5 text-center font-mono text-emerald-400 tabular-nums">
                      {ds.healthScore}%
                    </td>
                    <td className="px-3 py-3.5 text-slate-400 text-[11px]">
                      {ds.updatedAt}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            onSelectDatasetForExplore(ds.id);
                            onNavigate('explore');
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-cyan-300 bg-slate-800 hover:bg-cyan-900/40 rounded transition-colors cursor-pointer"
                        >
                          Explore
                        </button>
                        <button
                          onClick={() => setActiveSchemaModal(ds)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title="View Schema"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDataset(ds.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schema Inspector Modal */}
      {activeSchemaModal && (
        <Modal
          isOpen={!!activeSchemaModal}
          onClose={() => setActiveSchemaModal(null)}
          title={`Schema Inspector · ${activeSchemaModal.name}`}
          description={`${activeSchemaModal.schema.length} fields detected with data types and nullability`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090E1A] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-3.5 py-2.5">Field Name</th>
                    <th className="px-3.5 py-2.5">Type</th>
                    <th className="px-3.5 py-2.5">Nullable</th>
                    <th className="px-3.5 py-2.5 text-right">Unique Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {activeSchemaModal.schema.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-800/30">
                      <td className="px-3.5 py-2 font-semibold text-cyan-300">{col.name}</td>
                      <td className="px-3.5 py-2 text-slate-400">{col.type}</td>
                      <td className="px-3.5 py-2">
                        {col.nullable ? (
                          <span className="text-amber-400">YES</span>
                        ) : (
                          <span className="text-emerald-400">NO</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2 text-right tabular-nums text-slate-200">
                        {col.uniqueCount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSchemaModal(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sample Row Preview Modal */}
      {activePreviewModal && (
        <Modal
          isOpen={!!activePreviewModal}
          onClose={() => setActivePreviewModal(null)}
          title={`Sample Records · ${activePreviewModal.name}`}
          description="Displaying top synthetic sample rows from in-memory engine"
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090E1A] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    {Object.keys(activePreviewModal.sampleData[0] || {}).map((key) => (
                      <th key={key} className="px-3.5 py-2.5 whitespace-nowrap font-mono text-cyan-400">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {activePreviewModal.sampleData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 whitespace-nowrap tabular-nums">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleExportCSV(activePreviewModal)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 rounded-lg cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Sample to CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewModal(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
