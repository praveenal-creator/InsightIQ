
import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  Download,
  Copy,
  Check,
  Database,
  Code2,
  AlertCircle,
  History,
  Layers
} from 'lucide-react';

import { Dataset, NavigationId, SqlQueryRecord } from '../types';
import {
  executeSqlOnDatasets,
  normalizeTableName
} from '../utils/sqlEngine';
import { exportToCsv } from '../utils/exportCsv';
import { EmptyState } from '../components/common/EmptyState';

interface SqlPlaygroundViewProps {
  datasets: Dataset[];
  initialQuery?: string;
  onNavigate: (view: NavigationId) => void;
  onNotify: (
    title: string,
    desc: string,
    type: 'success' | 'info' | 'error'
  ) => void;
  queryHistory: SqlQueryRecord[];
  onLogQuery: (record: SqlQueryRecord) => void;
  onOpenUploadModal?: () => void;
}

export const SqlPlaygroundView: React.FC<SqlPlaygroundViewProps> = ({
  datasets,
  initialQuery,
  onNavigate,
  onNotify,
  queryHistory,
  onLogQuery,
  onOpenUploadModal
}) => {
  const firstTableName = datasets[0]
    ? normalizeTableName(datasets[0].name)
    : 'my_dataset';

  const defaultQuery = initialQuery || (
    datasets.length > 0
      ? `SELECT * FROM ${firstTableName} LIMIT 10;`
      : ''
  );

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
    if (!query.trim()) {
      onNotify('Query Required', 'Enter a SQL query before executing.', 'info');
      return;
    }

    if (isRunning) return;

    setIsRunning(true);

    try {
      // Executes against the datasets currently loaded in the frontend.
      const result = executeSqlOnDatasets(query, datasets);

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
        onNotify(
          'SQL Executed',
          `Returned ${result.rowCount} records in ${result.durationMs}ms using the local query engine.`,
          'success'
        );
      } else {
        onNotify(
          'SQL Execution Error',
          result.errorMessage || 'The query could not be executed.',
          'error'
        );
      }
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'An unexpected error occurred while executing the query.';

      setExecutionResult({
        hasExecuted: true,
        success: false,
        columns: [],
        rows: [],
        rowCount: 0,
        durationMs: 0,
        errorMessage: message
      });

      onNotify('SQL Execution Error', message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify(
        'Copy Failed',
        'Clipboard access is unavailable in this browser.',
        'error'
      );
    }
  };

  const handleExportResults = () => {
    if (executionResult.rows.length === 0) {
      onNotify('Export Notice', 'There are no query records to export.', 'info');
      return;
    }

    const filename = `sql_result_${Date.now()}.csv`;
    const ok = exportToCsv(executionResult.rows, filename);

    if (ok) {
      onNotify(
        'Export Succeeded',
        `Exported ${executionResult.rows.length} rows to ${filename}.`,
        'success'
      );
    }
  };

  if (!datasets || datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            SQL Playground
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Run SQL queries against datasets loaded into your workspace.
          </p>
        </div>

        <EmptyState
          icon={Terminal}
          title="No tables available to query"
          description="Upload a CSV or JSON dataset to start writing SQL queries against its available records."
          actionLabel="Upload Dataset"
          onAction={onOpenUploadModal}
        />

        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
          <Database className="w-5 h-5 text-cyan-400 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Local SQL execution
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              The current SQL engine executes queries against datasets
              loaded in the frontend. It is not connected to a remote
              database server.
            </p>
          </div>
        </div>
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
              SQL Playground
            </h1>

            <span className="text-xs px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded font-mono">
              Local SQL Engine
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Query across{' '}
            <span className="text-slate-200 font-medium">
              {datasets.length} loaded datasets
            </span>
            {' '}using the frontend SQL engine.
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
            History ({queryHistory.length})
          </button>

          <button
            onClick={handleRunQuery}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing...' : 'Run Query'}
          </button>

        </div>
      </div>

      {/* Editor and Table Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* SQL Editor */}
        <div className="lg:col-span-8 bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col shadow-sm">

          <div className="flex items-center justify-between px-4 py-2.5 bg-[#090E1A] border-b border-slate-800 text-xs text-slate-400">

            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300">
                query_workbench.sql
              </span>
            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5" />
                }

                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Clear editor"
              >
                Clear
              </button>

            </div>
          </div>

          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            rows={9}
            spellCheck={false}
            className="w-full p-4 bg-[#070B14] font-mono text-xs sm:text-sm text-cyan-200 resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed"
            placeholder="Write SQL statements (e.g. SELECT * FROM table_name LIMIT 10;)"
          />

          <div className="px-4 py-2 bg-[#090E1A] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">

            <div>
              {executionResult.hasExecuted ? (
                executionResult.success ? (
                  <span className="text-emerald-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    Success · {executionResult.durationMs}ms · {executionResult.rowCount} rows
                  </span>
                ) : (
                  <span className="text-rose-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
                    Query failed
                  </span>
                )
              ) : (
                <span className="text-slate-500">
                  Ready to execute
                </span>
              )}
            </div>

            <button
              onClick={handleRunQuery}
              disabled={isRunning}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer disabled:opacity-50"
            >
              Execute →
            </button>

          </div>
        </div>

        {/* Available Tables */}
        <div className="lg:col-span-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 flex flex-col space-y-4">

          <div className="space-y-3">

            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />

              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Available Tables ({datasets.length})
              </h3>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">

              {datasets.map(dataset => {
                const tableName = normalizeTableName(dataset.name);

                return (
                  <div
                    key={dataset.id}
                    className="p-2.5 bg-[#090E1A] rounded-lg border border-slate-800 text-xs"
                  >

                    <div className="flex items-center justify-between font-mono font-semibold text-cyan-300">

                      <span className="truncate">
                        {tableName}
                      </span>

                      <button
                        onClick={() => setQuery(
                          `SELECT * FROM ${tableName} LIMIT 10;`
                        )}
                        className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                      >
                        Query
                      </button>

                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">

                      {dataset.schema.map(column => (
                        <button
                          key={column.name}
                          type="button"
                          onClick={() => setQuery(previous =>
                            previous.includes(column.name)
                              ? previous
                              : `${previous.replace(/;?$/, '')} ${column.name};`
                          )}
                          className="text-[10px] font-mono px-1.5 py-1 bg-slate-800 text-slate-300 hover:text-cyan-300 rounded cursor-pointer"
                          title={`Add ${column.name} (${column.type})`}
                        >
                          {column.name}
                        </button>
                      ))}

                    </div>

                    <p className="text-[10px] text-slate-500 mt-2">
                      {dataset.rows.toLocaleString()} records · {dataset.schema.length} columns
                    </p>

                  </div>
                );
              })}

            </div>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">
              Table shortcuts:
            </span>
            {' '}Select a table or column to insert it into your query.
          </div>

        </div>
      </div>

      {/* Query History */}
      {showHistory && (
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 space-y-3">

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">

            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />

              <h3 className="text-xs font-semibold text-slate-100">
                Query Execution History
              </h3>
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
              No query history yet. Executed queries will appear here.
            </div>

          ) : (

            <div className="space-y-2 max-h-56 overflow-y-auto">

              {queryHistory.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQuery(item.query)}
                  className="w-full text-left p-3 rounded bg-[#090E1A] hover:bg-slate-800/70 border border-slate-800 flex items-center justify-between gap-3 text-xs cursor-pointer font-mono"
                >

                  <span className="truncate text-cyan-300">
                    {item.query.replace(/\n/g, ' ')}
                  </span>

                  <span className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">

                    <span className={
                      item.status === '200 OK'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }>
                      {item.status}
                    </span>

                    <span>{item.durationMs}ms</span>
                    <span>{item.timestamp}</span>

                  </span>

                </button>
              ))}

            </div>

          )}

        </div>
      )}

      {/* Execution Results */}
      {executionResult.hasExecuted && (
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-800 bg-[#090E1A]">

            <div className="flex items-center gap-2 flex-wrap">

              <Database className="w-4 h-4 text-cyan-400" />

              <h3 className="text-xs font-semibold text-slate-100">
                Query Results
                {executionResult.tableName
                  ? ` · ${executionResult.tableName}`
                  : ''
                }
              </h3>

              <span className="text-xs text-slate-400 font-mono">
                ({executionResult.rowCount} records)
              </span>

            </div>

            {executionResult.success && executionResult.rows.length > 0 && (
              <button
                onClick={handleExportResults}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                Export CSV
              </button>
            )}

          </div>

          {!executionResult.success ? (

            <div className="p-6 bg-rose-950/20 text-xs text-rose-300 flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />

              <div>
                <span className="font-semibold block text-sm mb-1">
                  Query Failed
                </span>

                <p className="font-mono break-words">
                  {executionResult.errorMessage}
                </p>
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
                    {executionResult.columns.map(column => (
                      <th
                        key={column}
                        className="px-4 py-3 whitespace-nowrap text-cyan-300"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800/50">

                  {executionResult.rows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-800/30">

                      {executionResult.columns.map((column, columnIndex) => {
                        const value = row[column];

                        return (
                          <td
                            key={columnIndex}
                            className="px-4 py-2.5 whitespace-nowrap tabular-nums text-slate-200"
                          >
                            {value !== null && value !== undefined
                              ? String(value)
                              : <span className="text-slate-600">NULL</span>
                            }
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

      {/* Backend status */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-4">

        <div className="flex items-start gap-3">

          <Database className="w-5 h-5 text-cyan-400 shrink-0" />

          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              SQL execution architecture
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Queries currently run against datasets loaded in the
              frontend using the local SQL engine. A server-side database
              connection and persistent SQL execution are not yet
              integrated.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
