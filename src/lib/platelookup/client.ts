const DEFAULT_PLATETOVIN_BASE_URL = 'https://platetovin.com';

export interface PlateToVinConfig {
  apiKey: string;
  baseUrl: string;
}

export interface PlateToVinVehicle {
  vin: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  name?: string;
  style?: string;
  engine?: string;
  driveType?: string;
  transmission?: string;
  fuel?: string;
  color?: {
    name?: string;
    abbreviation?: string;
  };
  [key: string]: unknown;
}

export interface PlateToVinLookupResult {
  success: boolean;
  vehicle?: PlateToVinVehicle;
  raw: unknown;
}

type FetchLike = typeof fetch;

interface PlateToVinRawResponse {
  success: boolean;
  vin?: PlateToVinVehicle;
}

export class PlateToVinClient {
  private readonly config: PlateToVinConfig;
  private readonly fetchImpl: FetchLike;

  constructor(config: PlateToVinConfig, fetchImpl: FetchLike = fetch) {
    this.config = config;
    this.fetchImpl = fetchImpl;
  }

  async lookupPlate(
    input: { plate: string; state: string },
    options: { timeoutMs?: number } = {}
  ): Promise<PlateToVinLookupResult> {
    const plate = normalizePlate(input.plate);
    const state = normalizeState(input.state);
    const signal = AbortSignal.timeout(options.timeoutMs ?? 8_000);

    const response = await this.fetchImpl(new URL('/api/convert', this.config.baseUrl), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plate, state }),
      signal,
    });

    const rawText = await response.text();
    const raw = parseJson(rawText);

    if (!response.ok) {
      throw new Error(`PlateToVIN lookup failed: HTTP ${response.status} ${response.statusText} ${rawText.slice(0, 500)}`);
    }

    if (!isPlateToVinResponse(raw)) {
      console.warn('[platetovin] Unexpected response shape');
      return { success: false, raw };
    }

    return {
      success: raw.success === true,
      vehicle: raw.vin,
      raw,
    };
  }
}

export function getPlateToVinConfigFromEnv(): PlateToVinConfig {
  return {
    apiKey: requiredEnv('PLATETOVIN_API_KEY'),
    baseUrl: process.env.PLATETOVIN_BASE_URL || DEFAULT_PLATETOVIN_BASE_URL,
  };
}

export function getPlateToVinClient(fetchImpl: FetchLike = fetch): PlateToVinClient {
  return new PlateToVinClient(getPlateToVinConfigFromEnv(), fetchImpl);
}

export function normalizePlate(plate: string): string {
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (normalized.length < 2 || normalized.length > 10) {
    throw new Error('License plate must be 2-10 alphanumeric characters.');
  }
  return normalized;
}

export function normalizeState(state: string): string {
  const normalized = state.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    throw new Error('State must be a 2-letter US postal abbreviation.');
  }
  return normalized;
}

function parseJson(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    return { parseError: true, rawText };
  }
}

function isPlateToVinResponse(value: unknown): value is PlateToVinRawResponse {
  if (typeof value !== 'object' || value === null || !('success' in value)) return false;
  const maybeVin = (value as { vin?: unknown }).vin;
  if (maybeVin === undefined) return true;
  return typeof maybeVin === 'object'
    && maybeVin !== null
    && typeof (maybeVin as { vin?: unknown }).vin === 'string';
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local before running PlateToVIN integration checks.`);
  return value;
}
