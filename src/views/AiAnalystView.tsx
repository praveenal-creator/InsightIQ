
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  Database,
  Bot,
  Copy,
  Check,
  Code2,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Download
} from 'lucide-react';

import { Dataset, NavigationId, Analysis } from '../types';
import { exportAiMessageToCsv, exportToCsv } from '../utils/exportCsv';
import { normalizeTableName } from '../utils/sqlEngine';
import { EmptyState } from '../components/common/EmptyState';

interface AiAnalystViewProps {
  datasets: Dataset[];
  onNavigate: (view: NavigationId) => void;
  onRunQueryInPlayground: (sql: string) => void;
  onNotify?: (title: string, desc: string, type: 'success' | 'info' | 'error') => void;
  onSaveAnalysis?: (newAnalysis: Analysis) => void;
  onOpenUploadModal?: () => void;
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

export const AiAnalystView: React.FC<AiAnalystViewProps> = (props) => {
  if (!props.datasets || props.datasets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            InsightIQ AI Analyst
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyze your datasets and prepare SQL queries.
          </p>
        </div>

        <EmptyState
          icon={Sparkles}
          title="Upload a dataset to get started"
          description="Connect a CSV or JSON dataset to inspect its schema, prepare SQL queries, and explore your data."
          actionLabel="Upload Dataset"
          onAction={() => props.onOpenUploadModal?.()}
        />
      </div>
    );
  }

  return <AnalystWorkspace {...props} />;
};

