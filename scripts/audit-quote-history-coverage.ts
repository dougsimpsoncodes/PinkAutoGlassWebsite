#!/usr/bin/env -S npx tsx
/**
 * Read-only coverage audit for historical quote-engine tuning data.
 *
 * This intentionally prints aggregate coverage only: no customer names,
 * phones, emails, addresses, or raw invoice payloads.
 *
 * Usage:
 *   npx tsx scripts/audit-quote-history-coverage.ts
 *   npx tsx scripts/audit-quote-history-coverage.ts --months=24 --limit=5000 --json=tmp/quote-history-coverage.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

interface TableCoverage {
  table: string;
  totalRows: number;
  likelyWindshieldRows: number;
  likelyReplacementRows: number;
  coverage: Record<string, CoverageCounter>;
  topMakes: Array<{ make: string; count: number }>;
  recentRange: { min: string | null; max: string | null };
  sampleVehicles: string[];
  notes: string[];
}

interface CoverageCounter {
  count: number;
  pct: number;
}

type DbRow = Record<string, unknown>;

const ROOT = path.resolve(__dirname, '..');
loadEnv(path.join(ROOT, '.env.local'));
loadEnv(path.join(ROOT, '.env.local.service'));

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

const months = parsePositiveInt(argValue('months'), 24);
const limit = parsePositiveInt(argValue('limit'), 5000);
const jsonOutputPath = argValue('json');

function loadEnv(envPath: string) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value.replace(/\\n$/, '');
  }
}

async function main() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('POSTGRES_URL not found in .env.local or .env.local.service.');
  }

  const client = await connect(connectionString);
  try {
    const report = {
      generated_at: new Date().toISOString(),
      lookback_months: months,
      row_limit_per_table: limit,
      tables: [
        await auditOmegaInstalls(client),
        await auditOmegaQuotes(client),
      ],
    };

    printMarkdown(report);

    if (jsonOutputPath) {
      const outputPath = path.resolve(ROOT, jsonOutputPath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`\nWrote JSON: ${outputPath}`);
    }
  } finally {
    await client.end();
  }
}

async function connect(connectionString: string): Promise<Client> {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    await client.end().catch(() => undefined);
    const message = error instanceof Error ? error.message : String(error);
    if (!/self-signed|certificate/i.test(message)) throw error;

    if (process.env.QUOTE_HISTORY_ALLOW_INSECURE_DB_SSL !== 'true') {
      throw new Error(`${message} Set NODE_EXTRA_CA_CERTS to a trusted CA bundle, or set QUOTE_HISTORY_ALLOW_INSECURE_DB_SSL=true for a local read-only audit.`);
    }

    console.warn('[history-audit] TLS certificate chain was not trusted locally; retrying with certificate verification disabled because QUOTE_HISTORY_ALLOW_INSECURE_DB_SSL=true.');
    const fallback = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }, // nosemgrep: problem-based-packs.insecure-transport.js-node.bypass-tls-verification.bypass-tls-verification
      connectionTimeoutMillis: 5000,
    });
    await fallback.connect();
    return fallback;
  }
}

async function auditOmegaInstalls(client: Client): Promise<TableCoverage> {
  const columns = await tableColumns(client, 'omega_installs');
  if (columns.length === 0) return emptyCoverage('omega_installs', 'Table not found.');

  const selectedColumns = pickColumns(columns, [
    'install_date',
    'invoice_number',
    'job_type',
    'vehicle_year',
    'vehicle_make',
    'vehicle_model',
    'vin',
    'parts_cost',
    'labor_cost',
    'tax_amount',
    'total_revenue',
    'payment_method',
    'status',
    'matched_quote_id',
    'matched_lead_id',
    'raw_data',
  ]);

  const dateColumn = columns.includes('install_date') ? 'install_date' : columns.includes('created_at') ? 'created_at' : null;
  const rows = await fetchRows(client, 'omega_installs', selectedColumns, dateColumn);
  return buildCoverage('omega_installs', rows, 'install_date');
}

async function auditOmegaQuotes(client: Client): Promise<TableCoverage> {
  const columns = await tableColumns(client, 'omega_quotes');
  if (columns.length === 0) return emptyCoverage('omega_quotes', 'Table not found.');

  const selectedColumns = pickColumns(columns, [
    'quote_date',
    'quote_number',
    'vehicle_year',
    'vehicle_make',
    'vehicle_model',
    'vin',
    'quoted_amount',
    'tax_amount',
    'total_amount',
    'status',
    'matched_lead_id',
    'raw_data',
  ]);

  const dateColumn = columns.includes('quote_date') ? 'quote_date' : columns.includes('created_at') ? 'created_at' : null;
  const rows = await fetchRows(client, 'omega_quotes', selectedColumns, dateColumn);
  return buildCoverage('omega_quotes', rows, 'quote_date');
}

async function tableColumns(client: Client, tableName: string): Promise<string[]> {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tableName]
  );
  return result.rows.map(row => row.column_name);
}

async function fetchRows(
  client: Client,
  tableName: string,
  columns: string[],
  dateColumn: string | null
): Promise<DbRow[]> {
  if (columns.length === 0) return [];

  const orderBy = dateColumn ? `ORDER BY ${quoteIdent(dateColumn)} DESC NULLS LAST` : '';
  const where = dateColumn ? `WHERE ${quoteIdent(dateColumn)} >= NOW() - ($1::text || ' months')::interval` : '';
  const params = dateColumn ? [String(months), limit] : [limit];
  const limitParam = dateColumn ? '$2' : '$1';
  const sql = `
    SELECT ${columns.map(quoteIdent).join(', ')}
    FROM ${quoteIdent(tableName)}
    ${where}
    ${orderBy}
    LIMIT ${limitParam}
  `;

  const result = await client.query(sql, params);
  return result.rows;
}

function buildCoverage(table: string, rows: DbRow[], dateField: string): TableCoverage {
  const likelyWindshieldRows = rows.filter(isLikelyWindshieldRow);
  const likelyReplacementRows = rows.filter(isLikelyReplacementRow);
  const denominator = likelyWindshieldRows.length || rows.length;
  const coverageRows = likelyWindshieldRows.length ? likelyWindshieldRows : rows;

  const coverage = {
    vehicle_year: coverageFor(coverageRows, row => hasValue(row.vehicle_year)),
    vehicle_make: coverageFor(coverageRows, row => hasValue(row.vehicle_make)),
    vehicle_model: coverageFor(coverageRows, row => hasValue(row.vehicle_model)),
    year_make_model: coverageFor(coverageRows, row => hasValue(row.vehicle_year) && hasValue(row.vehicle_make) && hasValue(row.vehicle_model)),
    vin: coverageFor(coverageRows, row => isVin(row.vin)),
    invoice_or_quote_total: coverageFor(coverageRows, row => numericValue(row.total_revenue) > 0 || numericValue(row.total_amount) > 0),
    quoted_amount: coverageFor(coverageRows, row => numericValue(row.quoted_amount) > 0),
    parts_cost: coverageFor(coverageRows, row => numericValue(row.parts_cost) > 0 || rawHasKey(row.raw_data, /part.*cost|cost.*part/i)),
    labor_cost: coverageFor(coverageRows, row => numericValue(row.labor_cost) > 0 || rawHasKey(row.raw_data, /labor/i)),
    tax_amount: coverageFor(coverageRows, row => numericValue(row.tax_amount) > 0),
    part_number: coverageFor(coverageRows, row => hasPartNumber(row)),
    nags_like_part: coverageFor(coverageRows, row => hasNagsLikePart(row)),
    line_items: coverageFor(coverageRows, row => hasLineItems(row.raw_data)),
    calibration_signal: coverageFor(coverageRows, row => hasCalibrationSignal(row)),
    matched_lead: coverageFor(coverageRows, row => hasValue(row.matched_lead_id)),
    matched_quote: coverageFor(coverageRows, row => hasValue(row.matched_quote_id)),
  };

  return {
    table,
    totalRows: rows.length,
    likelyWindshieldRows: likelyWindshieldRows.length,
    likelyReplacementRows: likelyReplacementRows.length,
    coverage,
    topMakes: topMakes(coverageRows),
    recentRange: dateRange(rows, dateField),
    sampleVehicles: sampleVehicles(coverageRows),
    notes: [
      denominator === rows.length ? 'No strong windshield-only subset was detected; coverage is over all fetched rows.' : 'Coverage is over rows with windshield-like job type, line item, or raw payload signals.',
      'Report is aggregate only and intentionally excludes customer PII.',
    ],
  };
}

function coverageFor(rows: DbRow[], predicate: (row: DbRow) => boolean): CoverageCounter {
  const count = rows.filter(predicate).length;
  return {
    count,
    pct: rows.length === 0 ? 0 : Math.round((count / rows.length) * 1000) / 10,
  };
}

function isLikelyWindshieldRow(row: DbRow): boolean {
  const text = searchableText(row);
  return /\bwindshield\b|\bw\/s\b|\bw\/shield\b|\bwindscreen\b|\bDW[-\s]?\d{3,5}\b|\bFW[-\s]?\d{3,5}\b/i.test(text);
}

function isLikelyReplacementRow(row: DbRow): boolean {
  const text = searchableText(row);
  return /replace|replacement|install|windshield/i.test(String(row.job_type || row.status || '') + ' ' + text)
    && !/repair only|chip repair/i.test(text);
}

function hasPartNumber(row: DbRow): boolean {
  const text = searchableText(row);
  return /part[_\s-]?number|nags|product[_\s-]?id|\b[A-Z]{1,4}[-\s]?\d{3,8}\b/i.test(text);
}

function hasNagsLikePart(row: DbRow): boolean {
  return /\b(?:DW|FW|WS)[-\s]?\d{3,5}\b/i.test(searchableText(row));
}

function hasLineItems(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const found = findValues(raw, /line[_\s-]?items|items|parts|charges|products/i);
  return found.some(value => Array.isArray(value) && value.length > 0);
}

function hasCalibrationSignal(row: DbRow): boolean {
  return /calib|adas|lane|camera|recal/i.test(searchableText(row));
}

function rawHasKey(raw: unknown, pattern: RegExp): boolean {
  if (!raw || typeof raw !== 'object') return false;
  return findValues(raw, pattern).length > 0;
}

function findValues(value: unknown, keyPattern: RegExp, depth = 0): unknown[] {
  if (!value || typeof value !== 'object' || depth > 6) return [];
  const matches: unknown[] = [];
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (keyPattern.test(key)) matches.push(child);
    matches.push(...findValues(child, keyPattern, depth + 1));
  }
  return matches;
}

function searchableText(row: DbRow): string {
  return [
    row.job_type,
    row.vehicle_year,
    row.vehicle_make,
    row.vehicle_model,
    row.status,
    safeStringify(row.raw_data),
  ].filter(Boolean).join(' ');
}

function safeStringify(value: unknown): string {
  if (!value) return '';
  try {
    return JSON.stringify(value).slice(0, 100_000);
  } catch {
    return '';
  }
}

function topMakes(rows: DbRow[]): Array<{ make: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const make = String(row.vehicle_make || '').trim();
    if (!make) continue;
    counts.set(make, (counts.get(make) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([make, count]) => ({ make, count }));
}

function dateRange(rows: DbRow[], dateField: string): { min: string | null; max: string | null } {
  const values = rows
    .map(row => row[dateField])
    .filter(Boolean)
    .map(value => new Date(String(value)).toISOString())
    .sort();
  return {
    min: values[0] || null,
    max: values[values.length - 1] || null,
  };
}

function sampleVehicles(rows: DbRow[]): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    const vehicle = [row.vehicle_year, row.vehicle_make, row.vehicle_model]
      .filter(Boolean)
      .join(' ')
      .trim();
    if (vehicle.length > 5) seen.add(vehicle);
    if (seen.size >= 10) break;
  }
  return [...seen];
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function isVin(value: unknown): boolean {
  return typeof value === 'string' && /^[A-HJ-NPR-Z0-9]{17}$/i.test(value.trim());
}

function numericValue(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[$,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function pickColumns(available: string[], desired: string[]): string[] {
  return desired.filter(column => available.includes(column));
}

function quoteIdent(identifier: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) throw new Error(`Unsafe identifier: ${identifier}`);
  return `"${identifier}"`;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function emptyCoverage(table: string, note: string): TableCoverage {
  return {
    table,
    totalRows: 0,
    likelyWindshieldRows: 0,
    likelyReplacementRows: 0,
    coverage: {},
    topMakes: [],
    recentRange: { min: null, max: null },
    sampleVehicles: [],
    notes: [note],
  };
}

function printMarkdown(report: {
  generated_at: string;
  lookback_months: number;
  row_limit_per_table: number;
  tables: TableCoverage[];
}) {
  console.log('# Quote History Coverage Audit');
  console.log(`Generated: ${report.generated_at}`);
  console.log(`Lookback: ${report.lookback_months} months`);
  console.log(`Limit: ${report.row_limit_per_table} rows per table`);

  for (const table of report.tables) {
    console.log(`\n## ${table.table}`);
    console.log(`Rows fetched: ${table.totalRows}`);
    console.log(`Likely windshield rows: ${table.likelyWindshieldRows}`);
    console.log(`Likely replacement rows: ${table.likelyReplacementRows}`);
    if (table.recentRange.min || table.recentRange.max) {
      console.log(`Date range: ${table.recentRange.min || '-'} to ${table.recentRange.max || '-'}`);
    }

    if (Object.keys(table.coverage).length > 0) {
      console.log('\n| Field | Count | Coverage |');
      console.log('| --- | ---: | ---: |');
      for (const [field, counter] of Object.entries(table.coverage)) {
        console.log(`| ${field} | ${counter.count} | ${counter.pct}% |`);
      }
    }

    if (table.topMakes.length > 0) {
      console.log('\nTop makes:');
      for (const item of table.topMakes) console.log(`- ${item.make}: ${item.count}`);
    }

    if (table.sampleVehicles.length > 0) {
      console.log('\nSample vehicles:');
      for (const vehicle of table.sampleVehicles) console.log(`- ${vehicle}`);
    }

    for (const note of table.notes) console.log(`\nNote: ${note}`);
  }
}

main().catch(error => {
  console.error('[history-audit] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
