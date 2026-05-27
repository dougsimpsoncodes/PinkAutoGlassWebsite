#!/usr/bin/env -S npx tsx
/**
 * Build an anonymized replay dataset from historical Omega installs and compare
 * the current cash windshield pricing formula against completed jobs.
 *
 * This script is read-only. It intentionally excludes customer names, phones,
 * emails, addresses, invoice numbers, raw Omega payloads, and full VINs.
 *
 * Usage:
 *   npx tsx scripts/replay-quote-history.ts --months=24 --limit=250 --json=tmp/quote-history-replay.json
 *   npx tsx scripts/replay-quote-history.ts --months=24 --limit=10 --live-mygrant --json=tmp/quote-history-replay-live.json
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { buildCashWindshieldQuote, dollarsToCents } from '../src/lib/quote/pricing';
import { evaluateMygrantWindshieldCandidates, publicScoredMygrantCandidate } from '../src/lib/quote/mygrant-scoring';
import { getMygrantClient, type MygrantResponseItem } from '../src/lib/mygrant/client';

type DbRow = Record<string, unknown>;

interface ReplayCase {
  caseId: string;
  source: 'omega_installs';
  installMonth: string | null;
  vehicle: {
    year: number;
    make: string;
    model: string;
    vinPresent: boolean;
  };
  history: {
    actualTotalCents: number;
    partsCostCents: number | null;
    laborCostCents: number | null;
    taxCents: number | null;
    paymentClass: 'cash' | 'insurance' | 'other' | 'unknown';
    calibrationLikely: boolean;
    nagsLikeParts: string[];
  };
  formulaReplay: ReplayResult | null;
  liveMygrantReplay?: LiveReplayResult;
}

interface ReplayResult {
  status: string;
  pricingVersion: string;
  totalCents: number;
  deltaFromActualCents: number;
  pctDeltaFromActual: number | null;
  lineItems: Array<{
    kind: string;
    amountCents: number;
  }>;
  confidenceReasons: string[];
}

interface LiveReplayResult {
  status: 'quoted' | 'manual_review' | 'lookup_failed';
  mygrantStatusCode?: string;
  mygrantStatusText?: string;
  responseCount?: number;
  selectionConfidence?: string;
  selectedPart?: {
    nagsKey: string | null;
    brand?: string;
    description?: string;
    customerUnitPrice?: number;
    qtyAvailable?: number;
    shipFromBranchName?: string;
  };
  formulaReplay?: ReplayResult;
  reasons: string[];
  topCandidates?: ReturnType<typeof publicScoredMygrantCandidate>[];
}

interface ReplayReport {
  generated_at: string;
  lookback_months: number;
  row_limit: number;
  live_mygrant: boolean;
  summary: {
    fetched_rows: number;
    replay_cases: number;
    with_parts_cost: number;
    calibration_likely: number;
    nags_like_part_cases: number;
    formula: ReplaySummary;
    live_mygrant?: LiveReplaySummary;
  };
  cases: ReplayCase[];
  notes: string[];
}

interface ReplaySummary {
  count: number;
  average_delta_cents: number | null;
  median_delta_cents: number | null;
  average_absolute_delta_cents: number | null;
  within_50_dollars: number;
  within_100_dollars: number;
  under_actual: number;
  over_actual: number;
}

interface LiveReplaySummary {
  attempted: number;
  quoted: number;
  manual_review: number;
  lookup_failed: number;
  high_confidence: number;
  medium_confidence: number;
  low_confidence: number;
  average_delta_cents: number | null;
  median_delta_cents: number | null;
  average_absolute_delta_cents: number | null;
}

const ROOT = path.resolve(__dirname, '..');
loadEnv(path.join(ROOT, '.env.local'));
loadEnv(path.join(ROOT, '.env.local.service'));

const months = parsePositiveInt(argValue('months'), 24);
const limit = parsePositiveInt(argValue('limit'), 250);
const jsonOutputPath = argValue('json');
const includeLiveMygrant = process.argv.includes('--live-mygrant');
const calibrationCents = parsePositiveInt(process.env.QUOTE_ADAS_CALIBRATION_CENTS, 22500);
const taxRate = Number.parseFloat(process.env.QUOTE_TAX_RATE || '0') || 0;

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

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
    const rows = await fetchInstallRows(client);
    const cases = rows
      .filter(isReplayableWindshieldInstall)
      .map(buildReplayCase)
      .filter((replayCase): replayCase is ReplayCase => replayCase !== null);

    if (includeLiveMygrant) {
      await addLiveMygrantReplay(cases);
    }

    const report: ReplayReport = {
      generated_at: new Date().toISOString(),
      lookback_months: months,
      row_limit: limit,
      live_mygrant: includeLiveMygrant,
      summary: {
        fetched_rows: rows.length,
        replay_cases: cases.length,
        with_parts_cost: cases.filter(replayCase => replayCase.history.partsCostCents !== null).length,
        calibration_likely: cases.filter(replayCase => replayCase.history.calibrationLikely).length,
        nags_like_part_cases: cases.filter(replayCase => replayCase.history.nagsLikeParts.length > 0).length,
        formula: summarizeFormula(cases.map(replayCase => replayCase.formulaReplay).filter(Boolean) as ReplayResult[]),
        ...(includeLiveMygrant ? { live_mygrant: summarizeLive(cases) } : {}),
      },
      cases,
      notes: [
        'Report is anonymized and excludes customer PII, raw Omega payloads, invoice numbers, and full VINs.',
        'Formula replay uses historical parts_cost as the glass input to test pricing policy against completed jobs.',
        'Live Mygrant replay uses vehicle year/make/model only; Mygrant vehicle inquiry remains exploratory until enough cases are reviewed.',
      ],
    };

    printMarkdown(report);

    if (jsonOutputPath) {
      const outputPath = path.resolve(ROOT, jsonOutputPath);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
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
      throw new Error(`${message} Set NODE_EXTRA_CA_CERTS to a trusted CA bundle, or set QUOTE_HISTORY_ALLOW_INSECURE_DB_SSL=true for a local read-only replay.`);
    }

    console.warn('[history-replay] TLS certificate chain was not trusted locally; retrying with certificate verification disabled because QUOTE_HISTORY_ALLOW_INSECURE_DB_SSL=true.');
    const fallback = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }, // nosemgrep: problem-based-packs.insecure-transport.js-node.bypass-tls-verification.bypass-tls-verification
      connectionTimeoutMillis: 5000,
    });
    await fallback.connect();
    return fallback;
  }
}

async function fetchInstallRows(client: Client): Promise<DbRow[]> {
  const columns = await tableColumns(client, 'omega_installs');
  if (columns.length === 0) throw new Error('omega_installs table not found.');

  const selectedColumns = pickColumns(columns, [
    'id',
    'omega_invoice_id',
    'install_date',
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
    'raw_data',
  ]);

  const dateColumn = columns.includes('install_date') ? 'install_date' : columns.includes('created_at') ? 'created_at' : null;
  const where = dateColumn ? `WHERE ${quoteIdent(dateColumn)} >= NOW() - ($1::text || ' months')::interval` : '';
  const params = dateColumn ? [String(months), limit] : [limit];
  const limitParam = dateColumn ? '$2' : '$1';
  const orderBy = dateColumn ? `ORDER BY ${quoteIdent(dateColumn)} DESC NULLS LAST` : '';
  const result = await client.query(`
    SELECT ${selectedColumns.map(quoteIdent).join(', ')}
    FROM omega_installs
    ${where}
    ${orderBy}
    LIMIT ${limitParam}
  `, params);

  return result.rows;
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

function buildReplayCase(row: DbRow): ReplayCase | null {
  const year = parseInteger(row.vehicle_year);
  const make = stringValue(row.vehicle_make);
  const model = stringValue(row.vehicle_model);
  const actualTotalCents = moneyToCents(row.total_revenue);
  const partsCostCents = nullableMoneyToCents(row.parts_cost);
  if (!year || !make || !model || !actualTotalCents) return null;

  const calibrationLikely = hasCalibrationSignal(row);
  const formulaReplay = partsCostCents
    ? buildFormulaReplay(partsCostCents, actualTotalCents, calibrationLikely)
    : null;

  return {
    caseId: stableCaseId(row),
    source: 'omega_installs',
    installMonth: monthBucket(row.install_date),
    vehicle: {
      year,
      make,
      model,
      vinPresent: isVin(row.vin),
    },
    history: {
      actualTotalCents,
      partsCostCents,
      laborCostCents: nullableMoneyToCents(row.labor_cost),
      taxCents: nullableMoneyToCents(row.tax_amount),
      paymentClass: classifyPayment(row.payment_method),
      calibrationLikely,
      nagsLikeParts: extractNagsLikeParts(row).slice(0, 5),
    },
    formulaReplay,
  };
}

function buildFormulaReplay(
  glassCostCents: number,
  actualTotalCents: number,
  calibrationLikely: boolean
): ReplayResult {
  const quote = buildCashWindshieldQuote({
    glassCostCents,
    calibrationCents: calibrationLikely ? calibrationCents : 0,
    taxRate,
  });
  const deltaFromActualCents = quote.totalCents - actualTotalCents;
  return {
    status: quote.status,
    pricingVersion: quote.pricingVersion,
    totalCents: quote.totalCents,
    deltaFromActualCents,
    pctDeltaFromActual: actualTotalCents > 0
      ? round1((deltaFromActualCents / actualTotalCents) * 100)
      : null,
    lineItems: quote.lineItems.map(item => ({
      kind: item.kind,
      amountCents: item.amountCents,
    })),
    confidenceReasons: quote.confidenceReasons,
  };
}

async function addLiveMygrantReplay(cases: ReplayCase[]) {
  const client = getMygrantClient();

  for (const replayCase of cases) {
    try {
      const response = await client.inquireByVehicle([{
        vehicleYear: replayCase.vehicle.year,
        vehicleMake: replayCase.vehicle.make,
        vehicleModel: replayCase.vehicle.model,
      }], `history_replay_${replayCase.caseId}`);

      const items = response.requestItems.flatMap(item => item.responses);
      const selection = evaluateMygrantWindshieldCandidates(items);
      const selectedPart = selection.selectedPart;
      const liveResult: LiveReplayResult = {
        status: selection.confidence === 'high' && selectedPart?.customerUnitPrice ? 'quoted' : 'manual_review',
        mygrantStatusCode: response.requestStatusCode,
        mygrantStatusText: response.requestStatusText,
        responseCount: items.length,
        selectionConfidence: selection.confidence,
        selectedPart: publicSelectedPart(selectedPart),
        reasons: selection.reasons,
        topCandidates: selection.rankedCandidates.slice(0, 5).map(publicScoredMygrantCandidate),
      };

      if (liveResult.status === 'quoted' && selectedPart?.customerUnitPrice) {
        liveResult.formulaReplay = buildFormulaReplay(
          dollarsToCents(selectedPart.customerUnitPrice),
          replayCase.history.actualTotalCents,
          replayCase.history.calibrationLikely
        );
      }

      replayCase.liveMygrantReplay = liveResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      replayCase.liveMygrantReplay = {
        status: 'lookup_failed',
        reasons: [message.slice(0, 300)],
      };
    }
  }
}

function publicSelectedPart(part?: MygrantResponseItem): LiveReplayResult['selectedPart'] {
  if (!part) return undefined;
  return {
    nagsKey: [part.nagsPrefix, part.nagsNumber].filter(Boolean).join('') || null,
    brand: part.brand,
    description: part.partDesc || part.part,
    customerUnitPrice: part.customerUnitPrice,
    qtyAvailable: part.qtyAvailable,
    shipFromBranchName: part.shipFromBranchName,
  };
}

function summarizeFormula(results: ReplayResult[]): ReplaySummary {
  const deltas = results.map(result => result.deltaFromActualCents);
  const absDeltas = deltas.map(delta => Math.abs(delta));
  return {
    count: results.length,
    average_delta_cents: average(deltas),
    median_delta_cents: median(deltas),
    average_absolute_delta_cents: average(absDeltas),
    within_50_dollars: absDeltas.filter(delta => delta <= 5000).length,
    within_100_dollars: absDeltas.filter(delta => delta <= 10000).length,
    under_actual: deltas.filter(delta => delta < 0).length,
    over_actual: deltas.filter(delta => delta > 0).length,
  };
}

function summarizeLive(cases: ReplayCase[]): LiveReplaySummary {
  const live = cases.map(replayCase => replayCase.liveMygrantReplay).filter(Boolean) as LiveReplayResult[];
  const liveFormulaResults = live
    .map(result => result.formulaReplay)
    .filter(Boolean) as ReplayResult[];
  const deltas = liveFormulaResults.map(result => result.deltaFromActualCents);
  const absDeltas = deltas.map(delta => Math.abs(delta));

  return {
    attempted: live.length,
    quoted: live.filter(result => result.status === 'quoted').length,
    manual_review: live.filter(result => result.status === 'manual_review').length,
    lookup_failed: live.filter(result => result.status === 'lookup_failed').length,
    high_confidence: live.filter(result => result.selectionConfidence === 'high').length,
    medium_confidence: live.filter(result => result.selectionConfidence === 'medium').length,
    low_confidence: live.filter(result => result.selectionConfidence === 'low').length,
    average_delta_cents: average(deltas),
    median_delta_cents: median(deltas),
    average_absolute_delta_cents: average(absDeltas),
  };
}

function isReplayableWindshieldInstall(row: DbRow): boolean {
  return isLikelyWindshieldRow(row)
    && isLikelyReplacementRow(row)
    && parseInteger(row.vehicle_year) !== null
    && hasValue(row.vehicle_make)
    && hasValue(row.vehicle_model)
    && moneyToCents(row.total_revenue) > 0;
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

function hasCalibrationSignal(row: DbRow): boolean {
  return /calib|adas|lane|camera|recal/i.test(searchableText(row));
}

function extractNagsLikeParts(row: DbRow): string[] {
  const matches = searchableText(row).match(/\b(?:DW|FW|WS)[-\s]?\d{3,5}\b/gi) || [];
  return [...new Set(matches.map(match => match.toUpperCase().replace(/[\s-]/g, '')))];
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

function stableCaseId(row: DbRow): string {
  const stableSource = [
    row.id,
    row.omega_invoice_id,
    row.install_date,
    row.vehicle_year,
    row.vehicle_make,
    row.vehicle_model,
  ].filter(Boolean).join('|');
  return `hist_${crypto.createHash('sha256').update(stableSource).digest('hex').slice(0, 12)}`;
}

function monthBucket(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 7);
}

function classifyPayment(value: unknown): ReplayCase['history']['paymentClass'] {
  const normalized = String(value || '').toLowerCase();
  if (!normalized) return 'unknown';
  if (/cash|credit|card|check|cc|visa|mastercard|amex|discover/.test(normalized)) return 'cash';
  if (/ins|claim|farm|geico|progressive|allstate|usaa|liberty|nationwide|aaa|safelite/.test(normalized)) return 'insurance';
  return 'other';
}

function isVin(value: unknown): boolean {
  return typeof value === 'string' && /^[A-HJ-NPR-Z0-9]{17}$/i.test(value.trim());
}

function moneyToCents(value: unknown): number {
  const parsed = numericValue(value);
  return parsed > 0 ? Math.round(parsed * 100) : 0;
}

function nullableMoneyToCents(value: unknown): number | null {
  const cents = moneyToCents(value);
  return cents > 0 ? cents : null;
}

function numericValue(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[$,]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function parseInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed)) return parsed;
  }
  return null;
}

function stringValue(value: unknown): string {
  return String(value || '').trim();
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== '';
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

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[midpoint];
  return Math.round((sorted[midpoint - 1] + sorted[midpoint]) / 2);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function formatCents(value: number | null): string {
  if (value === null) return '-';
  const sign = value < 0 ? '-' : '';
  return `${sign}$${(Math.abs(value) / 100).toFixed(2)}`;
}

function printMarkdown(report: ReplayReport) {
  console.log('# Quote History Replay');
  console.log(`Generated: ${report.generated_at}`);
  console.log(`Lookback: ${report.lookback_months} months`);
  console.log(`Limit: ${report.row_limit} rows`);
  console.log(`Live Mygrant: ${report.live_mygrant ? 'yes' : 'no'}`);

  console.log('\n## Dataset');
  console.log(`Fetched rows: ${report.summary.fetched_rows}`);
  console.log(`Replay cases: ${report.summary.replay_cases}`);
  console.log(`Cases with parts cost: ${report.summary.with_parts_cost}`);
  console.log(`Likely calibration cases: ${report.summary.calibration_likely}`);
  console.log(`Cases with NAGS-like historical parts: ${report.summary.nags_like_part_cases}`);

  console.log('\n## Formula Replay');
  printReplaySummary(report.summary.formula);

  if (report.summary.live_mygrant) {
    console.log('\n## Live Mygrant Replay');
    const live = report.summary.live_mygrant;
    console.log(`Attempted: ${live.attempted}`);
    console.log(`Quoted: ${live.quoted}`);
    console.log(`Manual review: ${live.manual_review}`);
    console.log(`Lookup failed: ${live.lookup_failed}`);
    console.log(`Confidence: high ${live.high_confidence}, medium ${live.medium_confidence}, low ${live.low_confidence}`);
    console.log(`Average delta: ${formatCents(live.average_delta_cents)}`);
    console.log(`Median delta: ${formatCents(live.median_delta_cents)}`);
    console.log(`Average absolute delta: ${formatCents(live.average_absolute_delta_cents)}`);
  }

  const sample = report.cases.slice(0, 10);
  if (sample.length > 0) {
    console.log('\n## Sample Cases');
    console.log('| Case | Vehicle | Actual | Formula | Delta | Signals |');
    console.log('| --- | --- | ---: | ---: | ---: | --- |');
    for (const replayCase of sample) {
      const signals = [
        replayCase.history.calibrationLikely ? 'calibration' : null,
        replayCase.vehicle.vinPresent ? 'vin' : null,
        replayCase.history.nagsLikeParts.length ? 'nags' : null,
      ].filter(Boolean).join(', ') || '-';
      console.log([
        `| ${replayCase.caseId}`,
        `${replayCase.vehicle.year} ${replayCase.vehicle.make} ${replayCase.vehicle.model}`,
        formatCents(replayCase.history.actualTotalCents),
        formatCents(replayCase.formulaReplay?.totalCents ?? null),
        formatCents(replayCase.formulaReplay?.deltaFromActualCents ?? null),
        `${signals} |`,
      ].join(' | '));
    }
  }

  for (const note of report.notes) console.log(`\nNote: ${note}`);
}

function printReplaySummary(summary: ReplaySummary) {
  console.log(`Count: ${summary.count}`);
  console.log(`Average delta: ${formatCents(summary.average_delta_cents)}`);
  console.log(`Median delta: ${formatCents(summary.median_delta_cents)}`);
  console.log(`Average absolute delta: ${formatCents(summary.average_absolute_delta_cents)}`);
  console.log(`Within $50: ${summary.within_50_dollars}`);
  console.log(`Within $100: ${summary.within_100_dollars}`);
  console.log(`Under actual: ${summary.under_actual}`);
  console.log(`Over actual: ${summary.over_actual}`);
}

main().catch(error => {
  console.error('[history-replay] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
