/**
 * ADAS tier classifier — decides whether ADAS recalibration is bundled into
 * the customer-facing quote, surfaced as a post-conversion recommendation,
 * or omitted entirely.
 *
 * Decision drivers come from AutoBolt's `calibrations[]` array (each entry
 * has a `type` and `sensor`). The rule:
 *
 *   MANDATORY — Any windshield-camera calibration with type containing
 *               "Static" (i.e., "Static" alone or "Dual: Static + Dynamic").
 *               These vehicles require target-board calibration (Subaru
 *               EyeSight, Tesla Vision, Lexus Safety+, certain BMW DAP and
 *               Mercedes Distronic trims). Without it the ADAS system is
 *               disabled or throws errors. Bundle $200 in the quote total.
 *
 *   RECOMMENDED — Any windshield-camera calibration with type "Dynamic"
 *                 only. The system self-calibrates over a few miles of
 *                 driving; the car drives normally before/after. Most
 *                 Toyota TSS, Honda Sensing, BMW base-trim, etc. land here.
 *                 NOT bundled in the quote. Surfaced in the booking
 *                 confirmation email/SMS so the tech can walk the customer
 *                 through accept/decline at install.
 *
 *   NONE — No windshield-camera calibration in the array. Pre-2018 vehicles,
 *          base trims without forward camera, and "rain sensor init only"
 *          land here. No ADAS line, no recommendation.
 *
 * Council reco 2026-05-29 (Codex + Gemini): the type=Static signal is the
 * cleanest functional-mandatory line. Doug locked this design 2026-05-29:
 * convert first, sell ADAS at install for the recommended tier.
 */

export type AdasTier = 'mandatory' | 'recommended' | 'none';

export interface CalibrationSignal {
  type?: string | null;
  sensor?: string | null;
}

/**
 * Returns true when the calibration entry targets the windshield camera
 * system (vs e.g. rain-sensor initialization, which doesn't justify a
 * calibration line).
 */
function isCameraCalibration(c: CalibrationSignal): boolean {
  const sensor = (c.sensor ?? '').toLowerCase();
  if (!sensor) return false;
  return sensor.includes('camera');
}

/**
 * Returns true when the calibration type requires target-board (Static)
 * work. AutoBolt reports this as "Static" or "Dual: Static + Dynamic".
 */
function isStaticType(c: CalibrationSignal): boolean {
  const type = (c.type ?? '').toLowerCase();
  return type.includes('static');
}

/**
 * Returns true when the calibration type is drive-around (Dynamic only).
 */
function isDynamicOnlyType(c: CalibrationSignal): boolean {
  const type = (c.type ?? '').toLowerCase();
  return type === 'dynamic' || (type.includes('dynamic') && !type.includes('static'));
}

export function classifyAdasTier(calibrations: CalibrationSignal[] | null | undefined): AdasTier {
  const list = calibrations ?? [];
  const cameraCals = list.filter(isCameraCalibration);
  if (cameraCals.length === 0) return 'none';
  if (cameraCals.some(isStaticType)) return 'mandatory';
  if (cameraCals.some(isDynamicOnlyType)) return 'recommended';
  // Camera calibration is present but type is missing/unknown — be
  // conservative and treat as recommended (visible but not bundled).
  return 'recommended';
}
