import crypto from 'node:crypto';

import { OMS_USER_AGENT } from '@/lib/integration-identity';

/**
 * Re-exported alias of the shared OMS_USER_AGENT identity. Same value used by
 * the Mygrant client. Vendor-specific guards (scripts/verify-autobolt-client.ts)
 * use this re-export to confirm the AutoBolt request path sends the right header.
 */
export const AUTOBOLT_USER_AGENT = OMS_USER_AGENT;
export const AUTOBOLT_BASE_URL = 'https://api.myautobolt.com/v2';
const NONCE_BYTES = 16;
const DEFAULT_TIMEOUT_MS = 15_000;

export type AutoBoltCountry = 'US' | 'CA' | 'User';
export type AutoBoltGlassKind = 'Windshield' | 'Back';

export interface AutoBoltConfig {
  userId: string;
  apiKey: string;
  baseUrl: string;
  defaultCountry: AutoBoltCountry;
}

export interface AutoBoltDecodeInput {
  vin: string;
  kind?: AutoBoltGlassKind;
  country?: AutoBoltCountry;
}

export interface AutoBoltPlateDecodeInput {
  plateNumber: string;
  plateState: string;
  kind?: AutoBoltGlassKind;
  country?: AutoBoltCountry;
}

export interface AutoBoltGlassFeature {
  featureId: string;
  name: string;
}

export interface AutoBoltSensor {
  sensorId: string;
  name: string;
}

export interface AutoBoltCalibrationType {
  calibrationTypeId: string;
  name: string;
}

export interface AutoBoltGlassPartCalibration {
  calibrationType: AutoBoltCalibrationType;
  sensor: AutoBoltSensor;
}

export interface AutoBoltSinglePart {
  kind: 'Single';
  oemPartNumbers: string[];
  amNumber: string;
  interchangeables: string[];
  calibrations: AutoBoltGlassPartCalibration[];
  features: AutoBoltGlassFeature[];
  photoUrls: string[];
}

export interface AutoBoltLeftRightPart {
  kind: 'LeftRight';
  left: AutoBoltSinglePart;
  right: AutoBoltSinglePart;
}

export interface AutoBoltAssemblyCenterPart {
  kind: 'AssemblyCenter';
  center: AutoBoltSinglePart;
  assembly: AutoBoltSinglePart;
}

export type AutoBoltPart = AutoBoltSinglePart | AutoBoltLeftRightPart | AutoBoltAssemblyCenterPart;

export interface AutoBoltDecodeResponse {
  year: number;
  make: string;
  model: string;
  bodyStyle?: string;
  parts: string[];
  partsById: Record<string, AutoBoltPart>;
  /** Present on /decode-plate responses only. */
  vin?: string;
}

export interface AutoBoltLookupSummary {
  resolvedFrom: 'vin' | 'plate';
  vin: string;
  year: number;
  make: string;
  model: string;
  bodyStyle?: string;
  confidence: 'single' | 'multi' | 'none';
  partCount: number;
  /** The part chosen when confidence === 'single'. */
  selectedPart?: AutoBoltSinglePart;
  /** All candidate SingleParts surfaced by AutoBolt; for inconclusive responses we keep these for analyst review. */
  candidates: AutoBoltSinglePart[];
  raw: AutoBoltDecodeResponse;
}

/**
 * NAGS prefix/number split derived from AutoBolt's amNumber.
 *
 * AutoBolt returns a single `amNumber` string (e.g. "DW01658"). Mygrant's
 * inquireByNags wants prefix and number as separate fields. We split on the
 * leading alphabetic run.
 *
 * NOTE: which AutoBolt response field maps to the Mygrant NAGS identifier is
 * pending vendor confirmation (asked 2026-05-26). We default to amNumber as
 * the 90%-confidence read of the v2.7 spec; swap one line in extractNagsFromPart
 * if Nick confirms otherwise.
 */
export interface NagsIdentifier {
  prefix: string;
  number: string;
  raw: string;
}

type FetchLike = typeof fetch;

export class AutoBoltClient {
  private readonly config: AutoBoltConfig;
  private readonly fetchImpl: FetchLike;
  private readonly clock: () => number;
  private readonly nonceFn: () => string;

  constructor(
    config: AutoBoltConfig,
    fetchImpl: FetchLike = fetch,
    options: { clock?: () => number; nonceFn?: () => string } = {}
  ) {
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.clock = options.clock ?? (() => Math.floor(Date.now() / 1000));
    this.nonceFn = options.nonceFn ?? defaultNonce;
  }

  async decode(input: AutoBoltDecodeInput): Promise<AutoBoltDecodeResponse> {
    const body = {
      country: input.country ?? this.config.defaultCountry,
      vin: input.vin,
      kind: input.kind ?? 'Windshield',
    };
    return this.send('POST', '/decode', body);
  }

  async decodePlate(input: AutoBoltPlateDecodeInput): Promise<AutoBoltDecodeResponse> {
    const body = {
      country: input.country ?? this.config.defaultCountry,
      plate: {
        number: input.plateNumber,
        state: input.plateState,
      },
      kind: input.kind ?? 'Windshield',
    };
    return this.send('POST', '/decode-plate', body);
  }

  /**
   * Resolve a vehicle to a NAGS part using whichever identifier the form provided.
   * VIN is preferred when both are present (more deterministic than plate decode).
   */
  async lookup(input: { vin?: string; plate?: { number: string; state: string } }): Promise<AutoBoltLookupSummary> {
    if (input.vin && input.vin.trim().length === 17) {
      const raw = await this.decode({ vin: input.vin.trim().toUpperCase() });
      return summarize(raw, 'vin');
    }
    if (input.plate?.number && input.plate?.state) {
      const raw = await this.decodePlate({
        plateNumber: input.plate.number.trim().toUpperCase(),
        plateState: input.plate.state.trim().toUpperCase(),
      });
      return summarize(raw, 'plate');
    }
    throw new Error('AutoBolt lookup requires either a 17-character VIN or plate+state.');
  }

