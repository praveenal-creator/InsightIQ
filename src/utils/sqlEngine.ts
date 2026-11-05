import { Dataset } from '../types';

export interface SqlExecutionResult {
  success: boolean;
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  durationMs: number;
  errorMessage?: string;
  tableName?: string;
}

/**
 * Normalizes table names for SQL matching.
 * e.g., "SaaS Customer Cohorts 2026" -> "saas_customer_cohorts_2026"
 */
export function normalizeTableName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/**
 * In-memory SQL execution engine that queries real dataset records.
 */
export function executeSqlOnDatasets(
  query: string,
  datasets: Dataset[]
): SqlExecutionResult {
  const startTime = performance.now();
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      durationMs: 0,
      errorMessage: 'SQL query statement is empty.'
    };
  }

  // Parse FROM clause
  const fromMatch = trimmed.match(/FROM\s+([a-zA-Z0-9_\-\.]+)/i);
  if (!fromMatch) {
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      durationMs: 0,
      errorMessage: 'Syntax Error: Missing FROM clause. Example: SELECT * FROM <table_name>;'
    };
  }

  const requestedTable = fromMatch[1].toLowerCase().replace(/[^a-z0-9_]/g, '');

  // Locate the target dataset
  const targetDataset = datasets.find(d => {
    const idNorm = normalizeTableName(d.id);
    const nameNorm = normalizeTableName(d.name);
    return idNorm === requestedTable || nameNorm === requestedTable || idNorm.includes(requestedTable) || requestedTable.includes(nameNorm);
  });

  if (!targetDataset) {
    const availableTables = datasets.map(d => normalizeTableName(d.name)).join(', ');
    return {
      success: false,
      columns: [],
      rows: [],
      rowCount: 0,
      durationMs: Math.round(performance.now() - startTime),
      errorMessage: `Table '${fromMatch[1]}' not found. Available tables in workspace: [${availableTables || 'No datasets uploaded'}]`
    };
  }

  let rows = [...targetDataset.sampleData];
  if (rows.length === 0) {
    return {
      success: true,
      columns: targetDataset.schema.map(s => s.name),
      rows: [],
      rowCount: 0,
      durationMs: Math.max(1, Math.round(performance.now() - startTime)),
      tableName: targetDataset.name
    };
  }

  // Parse WHERE clause if present
  const whereMatch = trimmed.match(/WHERE\s+([^ORDER|GROUP|LIMIT|;]+)/i);
  if (whereMatch) {
    const condition = whereMatch[1].trim();
    // Support basic numeric or equality condition e.g. "col >= 4000", "col = 'value'"
    const opMatch = condition.match(/([a-zA-Z0-9_]+)\s*(>=|<=|>|<|!=|=|==)\s*(['"]?)(.*?)\3(?:\s+|$)/);
    if (opMatch) {
      const colName = opMatch[1];
      const op = opMatch[2];
      const valStr = opMatch[4];
      const valNum = Number(valStr);
      const isNum = !isNaN(valNum) && valStr.trim() !== '';

      rows = rows.filter(r => {
        const cell = r[colName];
        if (cell === undefined || cell === null) return false;

        if (isNum && typeof cell === 'number') {
          if (op === '>=') return cell >= valNum;
          if (op === '<=') return cell <= valNum;
          if (op === '>') return cell > valNum;
          if (op === '<') return cell < valNum;
          if (op === '=' || op === '==') return cell === valNum;
          if (op === '!=') return cell !== valNum;
        }

        const cellStr = String(cell).toLowerCase();
        const targetStr = valStr.toLowerCase();
        if (op === '=' || op === '==') return cellStr === targetStr;
        if (op === '!=') return cellStr !== targetStr;
        return true;
      });
    }
  }

  // Parse ORDER BY
  const orderMatch = trimmed.match(/ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch) {
    const orderCol = orderMatch[1];
    const direction = (orderMatch[2] || 'ASC').toUpperCase();
    rows.sort((a, b) => {
      const valA = a[orderCol];
      const valB = b[orderCol];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'ASC' ? valA - valB : valB - valA;
      }
      return direction === 'ASC'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // Parse LIMIT
  const limitMatch = trimmed.match(/LIMIT\s+(\d+)/i);
  if (limitMatch) {
    const limitNum = parseInt(limitMatch[1], 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      rows = rows.slice(0, limitNum);
    }
  }

  // Parse SELECT columns
  const selectMatch = trimmed.match(/SELECT\s+(.*?)\s+FROM/i);
  let columns: string[] = [];
  if (selectMatch) {
    const colsStr = selectMatch[1].trim();
    if (colsStr === '*') {
      columns = Object.keys(rows[0] || (targetDataset.schema.length > 0 ? targetDataset.schema.reduce((acc, s) => ({ ...acc, [s.name]: '' }), {}) : {}));
    } else {
      columns = colsStr.split(',').map(c => c.trim().replace(/^[`"']|[`"']$/g, '')).filter(Boolean);
    }
  } else {
    columns = Object.keys(rows[0] || {});
  }

  // Project only selected columns
  const projectedRows = rows.map(r => {
    const obj: Record<string, any> = {};
    columns.forEach(c => {
      obj[c] = r[c] !== undefined ? r[c] : null;
    });
    return obj;
  });

  const durationMs = Math.max(1, Math.round(performance.now() - startTime));

  return {
    success: true,
    columns,
    rows: projectedRows,
    rowCount: projectedRows.length,
    durationMs,
    tableName: targetDataset.name
  };
}
