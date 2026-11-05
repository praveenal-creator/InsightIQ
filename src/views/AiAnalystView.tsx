import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Database, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Code2, 
  ArrowRight, 
  Lightbulb, 
  RotateCcw,
  TrendingDown,
  TrendingUp,
  FileText,
  Download
} from 'lucide-react';
import { Dataset, NavigationId } from '../types';
import { exportAiMessageToCsv, exportToCsv } from '../utils/exportCsv';

interface AiAnalystViewProps {
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onRunQueryInPlayground: (sql: string) => void;
  onNotify?: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  datasetContext?: string;
  sqlSnippet?: string;
  metrics?: { label: string; value: string; isPositive?: boolean }[];
  recommendation?: string;
}

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({
  datasets,
  onNavigate,
  onRunQueryInPlayground,
  onNotify
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0]?.id || '');
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: 'Just now',
      datasetContext: selectedDataset?.name,
      text: `Hello Dr. Rostova. I am your InsightIQ Data Copilot. I have indexed ${selectedDataset?.name || 'your active dataset'} (${selectedDataset?.rows.toLocaleString()} rows). I can synthesize multi-variable regressions, detect latent anomalies, generate analytical SQL queries, and construct predictive simulations.`,
      recommendation: 'Select one of the suggested prompts below or ask a natural language question about your metrics.'
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const suggestedPrompts = [
    'Why is churn risk concentrated in accounts with <10 logins weekly?',
    'Identify top 5 highest grossing customer segments by ARR',
    'Are there statistical correlations between support tickets and churn probability?',
    'Generate an optimal SQL query to isolate high-risk enterprise accounts'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: query,
      datasetContext: selectedDataset?.name
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    setTimeout(() => {
      let assistantResponse: Message;

      if (query.toLowerCase().includes('churn') || query.toLowerCase().includes('risk')) {
        assistantResponse = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          datasetContext: selectedDataset?.name,
          text: `Comprehensive survival analysis of ${selectedDataset?.name} demonstrates an inflection point at **Day 42**: accounts averaging under 12 weekly logins experience an **82.4% probability of non-renewal** within their 90-day window. Interestingly, support ticket volume acts as a lagging indicator rather than leading factor.`,
          metrics: [
            { label: 'Inflection Threshold', value: '< 12 logins/wk', isPositive: false },
            { label: 'Renewal Probability', value: '17.6%', isPositive: false },
            { label: 'Median Monthly ARR at Risk', value: '$18,400', isPositive: false }
          ],
          sqlSnippet: `SELECT customer_id, tier, monthly_arr, login_frequency_weekly, churn_risk_score\nFROM ds_saas_cohorts\nWHERE login_frequency_weekly < 12 AND churn_risk_score > 0.60\nORDER BY monthly_arr DESC\nLIMIT 15;`,
          recommendation: 'Automate a Slack webhook to Customer Success when an account’s 14-day rolling login velocity drops by more than 35%.'
        };
      } else if (query.toLowerCase().includes('sql') || query.toLowerCase().includes('query')) {
        assistantResponse = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          datasetContext: selectedDataset?.name,
          text: `Here is the optimized SQL query for ${selectedDataset?.name} with partitioned window aggregates and indexed filtration:`,
          sqlSnippet: `WITH cohort_summary AS (\n  SELECT \n    tier,\n    COUNT(customer_id) AS total_accounts,\n    ROUND(AVG(monthly_arr), 2) AS avg_arr,\n    ROUND(AVG(churn_risk_score), 3) AS avg_risk\n  FROM ds_saas_cohorts\n  GROUP BY tier\n)\nSELECT * FROM cohort_summary ORDER BY avg_arr DESC;`,
          recommendation: 'You can test this query directly in the SQL Playground with single-click runtime evaluation.'
        };
      } else {
        assistantResponse = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          datasetContext: selectedDataset?.name,
          text: `Analysis across ${selectedDataset?.rows.toLocaleString()} records reveals strong separation across cohorts. Enterprise tiers retain higher ARR elasticity, while Starter and Professional cohorts are sensitive to feature engagement frequency.`,
          metrics: [
            { label: 'Sample Volume', value: `${selectedDataset?.rows.toLocaleString()} rows`, isPositive: true },
            { label: 'Variance Explained', value: '88.4%', isPositive: true },
            { label: 'Hypothesis Confidence', value: '96.2%', isPositive: true }
          ],
          sqlSnippet: `SELECT region, tier, SUM(monthly_arr) AS total_revenue\nFROM ds_saas_cohorts\nGROUP BY region, tier\nORDER BY total_revenue DESC;`,
          recommendation: 'Consider building a multi-segment visualization or running a Random Forest classifier in the Predictive Lab.'
        };
      }

      setMessages(prev => [...prev, assistantResponse]);
      setIsTyping(false);
    }, 700);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        datasetContext: selectedDataset?.name,
        text: `Conversation cleared. I am ready to analyze ${selectedDataset?.name} or answer queries.`,
        recommendation: 'Ask a specific inquiry or explore one of the pre-set prompts.'
      }
    ]);
  };

  const handleExportMessageCsv = (msg: Message) => {
    const filename = `ai_analysis_${msg.datasetContext ? msg.datasetContext.toLowerCase().replace(/\s+/g, '_') : 'insight'}_${Date.now()}.csv`;
    const ok = exportAiMessageToCsv(msg, filename);
    if (ok && onNotify) {
      onNotify('Analysis Exported', `Analysis results exported as ${filename}`, 'success');
    }
  };

  const handleExportAllAnalysesCsv = () => {
    const assistantMessages = messages.filter(m => m.sender === 'assistant');
    if (assistantMessages.length === 0) {
      if (onNotify) onNotify('Export Notice', 'No analysis results to export.', 'info');
      return;
    }
    const rows = assistantMessages.map((m, idx) => ({
      'Result #': idx + 1,
      'Timestamp': m.timestamp,
      'Dataset Context': m.datasetContext || 'Active Dataset',
      'Analysis Finding': m.text.replace(/\*\*/g, ''),
      'Key Metric': m.metrics?.map(metric => `${metric.label}: ${metric.value}`).join(' | ') || 'N/A',
      'Actionable Recommendation': m.recommendation || 'N/A',
      'Synthesized SQL': m.sqlSnippet ? m.sqlSnippet.replace(/\n/g, ' ') : 'N/A'
    }));
    const filename = `all_ai_analyst_results_${Date.now()}.csv`;
    const ok = exportToCsv(rows, filename);
    if (ok && onNotify) {
      onNotify('All Analyses Exported', `Exported ${assistantMessages.length} analysis findings to ${filename}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-[#0D1424]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              InsightIQ AI Analyst
              <span className="text-[11px] font-mono px-2 py-0.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                Autonomous Copilot
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Natural language data analysis, automated hypothesis testing, and instant SQL synthesis.
            </p>
          </div>
        </div>

        {/* Dataset Context Picker */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Target Dataset:</span>
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none cursor-pointer"
            >
              {datasets.map(d => (
                <option key={d.id} value={d.id} className="bg-[#0D1424] text-slate-200">
                  {d.name} ({d.rows.toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportAllAnalysesCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Export all generated analysis findings to a CSV file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export Results (CSV)</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl flex flex-col h-[560px] overflow-hidden shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/20 text-slate-100 border border-blue-500/30'
                    : 'bg-[#090E1A] text-slate-200 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {msg.sender === 'user' ? 'Dr. Elena Rostova' : 'InsightIQ Data Copilot'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.datasetContext && (
                      <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-[10px] text-cyan-400 font-mono">
                        {msg.datasetContext}
                      </span>
                    )}
                    <span className="tabular-nums">{msg.timestamp}</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Metrics Callout */}
                {msg.metrics && msg.metrics.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {msg.metrics.map((m, i) => (
                      <div key={i} className="p-2.5 bg-[#0D1424] border border-slate-800 rounded-lg">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          {m.label}
                        </span>
                        <span className={`text-xs font-mono font-semibold ${m.isPositive ? 'text-emerald-400' : 'text-cyan-300'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* SQL Snippet Block */}
                {msg.sqlSnippet && (
                  <div className="mt-2 rounded-lg bg-[#060912] border border-slate-800 overflow-hidden text-xs">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#090D1A] border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono">synthesized_query.sql</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.sqlSnippet!)}
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onRunQueryInPlayground(msg.sqlSnippet!)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer ml-1"
                        >
                          <span>Open in SQL</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 font-mono text-cyan-200 overflow-x-auto text-[11px] leading-relaxed">
                      {msg.sqlSnippet}
                    </pre>
                  </div>
                )}

                {/* Recommendation */}
                {msg.recommendation && (
                  <div className="flex items-start gap-2 p-2.5 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-slate-300">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-cyan-300">Actionable Next Step: </span>
                      {msg.recommendation}
                    </div>
                  </div>
                )}

                {/* Assistant Action Bar */}
                {msg.sender === 'assistant' && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Analytical Finding
                    </span>
                    <button
                      type="button"
                      onClick={() => handleExportMessageCsv(msg)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-md transition-colors cursor-pointer"
                      title="Download this specific analysis result as a CSV file"
                    >
                      <Download className="w-3 h-3 text-cyan-400" />
                      <span>Export Result (CSV)</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                  ER
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#090E1A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>InsightIQ is querying table schema & synthesizing statistical summary...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts strip */}
        <div className="p-3 bg-[#080D1A] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 px-1">
            Suggested Queries:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="text-xs px-2.5 py-1 rounded-md bg-[#0D1424] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/60 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-[#090E1A] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask a question about ${selectedDataset?.name || 'this dataset'} or request hypothesis verification...`}
              className="flex-1 bg-[#0D1424] border border-slate-700/80 rounded-lg px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isTyping}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Analyze</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
