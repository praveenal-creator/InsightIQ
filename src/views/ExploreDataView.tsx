import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  Download, 
  Filter, 
  BarChart2, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';
import { exportToCsv } from '../utils/exportCsv';

interface ExploreDataViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify?: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const ExploreDataView: React.FC<ExploreDataViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigate,
  onNotify
}) => {
  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const rawData = currentDataset?.sampleData || [];
  const columns = currentDataset?.schema || [];

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const filteredData = useMemo(() => {
    let result = [...rawData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === undefined || valB === undefined) return 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rawData, searchQuery, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExportCSV = (exportFull = false) => {
    const dataToExport = exportFull ? rawData : filteredData;
    if (dataToExport.length === 0) {
      if (onNotify) onNotify('Export Notice', 'No matching rows to export in current view.', 'info');
      return;
    }
    const filename = `${currentDataset.name.toLowerCase().replace(/\s+/g, '_')}_${exportFull ? 'full_dataset' : 'filtered_view'}_${Date.now()}.csv`;
    const success = exportToCsv(dataToExport, filename);
    if (success && onNotify) {
      onNotify(
        'CSV Export Succeeded',
        `Exported ${dataToExport.length} ${exportFull ? 'records' : 'filtered view records'} as ${filename}`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <span>Data Explorer</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              High-Density View
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive tabular inspection, live column sorting, and statistical summary profiling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={currentDataset?.id}
              onChange={(e) => {
                onSelectDataset(e.target.value);
                setCurrentPage(1);
              }}
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
            onClick={() => onNavigate('visualizations')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Chart this Data</span>
          </button>
        </div>
      </div>

      {/* Dataset Profile KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Indexed Records
          </span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {currentDataset?.rows.toLocaleString()}
          </span>
          <span className="text-[10px] text-cyan-400 block mt-0.5">Full Partition</span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Column Cardinality
          </span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {currentDataset?.columns} Fields
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Schema Verified</span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Hygiene & Quality
          </span>
          <span className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
            {currentDataset?.healthScore}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">0 Fatal Anomalies</span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Storage Footprint
          </span>
          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {currentDataset?.size}
          </span>
          <span className="text-[10px] text-purple-400 block mt-0.5">{currentDataset?.format} Stream</span>
        </div>
      </div>

      {/* Column Schema Profile Badges */}
      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Field Distribution Summary
          </span>
          <span className="text-[11px] text-slate-400">Click headers to sort ascending or descending</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {columns.map(col => (
            <div
              key={col.name}
              className="px-2.5 py-1 rounded bg-[#0D1424] border border-slate-800 text-xs flex items-center gap-1.5"
            >
              <span className="font-mono text-cyan-300 font-medium">{col.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">({col.type})</span>
              <span className="text-[10px] text-slate-400">· {col.uniqueCount.toLocaleString()} uniq</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-[#090E1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search across all fields..."
              className="w-full bg-[#0D1424] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400">
              Showing <span className="text-slate-200 font-mono tabular-nums">{paginatedData.length}</span> of{' '}
              <span className="text-slate-200 font-mono tabular-nums">{filteredData.length}</span> sample rows
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleExportCSV(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
                title="Export currently filtered and sorted rows as CSV"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Current View ({filteredData.length})</span>
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleExportCSV(true)}
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Export entire dataset without active search filter"
                >
                  <span>Export All ({rawData.length})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="px-4 py-3 cursor-pointer hover:text-cyan-300 transition-colors whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortColumn === col.name ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                    No rows match your current search query "{searchQuery}".
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {columns.map((col) => {
                      const val = row[col.name];
                      const isNumber = typeof val === 'number';
                      return (
                        <td
                          key={col.name}
                          className={`px-4 py-3 whitespace-nowrap tabular-nums ${
                            isNumber ? 'text-cyan-200 font-medium' : 'text-slate-300'
                          }`}
                        >
                          {val !== undefined ? String(val) : <span className="text-slate-600">NULL</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-[#090E1A] flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <span className="text-slate-200 font-medium tabular-nums">{currentPage}</span> of{' '}
            <span className="text-slate-200 font-medium tabular-nums">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
