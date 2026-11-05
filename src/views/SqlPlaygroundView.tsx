import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Database, 
  Clock, 
  Code2, 
  RotateCcw,
  AlertCircle,
  History,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Dataset, NavigationId, SqlQueryRecord } from '../types';
import { executeSqlOnDatasets, normalizeTableName } from '../utils/sqlEngine';
import { exportToCsv } from '../utils/exportCsv';
import { EmptyState } from '../components/common/EmptyState';

interface SqlPlaygroundViewProps {
  datasets: Dataset[];
  initialQuery?: string;
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
  queryHistory: SqlQueryRecord[];
  onLogQuery: (record: SqlQueryRecord) => void;
  onOpenUploadModal?: () => void;
  onLoadDemoMode?: () => void;
}

export const SqlPlaygroundView: React.FC<SqlPlaygroundViewProps> = ({
  datasets,
  initialQuery,
  onNavigate,
  onNotify,
  queryHistory,
  onLogQuery,
  onOpenUploadModal,
  onLoadDemoMode
}) => {
  const firstTableName = datasets[0] ? normalizeTableName(datasets[0].name) : 'my_dataset';
  const defaultQuery = initialQuery || (datasets.length > 0 
    ? `SELECT * FROM ${firstTableName} LIMIT 10;`
    : `SELECT * FROM datasets;`);

  const [query, setQuery] = useState(defaultQuery);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [executionResult, setExecutionResult] = useState<{
    hasExecuted: boolean;
    success: boolean;
    columns: string[];
    rows: Record<string, any>[];
    rowCount: number;
    durationMs: number;
    errorMessage?: string;
    tableName?: string;
  }>({
    hasExecuted: false,
    success: true,
    columns: [],
    rows: [],
    rowCount: 0,
    durationMs: 0
  });

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleRunQuery = () => {
    if (!query.trim()) return;
    setIsRunning(true);

    setTimeout(() => {
      const result = executeSqlOnDatasets(query, datasets);
      setIsRunning(false);

      setExecutionResult({
        hasExecuted: true,
        success: result.success,
        columns: result.columns,
        rows: result.rows,
        rowCount: result.rowCount,
        durationMs: result.durationMs,
        errorMessage: result.errorMessage,
        tableName: result.tableName
      });

      // Log into history
      const historyItem: SqlQueryRecord = {
        id: `q-${Date.now()}`,
        query,
        timestamp: new Date().toLocaleTimeString(),
        durationMs: result.durationMs,
        rowCount: result.rowCount,
        status: result.success ? '200 OK' : 'Error',
        errorMessage: result.errorMessage
      };
      onLogQuery(historyItem);

      if (result.success) {
        onNotify('SQL Executed', `Returned ${result.rowCount} records in ${result.durationMs}ms.`, 'success');
      } else {
        onNotify('SQL Syntax Error', result.errorMessage || 'Failed to parse query', 'error');
      }
    }, 150);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportResults = () => {
    if (executionResult.rows.length === 0) {
      onNotify('Export Notice', 'No query records to export.', 'info');
      return;
    }
    const filename = `sql_result_${Date.now()}.csv`;
    const ok = exportToCsv(executionResult.rows, filename);
    if (ok) {
      onNotify('Export Succeeded', `Exported ${executionResult.rows.length} rows to ${filename}`, 'success');
    }
  };

  if (!datasets || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>SQL Playground</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real in-memory SQL execution engine for partitioned data lakes.
          </p>
        </div>

        <EmptyState
          icon={Terminal}
          title="No tables available to query"
          description="Upload a CSV or JSON dataset to start writing and running SQL queries with sub-20ms evaluation."
          actionLabel="Upload Dataset"
          onAction={onOpenUploadModal}
        />

        {onLoadDemoMode && (
          <div className="text-center">
            <button
              onClick={onLoadDemoMode}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
            >
              Or explore SQL queries in Demo Mode with sample tables
            </button>
          </div>
        )}
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
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>SQL Playground</span>
            </h1>
            <span className="text-xs px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              In-Memory OLAP Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Query across <span className="text-slate-200 font-medium">{datasets.length} active tables</span> with instant evaluation and zero latency.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showHistory
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-[#090E1A] text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({queryHistory.length})</span>
          </button>

          <button
            onClick={handleRunQuery}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-md shadow-cyan-950 transition-colors cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Executing...' : 'Run Query (⌘↵)'}</span>
          </button>
        </div>
      </div>

      {/* Editor & Table Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SQL Code Editor (8 cols) */}
        <div className="lg:col-span-8 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#090E1A] border-b border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300">query_workbench.sql</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer ml-1"
                title="Clear editor"
              >
                Clear
              </button>
            </div>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={7}
            className="w-full p-4 bg-[#070B14] font-mono text-xs sm:text-sm text-cyan-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed"
            placeholder="Write SQL statements (e.g. SELECT * FROM table_name LIMIT 10;)"
          />

          <div className="px-4 py-2 bg-[#090E1A] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              {executionResult.hasExecuted ? (
                executionResult.success ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    200 OK · {executionResult.durationMs}ms · {executionResult.rowCount} rows
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Error in query
                  </span>
                )
              ) : (
                <span className="text-slate-500">Ready to execute</span>
              )}
            </div>

            <button
              onClick={handleRunQuery}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Execute →
            </button>
          </div>
        </div>

        {/* Real Schema Reference Catalog (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Available Tables ({datasets.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {datasets.map(ds => {
                const tblName = normalizeTableName(ds.name);
                return (
                  <div key={ds.id} className="p-2.5 bg-[#090E1A] rounded-lg border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono font-semibold text-cyan-300">
                      <span className="truncate">{tblName}</span>
                      <button
                        onClick={() => setQuery(`SELECT * FROM ${tblName} LIMIT 10;`)}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Query
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {ds.schema.map(c => (
                        <span
                          key={c.name}
                          onClick={() => setQuery(prev => prev.includes(c.name) ? prev : `${prev.replace(/;?$/, '')} ${c.name};`)}
                          className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 hover:text-cyan-300 rounded cursor-pointer"
                          title={`Click to add ${c.name} (${c.type})`}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Click a table</span> to auto-insert a query template.
          </div>
        </div>
      </div>

      {/* Query History Drawer / Dropdown if toggled */}
      {showHistory && (
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-100">Query Execution History</h3>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          {queryHistory.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No query history yet. Executed queries will be cataloged here with their execution durations.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queryHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => setQuery(item.query)}
                  className="p-2.5 rounded bg-[#090E1A] hover:bg-slate-800/70 border border-slate-800 flex items-center justify-between text-xs cursor-pointer font-mono"
                >
                  <div className="truncate mr-3 text-cyan-300">
                    {item.query.replace(/\n/g, ' ')}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                    <span className={item.status === '200 OK' ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.status}
                    </span>
                    <span>{item.durationMs}ms</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Execution Results Viewport */}
      {executionResult.hasExecuted && (
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090E1A]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-100">
                Execution Output {executionResult.tableName ? `· ${executionResult.tableName}` : ''}
              </h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                ({executionResult.rowCount} records returned)
              </span>
            </div>

            {executionResult.success && executionResult.rows.length > 0 && (
              <button
                onClick={handleExportResults}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          {!executionResult.success ? (
            <div className="p-6 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-sm mb-1">Query Failed</span>
                <p className="font-mono">{executionResult.errorMessage}</p>
              </div>
            </div>
          ) : executionResult.rows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Query completed with 0 matching rows.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    {executionResult.columns.map(key => (
                      <th key={key} className="px-4 py-3 whitespace-nowrap text-cyan-300">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {executionResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      {executionResult.columns.map((cName, cIdx) => {
                        const val = row[cName];
                        return (
                          <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap tabular-nums text-slate-200">
                            {val !== null && val !== undefined ? String(val) : <span className="text-slate-600">NULL</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
