const DEFAULT_NHTSA_BASE_URL = 'https://vpic.nhtsa.dot.gov';

export interface VinDecodeVehicle {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  engine?: string;
  driveType?: string;
  transmission?: string;
}

interface NhtsaDecodeVinResponse {
  Results?: Array<{
    VIN?: string;
    ModelYear?: string;
    Make?: string;
    Model?: string;
    Trim?: string;
    BodyClass?: string;
    DisplacementL?: string;
    DriveType?: string;
    TransmissionStyle?: string;
    ErrorCode?: string;
    ErrorText?: string;
  }>;
}

type FetchLike = typeof fetch;

export function normalizeVin(vin: string): string {
  const normalized = vin.trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) {
    throw new Error('VIN must be 17 characters and cannot include I, O, or Q.');
  }
  return normalized;
}

export async function decodeVin(
  vinInput: string,
  fetchImpl: FetchLike = fetch
): Promise<{ success: boolean; vehicle?: VinDecodeVehicle; error?: string; raw?: unknown }> {
  const vin = normalizeVin(vinInput);
  const url = new URL(`/api/vehicles/DecodeVinValues/${encodeURIComponent(vin)}`, process.env.NHTSA_VPIC_BASE_URL || DEFAULT_NHTSA_BASE_URL);
  url.searchParams.set('format', 'json');

  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  });
  const rawText = await response.text();
  const raw = parseJson(rawText);

  if (!response.ok) {
    throw new Error(`NHTSA VIN decode failed: HTTP ${response.status} ${response.statusText}`);
  }
  if (!isNhtsaDecodeResponse(raw) || !raw.Results?.[0]) {
    return { success: false, error: 'unexpected_response', raw };
  }

  const result = raw.Results[0];
  const errorCode = result.ErrorCode || '';
  const hasFatalError = errorCode
    .split(',')
    .map(code => code.trim())
    .filter(Boolean)
    .some(code => code !== '0' && code !== '6');

  if (hasFatalError || !result.Make || !result.Model || !result.ModelYear) {
    return {
      success: false,
      error: result.ErrorText || 'vin_not_decoded',
      raw,
    };
  }

  return {
    success: true,
    vehicle: {
      vin,
      year: Number.parseInt(result.ModelYear, 10) || undefined,
      make: result.Make,
      model: result.Model,
      trim: result.Trim || undefined,
      bodyStyle: result.BodyClass || undefined,
      engine: result.DisplacementL ? `${result.DisplacementL}L` : undefined,
      driveType: result.DriveType || undefined,
      transmission: result.TransmissionStyle || undefined,
    },
    raw,
  };
}

function parseJson(rawText: string): unknown {
  try {
    return JSON.parse(rawText);
  } catch {
    return { parseError: true, rawText };
  }
}

function isNhtsaDecodeResponse(value: unknown): value is NhtsaDecodeVinResponse {
  return typeof value === 'object' && value !== null && Array.isArray((value as NhtsaDecodeVinResponse).Results);
}
