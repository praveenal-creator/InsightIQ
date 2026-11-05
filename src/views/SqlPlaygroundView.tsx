import React, { useState } from 'react';
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
  Sparkles,
  Layers
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';

interface SqlPlaygroundViewProps {
  datasets: Dataset[];
  initialQuery?: string;
  onNavigate: (view: NavigationId) => void;
  onNotify: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

export const SqlPlaygroundView: React.FC<SqlPlaygroundViewProps> = ({
  datasets,
  initialQuery,
  onNotify
}) => {
  const [query, setQuery] = useState(
    initialQuery ||
      `SELECT customer_id, tier, monthly_arr, active_seats, churn_risk_score\nFROM ds_saas_cohorts\nWHERE monthly_arr >= 4000\nORDER BY monthly_arr DESC\nLIMIT 10;`
  );

  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionStats, setExecutionStats] = useState({
    timeMs: 14,
    rowCount: 5,
    status: '200 OK'
  });

  // Active query results (synthesized from active dataset records)
  const [queryResults, setQueryResults] = useState<Record<string, any>[]>([
    { customer_id: 'CUST-8805', tier: 'Enterprise Plus', monthly_arr: 22000, active_seats: 320, churn_risk_score: 0.15 },
    { customer_id: 'CUST-8801', tier: 'Enterprise Plus', monthly_arr: 14500, active_seats: 184, churn_risk_score: 0.12 },
    { customer_id: 'CUST-8807', tier: 'Enterprise', monthly_arr: 11500, active_seats: 140, churn_risk_score: 0.19 },
    { customer_id: 'CUST-8803', tier: 'Enterprise', monthly_arr: 9800, active_seats: 110, churn_risk_score: 0.08 },
    { customer_id: 'CUST-8802', tier: 'Professional', monthly_arr: 4200, active_seats: 45, churn_risk_score: 0.48 }
  ]);

  const presetQueries = [
    {
      label: 'High-Value Accounts',
      sql: `SELECT customer_id, tier, monthly_arr, active_seats, churn_risk_score\nFROM ds_saas_cohorts\nWHERE monthly_arr >= 4000\nORDER BY monthly_arr DESC\nLIMIT 10;`
    },
    {
      label: 'Churn Risk Audit',
      sql: `SELECT customer_id, tier, login_frequency_weekly, support_tickets_30d, churn_risk_score\nFROM ds_saas_cohorts\nWHERE churn_risk_score > 0.40\nORDER BY churn_risk_score DESC;`
    },
    {
      label: 'Regional Aggregates',
      sql: `SELECT region, COUNT(customer_id) AS total_customers, SUM(monthly_arr) AS total_arr\nFROM ds_saas_cohorts\nGROUP BY region\nORDER BY total_arr DESC;`
    }
  ];

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const simulatedLatency = Math.floor(Math.random() * 15) + 10;
      setExecutionStats({
        timeMs: simulatedLatency,
        rowCount: queryResults.length,
        status: '200 OK'
      });
      onNotify('SQL Executed', `Query returned ${queryResults.length} records in ${simulatedLatency}ms.`, 'success');
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportResults = () => {
    if (queryResults.length === 0) return;
    const headers = Object.keys(queryResults[0]).join(',');
    const rows = queryResults.map(r => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            Query across partitioned tables with real-time tabular execution and sub-20ms latency.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* Preset Queries Strip */}
      <div className="flex items-center gap-2 p-3 bg-[#090F1E] border border-slate-800/80 rounded-xl overflow-x-auto text-xs">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] shrink-0">
          Preset Templates:
        </span>
        {presetQueries.map((pq, i) => (
          <button
            key={i}
            onClick={() => setQuery(pq.sql)}
            className="px-2.5 py-1 rounded bg-[#0D1424] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 whitespace-nowrap transition-colors cursor-pointer"
          >
            {pq.label}
          </button>
        ))}
      </div>

      {/* Editor & Schema Layout */}
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
            rows={8}
            className="w-full p-4 bg-[#070B14] font-mono text-xs sm:text-sm text-cyan-200 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 leading-relaxed"
            placeholder="Write standard SQL statements here..."
          />

          <div className="px-4 py-2 bg-[#090E1A] border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {executionStats.status}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="w-3 h-3 text-cyan-400" />
                {executionStats.timeMs}ms
              </span>
              <span>·</span>
              <span className="tabular-nums">{executionStats.rowCount} rows</span>
            </div>

            <button
              onClick={handleRunQuery}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Execute →
            </button>
          </div>
        </div>

        {/* Schema Reference Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Table Catalog
              </h3>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {datasets.map(ds => (
                <div key={ds.id} className="p-2.5 bg-[#090E1A] rounded-lg border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-mono font-semibold text-cyan-300">
                    <span className="truncate">{ds.name.toLowerCase().replace(/\s+/g, '_')}</span>
                    <span className="text-[10px] text-slate-500">{ds.format}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {ds.schema.slice(0, 4).map(c => (
                      <span key={c.name} className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {c.name}
                      </span>
                    ))}
                    {ds.schema.length > 4 && (
                      <span className="text-[10px] text-slate-500 font-mono">+{ds.schema.length - 4} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-slate-300">
            <span className="font-semibold text-cyan-300">Fast Tip:</span> Use `LIMIT 25` to constrain result payload size when executing heavy joins.
          </div>
        </div>
      </div>

      {/* Query Results Data Table */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090E1A]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-100">Execution Output</h3>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({queryResults.length} records returned)
            </span>
          </div>

          <button
            onClick={handleExportResults}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-[#070B16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                {queryResults.length > 0 &&
                  Object.keys(queryResults[0]).map(key => (
                    <th key={key} className="px-4 py-3 whitespace-nowrap text-cyan-300">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {queryResults.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap tabular-nums text-slate-200">
                      {typeof val === 'number' && val > 1000 ? `$${val.toLocaleString()}` : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