  private async send<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: buildAuthHeader(this.config, this.clock(), this.nonceFn()),
      'User-Agent': AUTOBOLT_USER_AGENT,
    };

    const init: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(autoboltTimeoutMs()),
    };
    if (body !== undefined) init.body = JSON.stringify(body);

    const response = await this.fetchImpl(url, init);

    if (response.status === 204) {
      throw new AutoBoltError('NotFound', 204, 'AutoBolt returned no result for this vehicle.');
    }

    if (response.status === 429) {
      throw new AutoBoltError('RateLimited', 429, 'AutoBolt rate limit hit.');
    }

    if (response.status === 401) {
      const detail = await safeReadText(response);
      throw new AutoBoltError('Unauthorized', 401, `AutoBolt rejected credentials: ${detail.slice(0, 200)}`);
    }

    if (response.status === 422) {
      const detail = await safeReadText(response);
      throw new AutoBoltError('Unprocessable', 422, `AutoBolt rejected request: ${detail.slice(0, 200)}`);
    }

    if (!response.ok) {
      const detail = await safeReadText(response);
      throw new AutoBoltError('Http', response.status, `AutoBolt HTTP ${response.status}: ${detail.slice(0, 200)}`);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new AutoBoltError('ParseError', response.status, 'AutoBolt returned a non-JSON body.');
    }
  }
}

export class AutoBoltError extends Error {
  readonly code: 'NotFound' | 'RateLimited' | 'Unauthorized' | 'Unprocessable' | 'Http' | 'ParseError';
  readonly status: number;

  constructor(code: AutoBoltError['code'], status: number, message: string) {
    super(message);
    this.name = 'AutoBoltError';
    this.code = code;
    this.status = status;
  }
}

export function buildAuthHeader(config: { userId: string; apiKey: string }, timestamp: number, nonce: string): string {
  const unhashed = `${nonce}${timestamp}${config.apiKey}`;
  const digest = crypto.createHash('sha256').update(unhashed, 'utf8').digest('base64');
  return `AutoBoltAuth version="1", timestamp=${timestamp}, digest="${digest}", nonce="${nonce}", userid="${config.userId}"`;
}

export function extractNagsFromPart(part: AutoBoltSinglePart): NagsIdentifier | undefined {
  // amNumber is Doug's 90% read of the v2.7 spec; pending Nick's confirmation.
  // If Nick says it's actually oemPartNumbers[0], replace this one expression.
  const raw = part.amNumber?.trim();
  if (!raw) return undefined;
  return splitNagsIdentifier(raw);
}

export function splitNagsIdentifier(amNumber: string): NagsIdentifier {
  const cleaned = amNumber.trim().toUpperCase().replace(/[\s\-_]+/g, '');
  const match = /^([A-Z]+)(.+)$/.exec(cleaned);
  if (!match) {
    return { prefix: '', number: cleaned, raw: amNumber };
  }
  return { prefix: match[1], number: match[2], raw: amNumber };
}

export function getAutoBoltConfigFromEnv(): AutoBoltConfig {
  return {
    userId: requiredEnv('AUTOBOLT_USER_ID'),
    apiKey: requiredEnv('AUTOBOLT_API_KEY'),
    baseUrl: process.env.AUTOBOLT_BASE_URL || AUTOBOLT_BASE_URL,
    defaultCountry: normalizeCountry(process.env.AUTOBOLT_DEFAULT_COUNTRY),
  };
}

export function getAutoBoltClient(fetchImpl: FetchLike = fetch): AutoBoltClient {
  return new AutoBoltClient(getAutoBoltConfigFromEnv(), fetchImpl);
}

function summarize(raw: AutoBoltDecodeResponse, resolvedFrom: 'vin' | 'plate'): AutoBoltLookupSummary {
  const partIds = Array.isArray(raw.parts) ? raw.parts : [];
  const singleCandidates: AutoBoltSinglePart[] = [];
  for (const partId of partIds) {
    const part = raw.partsById?.[partId];
    if (!part) continue;
    pushSingles(part, singleCandidates);
  }
  const confidence: AutoBoltLookupSummary['confidence'] =
    partIds.length === 1 && singleCandidates.length === 1 ? 'single'
      : partIds.length === 0 ? 'none'
        : 'multi';

  return {
    resolvedFrom,
    vin: raw.vin ?? '',
    year: raw.year,
    make: raw.make,
    model: raw.model,
    bodyStyle: raw.bodyStyle,
    confidence,
    partCount: partIds.length,
    selectedPart: confidence === 'single' ? singleCandidates[0] : undefined,
    candidates: singleCandidates,
    raw,
  };
}

function pushSingles(part: AutoBoltPart, out: AutoBoltSinglePart[]): void {
  if (part.kind === 'Single') {
    out.push(part);
  } else if (part.kind === 'LeftRight') {
    out.push(part.left, part.right);
  } else if (part.kind === 'AssemblyCenter') {
    out.push(part.center, part.assembly);
  }
}

function defaultNonce(): string {
  return crypto.randomBytes(NONCE_BYTES).toString('base64url').slice(0, 24);
}

async function safeReadText(response: Response): Promise<string> {
  try { return await response.text(); } catch { return ''; }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local before running AutoBolt integration checks.`);
  return value;
}

function normalizeCountry(value?: string): AutoBoltCountry {
  if (value === 'CA' || value === 'User') return value;
  return 'US';
}

function autoboltTimeoutMs(): number {
  const parsed = Number.parseInt(process.env.AUTOBOLT_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}
