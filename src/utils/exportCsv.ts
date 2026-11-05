import { Analysis } from '../types';

/**
 * Escapes and formats a single cell value for standard CSV compatibility (RFC 4180).
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // If the cell contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports an array of objects to a CSV file and triggers browser download.
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  filename: string,
  customHeaders?: { key: keyof T; label: string }[]
): boolean {
  if (!data || data.length === 0) {
    return false;
  }

  let headers: string[] = [];
  let keys: string[] = [];

  if (customHeaders && customHeaders.length > 0) {
    headers = customHeaders.map(h => escapeCsvCell(h.label));
    keys = customHeaders.map(h => String(h.key));
  } else {
    keys = Object.keys(data[0]);
    headers = keys.map(k => escapeCsvCell(k));
  }

  const rows = data.map(row =>
    keys.map(key => escapeCsvCell(row[key])).join(',')
  );

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Specialized exporter for AI Analysis results
 */
export function exportAnalysesToCsv(analyses: Analysis[], filename = 'insightiq_analyses_report.csv'): boolean {
  const formatted = analyses.map(item => ({
    'Analysis ID': item.id,
    'Title': item.title,
    'Category': item.category,
    'Dataset Name': item.datasetName,
    'Confidence (%)': item.confidence,
    'Key Metric': item.keyMetric,
    'Metric Change': item.metricChange,
    'Impact': item.isPositive ? 'Positive / Favorable' : 'Negative / Alert',
    'Executive Summary': item.summary,
    'Actionable Recommendation': item.actionableRecommendation,
    'Created At': item.createdAt
  }));

  return exportToCsv(formatted, filename);
}

/**
 * Specialized exporter for a conversational AI Analyst response
 */
export function exportAiMessageToCsv(
  msg: {
    id: string;
    text: string;
    datasetContext?: string;
    timestamp: string;
    metrics?: { label: string; value: string; isPositive?: boolean }[];
    recommendation?: string;
    sqlSnippet?: string;
  },
  filename = 'ai_analyst_finding.csv'
): boolean {
  // If there are structured metrics, export them in a comprehensive 2-part sheet or tabular rows
  const rows: Record<string, any>[] = [];

  // Summary row
  rows.push({
    'Record Type': 'Executive Finding',
    'Metric / Field': 'Core Analysis Narrative',
    'Value': msg.text.replace(/\*\*/g, ''),
    'Context': msg.datasetContext || 'Active Dataset',
    'Timestamp': msg.timestamp
  });

  if (msg.recommendation) {
    rows.push({
      'Record Type': 'Directive',
      'Metric / Field': 'Actionable Recommendation',
      'Value': msg.recommendation,
      'Context': msg.datasetContext || 'Active Dataset',
      'Timestamp': msg.timestamp
    });
  }

  if (msg.metrics && msg.metrics.length > 0) {
    msg.metrics.forEach(m => {
      rows.push({
        'Record Type': 'Quantitative Metric',
        'Metric / Field': m.label,
        'Value': m.value,
        'Context': m.isPositive ? 'Favorable' : 'Risk Factor',
        'Timestamp': msg.timestamp
      });
    });
  }

  if (msg.sqlSnippet) {
    rows.push({
      'Record Type': 'Executable SQL Query',
      'Metric / Field': 'synthesized_query.sql',
      'Value': msg.sqlSnippet,
      'Context': 'SQL Playground Ready',
      'Timestamp': msg.timestamp
    });
  }

  return exportToCsv(rows, filename);
}