const AnalystWorkspace: React.FC<AiAnalystViewProps> = ({
  datasets,
  onNavigate,
  onRunQueryInPlayground,
  onNotify
}) => {
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasets[0].id);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDataset =
    datasets.find(d => d.id === selectedDatasetId) || datasets[0];

  const targetTable = normalizeTableName(selectedDataset.name);

  const cols = selectedDataset.schema.map(s => s.name);

  const numericCols = selectedDataset.schema
    .filter(s =>
      ['INTEGER', 'DECIMAL', 'FLOAT', 'NUMERIC', 'NUMBER'].includes(
        s.type.toUpperCase()
      )
    )
    .map(s => s.name);

  const categoryCols = selectedDataset.schema
    .filter(s =>
      ['VARCHAR', 'BOOLEAN', 'TEXT', 'STRING'].includes(s.type.toUpperCase())
    )
    .map(s => s.name);

  const dynamicPrompts = useMemo(() => {
    const prompts: string[] = [];

    if (numericCols.length > 0 && categoryCols.length > 0) {
      prompts.push(
        `Calculate average ${numericCols[0]} grouped by ${categoryCols[0]}`
      );
      prompts.push(
        `Find the top 5 records with highest ${numericCols[0]}`
      );
    } else if (cols.length > 1) {
      prompts.push(`Analyze ${cols[0]} and ${cols[1]}`);
    }

    prompts.push(`Show the first 10 records from ${targetTable}`);
    prompts.push(`Check missing values in ${selectedDataset.name}`);

    return prompts;
  }, [selectedDataset, numericCols, categoryCols, cols, targetTable]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      datasetContext: selectedDataset.name,
      text: `Your dataset "${selectedDataset.name}" is selected. I can help prepare SQL queries using its available columns.`,
      recommendation: 'Choose a suggested query or enter your own request to prepare a SQL starting point.'
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const generateSqlTemplate = (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();

    const numericColumn = numericCols[0];
    const categoryColumn = categoryCols[0];

    if (
      lowerPrompt.includes('missing') ||
      lowerPrompt.includes('null')
    ) {
      const checks = cols
        .map(col =>
          `SUM(CASE WHEN "${col}" IS NULL THEN 1 ELSE 0 END) AS "${col}_missing"`
        )
        .join(',\n  ');

      return `SELECT\n  ${checks}\nFROM "${targetTable}";`;
    }

    if (
      lowerPrompt.includes('average') &&
      numericColumn &&
      categoryColumn
    ) {
      return `SELECT\n  "${categoryColumn}",\n  AVG("${numericColumn}") AS average_value\nFROM "${targetTable}"\nGROUP BY "${categoryColumn}"\nORDER BY average_value DESC;`;
    }

    if (
      lowerPrompt.includes('highest') ||
      lowerPrompt.includes('top')
    ) {
      const column = numericColumn || cols[0];

      return `SELECT *\nFROM "${targetTable}"\nORDER BY "${column}" DESC\nLIMIT 5;`;
    }

    if (
      lowerPrompt.includes('count') ||
      lowerPrompt.includes('total')
    ) {
      return `SELECT COUNT(*) AS total_records\nFROM "${targetTable}";`;
    }

    const selectedColumns = cols.length > 0
      ? cols.slice(0, 8).map(col => `"${col}"`).join(', ')
      : '*';

    return `SELECT ${selectedColumns}\nFROM "${targetTable}"\nLIMIT 10;`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend ?? inputPrompt).trim();

    if (!query || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: query,
      datasetContext: selectedDataset.name
    };

    setMessages(prev => [...prev, userMessage]);
    setInputPrompt('');

    const sql = generateSqlTemplate(query);

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString(),
      datasetContext: selectedDataset.name,
      text: `I prepared a SQL starting point for your request about "${selectedDataset.name}". This query has not been executed, and no AI-generated findings or statistical conclusions have been produced yet.`,
      sqlSnippet: sql,
      recommendation: 'Review the SQL query and run it in SQL Playground to retrieve actual results.'
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onNotify?.('Copy Failed', 'Unable to access clipboard.', 'error');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        datasetContext: selectedDataset.name,
        text: `Conversation cleared. The selected dataset is ${selectedDataset.name}.`,
        recommendation: 'Choose a suggested query or enter a request.'
      }
    ]);
  };

  const handleExportMessageCsv = (msg: Message) => {
    const filename = `analysis_${Date.now()}.csv`;
    const ok = exportAiMessageToCsv(msg, filename);

    if (ok) {
      onNotify?.(
        'Export Completed',
        `Exported the result as ${filename}.`,
        'success'
      );
    }
  };

  const handleExportAllAnalysesCsv = () => {
    const assistantMessages = messages.filter(m => m.sender === 'assistant');

    if (assistantMessages.length === 0) {
      onNotify?.('Export Notice', 'No results available to export.', 'info');
      return;
    }

    const rows = assistantMessages.map((message, index) => ({
      'Result #': index + 1,
      Timestamp: message.timestamp,
      'Dataset Context': message.datasetContext || '',
      'Message': message.text,
      'SQL Query': message.sqlSnippet || '',
      'Recommendation': message.recommendation || ''
    }));

    const filename = `insightiq_results_${Date.now()}.csv`;
    const ok = exportToCsv(rows, filename);

    if (ok) {
      onNotify?.(
        'Export Completed',
        `Exported ${assistantMessages.length} messages.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D1424] border border-slate-800/80 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-[#0D1424]" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              InsightIQ AI Analyst
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Dataset-aware SQL assistance and query preparation.
            </p>
          </div>
        </div>

        {/* Dataset Selector */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#090E1A] border border-slate-800 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Dataset:</span>

            <select
              value={selectedDatasetId}
              onChange={e => setSelectedDatasetId(e.target.value)}
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
            type="button"
            onClick={handleExportAllAnalysesCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#090E1A] hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Export conversation"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat */}
      <div className="bg-[#0D1424] border border-slate-800/80 rounded-xl flex flex-col h-[560px] overflow-hidden shadow-sm">

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3.5 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 space-y-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600/20 text-slate-100 border border-blue-500/30'
                    : 'bg-[#090E1A] text-slate-200 border border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">
                    {message.sender === 'user' ? 'You' : 'InsightIQ Assistant'}
                  </span>

                  <div className="flex items-center gap-2">
                    {message.datasetContext && (
                      <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-[10px] text-cyan-400 font-mono">
                        {message.datasetContext}
                      </span>
                    )}
                    <span>{message.timestamp}</span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {message.text}
                </div>

                {/* SQL */}
                {message.sqlSnippet && (
                  <div className="mt-2 rounded-lg bg-[#060912] border border-slate-800 overflow-hidden text-xs">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#090D1A] border-b border-slate-800 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-mono">query.sql</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(message.id, message.sqlSnippet!)}
                          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onRunQueryInPlayground(message.sqlSnippet!)}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer ml-1"
                        >
                          Open in SQL
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <pre className="p-3 font-mono text-cyan-200 overflow-x-auto text-[11px] leading-relaxed">
                      {message.sqlSnippet}
                    </pre>
                  </div>
                )}

                {/* Recommendation */}
                {message.recommendation && (
                  <div className="flex items-start gap-2 p-2.5 bg-cyan-950/20 border border-cyan-900/40 rounded-lg text-xs text-slate-300">
                    <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-cyan-300">
                        Next Step:{' '}
                      </span>
                      {message.recommendation}
                    </div>
                  </div>
                )}

                {/* Export */}
                {message.sender === 'assistant' && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleExportMessageCsv(message)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-md transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>
                )}
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                  U
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#090E1A] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400">
                Preparing query...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries */}
        <div className="p-3 bg-[#080D1A] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 px-1">
            Suggestions:
          </span>

          {dynamicPrompts.map((prompt, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-2.5 py-1 rounded-md bg-[#0D1424] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/60 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3.5 bg-[#090E1A] border-t border-slate-800">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder={`Ask about ${selectedDataset.name}...`}
              className="flex-1 bg-[#0D1424] border border-slate-700/80 rounded-lg px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || isTyping}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Prepare Query</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
