
import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Search,
  ArrowUpDown,
  Download,
  BarChart2,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { Dataset, NavigationId } from '../types';
import { exportToCsv } from '../utils/exportCsv';
import { fetchDatasetPreview } from '../utils/datasetApi';
import { EmptyState } from '../components/common/EmptyState';

interface ExploreDataViewProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  onNavigate: (view: NavigationId) => void;
  onNotify?: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  onOpenUploadModal?: () => void;
}

export const ExploreDataView: React.FC<ExploreDataViewProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  onNavigate,
  onNotify,
  onOpenUploadModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewRows, setPreviewRows] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const pageSize = 5;

  const currentDataset =
    datasets.find(dataset => dataset.id === selectedDatasetId) ||
    datasets[0];

  const rawData = previewRows;
  const columns = currentDataset?.schema || [];

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery('');
    setSortColumn(null);
    setSortDirection('asc');
  }, [currentDataset?.id]);

  // Load the selected dataset page from authenticated cloud storage.
  useEffect(() => {
    if (!currentDataset) {
      setPreviewRows([]);
      setTotalRows(0);
      setTotalPages(1);
      return;
    }

    let cancelled = false;

    const loadPreview = async () => {
      setPreviewLoading(true);
      setPreviewError('');

      try {
        const preview = await fetchDatasetPreview(
          currentDataset.id,
          currentPage,
          pageSize
        );

        if (cancelled) return;

        setPreviewRows(preview.rows);
        setTotalRows(preview.total_rows);
        setTotalPages(preview.total_pages);
      } catch (error) {
        if (cancelled) return;

        setPreviewRows([]);
        setPreviewError(
          error instanceof Error
            ? error.message
            : 'Could not load dataset preview.'
        );
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
    };
  }, [currentDataset?.id, currentPage]);
  const handleSort = (columnName: string) => {
    if (sortColumn === columnName) {
      setSortDirection(previous =>
        previous === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortColumn(columnName);
      setSortDirection('asc');
    }

    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = [...rawData];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value ?? '').toLowerCase().includes(query)
        )
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (valueA == null && valueB == null) return 0;
        if (valueA == null) return 1;
        if (valueB == null) return -1;

        let comparison = 0;

        if (
          typeof valueA === 'number' &&
          typeof valueB === 'number'
        ) {
          comparison = valueA - valueB;
        } else {
          comparison = String(valueA).localeCompare(
            String(valueB),
            undefined,
            { numeric: true, sensitivity: 'base' }
          );
        }

        return sortDirection === 'asc'
          ? comparison
          : -comparison;
      });
    }

    return result;
  }, [rawData, searchQuery, sortColumn, sortDirection]);

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = filteredData;

  const handleExportCSV = () => {
    const dataToExport = filteredData;

    if (dataToExport.length === 0) {
      onNotify?.(
        'Export Notice',
        'There are no rows on this page to export.',
        'info'
      );
      return;
    }

    const filename =
      `${currentDataset.name.toLowerCase().replace(/\s+/g, '_')}_page_${currentPage}_` +
      `${Date.now()}.csv`;

    const success = exportToCsv(dataToExport, filename);

    if (success) {
      onNotify?.(
        'CSV Export Succeeded',
        `Exported ${dataToExport.length} rows from the current page as ${filename}.`,
        'success'
      );
    } else {
      onNotify?.(
        'Export Failed',
        'Unable to generate the CSV file.',
        'error'
      );
    }
  };
  if (!currentDataset || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Table}
          title="No dataset selected for exploration"
          description="Upload or select a dataset to inspect total dataset rows, search records, and sort columns."
          actionLabel="Connect Dataset"
          onAction={
            onOpenUploadModal ||
            (() => onNavigate('datasets'))
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Table className="w-5 h-5 text-cyan-400" />
              <span>Data Explorer</span>
            </h1>

            <span className="text-xs px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              Interactive View
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-0.5">
            Search, sort, inspect, and export available dataset records.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />

            <select
              value={currentDataset.id}
              onChange={event => {
                onSelectDataset(event.target.value);
              }}
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
            onClick={() => onNavigate('visualizations')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Chart this Data</span>
          </button>
        </div>
      </div>

      {/* Dataset Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Records
          </span>

          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {currentDataset.rows.toLocaleString()}
          </span>

          <span className="text-[10px] text-cyan-400 block mt-0.5">
            Dataset metadata
          </span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Available Fields
          </span>

          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {columns.length}
          </span>

          <span className="text-[10px] text-emerald-400 block mt-0.5">
            Schema columns
          </span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Available Preview Rows
          </span>

          <span className="text-lg font-bold text-cyan-400 font-mono tabular-nums">
            {rawData.length.toLocaleString()}
          </span>

          <span className="text-[10px] text-slate-400 block mt-0.5">
            Rows currently accessible
          </span>
        </div>

        <div className="p-3.5 bg-[#0D1424] border border-slate-800/80 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            File Format
          </span>

          <span className="text-lg font-bold text-white font-mono tabular-nums">
            {currentDataset.format}
          </span>

          <span className="text-[10px] text-purple-400 block mt-0.5">
            {currentDataset.size}
          </span>
        </div>

      </div>

      {/* Schema Profile */}
      <div className="bg-[#090F1E] border border-slate-800/80 rounded-xl p-4 space-y-2">

        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Schema Overview
          </span>

          <span className="text-[11px] text-slate-400">
            Select a column header to sort
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {columns.map(column => (
            <div
              key={column.name}
              className="px-2.5 py-1 rounded bg-[#0D1424] border border-slate-800 text-xs flex items-center gap-1.5"
            >
              <span className="font-mono text-cyan-300 font-medium">
                {column.name}
              </span>

              <span className="text-[10px] text-slate-500 font-mono">
                ({column.type})
              </span>

              <span className="text-[10px] text-slate-400">
                Â· {column.uniqueCount.toLocaleString()} unique
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 bg-[#090E1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={event => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search current page..."
              className="w-full bg-[#0D1424] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs text-slate-400">
              Showing{' '}
              <span className="text-slate-200 font-mono tabular-nums">
                {paginatedData.length}
              </span>{' '}
              of{' '}
              <span className="text-slate-200 font-mono tabular-nums">
                {filteredData.length}
              </span>{' '}
              total dataset rows
            </span>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
              title="Export filtered rows from the current page"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Current Page ({filteredData.length})</span>
            </button>


          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">

            <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                {columns.map(column => (
                  <th
                    key={column.name}
                    onClick={() => handleSort(column.name)}
                    className="px-4 py-3 cursor-pointer hover:text-cyan-300 transition-colors whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{column.name}</span>

                      <ArrowUpDown
                        className={`w-3 h-3 ${
                          sortColumn === column.name
                            ? 'text-cyan-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50 font-mono">
              {previewLoading ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-4 py-12 text-center text-cyan-400">
                    Loading dataset preview...
                  </td>
                </tr>
              ) : previewError ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="px-4 py-12 text-center text-red-400">
                    {previewError}
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(columns.length, 1)}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {rawData.length === 0
                      ? 'No preview rows are available for this dataset.'
                      : `No rows match "${searchQuery}".`}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {columns.map(column => {
                      const value = row[column.name];

                      return (
                        <td
                          key={column.name}
                          className={`px-4 py-3 whitespace-nowrap tabular-nums ${
                            typeof value === 'number'
                              ? 'text-cyan-200 font-medium'
                              : 'text-slate-300'
                          }`}
                        >
                          {value === null ||
                          value === undefined ||
                          value === ''
                            ? <span className="text-slate-600">NULL</span>
                            : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-800/80 bg-[#090E1A] flex items-center justify-between text-xs text-slate-400">

          <div>
            Page{' '}
            <span className="text-slate-200 font-medium tabular-nums">
              {safePage}
            </span>{' '}
            of{' '}
            <span className="text-slate-200 font-medium tabular-nums">
              {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCurrentPage(previous => Math.max(previous - 1, 1))
              }
              disabled={safePage <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                setCurrentPage(previous =>
                  Math.min(previous + 1, totalPages)
                )
              }
              disabled={safePage >= totalPages}
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
