/**
 * ADAS tier classifier — decides whether ADAS recalibration is bundled into
 * the customer-facing quote, surfaced as a post-conversion recommendation,
 * or omitted entirely.
 *
 * Doug's policy 2026-05-29: "mandatory" means the customer literally cannot
 * drive the vehicle safely without recalibration — the system is core to
 * driving (Tesla Vision) or auto-disables with a persistent dashboard
 * warning the customer can't ignore (Subaru EyeSight). For everything else,
 * even when the windshield camera technically uses a Static target, the
 * customer can decline at install and the car drives normally with a few
 * warning lights. Convert first, sell ADAS at install for those.
 *
 *   MANDATORY — Brand-specific narrow list:
 *               • Any Tesla with a camera calibration (Vision IS the driving
 *                 system; without it Autopilot/steering features fail hard).
 *               • Subaru with a Dual: Static + Dynamic camera calibration
 *                 (EyeSight system — auto-disables, dashboard warning that
 *                 stays on until recalibrated).
 *               These bundle $200 into the quote total.
 *
 *   RECOMMENDED — Any other vehicle with a windshield-camera calibration,
 *                 regardless of Static / Dynamic / Dual. Most Toyota TSS,
 *                 Honda Sensing, Lexus Safety+, BMW DAP, Mercedes Distronic,
 *                 etc. land here. NOT bundled in the quote. Surfaced in the
 *                 booking confirmation email/SMS so the tech can walk the
 *                 customer through accept/decline at install.
 *
 *   NONE — No windshield-camera calibration in the array. Pre-camera
 *          vehicles, base trims without forward camera, and "rain sensor
 *          init only" land here. No ADAS line, no recommendation.
 *
 * AutoBolt's calibration.type (Static/Dynamic/Dual) is still used to detect
 * EyeSight on Subaru, but it is NOT the mandatory/recommended switch on its
 * own — brand is.
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
 * Subarus with a Dual: Static + Dynamic camera calibration are reliably
 * EyeSight-equipped. Plain "Static" or "Dynamic" alone are rare on Subaru
 * camera systems and don't carry the same auto-disable behavior.
 */
function isSubaruEyeSightCal(c: CalibrationSignal): boolean {
  const type = (c.type ?? '').toLowerCase();
  return type.includes('static') && type.includes('dynamic');
}

function normalizeMake(make: string | null | undefined): string {
  return (make ?? '').trim().toLowerCase();
}

/**
 * @param calibrations  AutoBolt's calibration array for the resolved part.
 * @param make          Vehicle make. Required to classify mandatory tier
 *                      correctly — brand drives the decision, not cal type.
 */
export function classifyAdasTier(
  calibrations: CalibrationSignal[] | null | undefined,
  make?: string | null,
): AdasTier {
  const list = calibrations ?? [];
  const cameraCals = list.filter(isCameraCalibration);
  if (cameraCals.length === 0) return 'none';

  const brand = normalizeMake(make);
  if (brand === 'tesla') return 'mandatory';
  if (brand === 'subaru' && cameraCals.some(isSubaruEyeSightCal)) return 'mandatory';

  return 'recommended';
}
