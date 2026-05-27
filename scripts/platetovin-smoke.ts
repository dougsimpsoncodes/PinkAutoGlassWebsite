#!/usr/bin/env -S npx tsx
/**
 * PlateToVIN smoke check.
 *
 * Usage:
 *   npx tsx scripts/platetovin-smoke.ts --plate=ABC123 --state=CO
 */

import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { getPlateToVinClient } from '../src/lib/platelookup/client';

loadDotenv({ path: path.resolve(process.cwd(), '.env.local') });

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const plate = argValue('plate');
  const state = argValue('state');
  if (!plate || !state) throw new Error('Usage: npx tsx scripts/platetovin-smoke.ts --plate=ABC123 --state=CO');

  const result = await getPlateToVinClient().lookupPlate({ plate, state });
  console.log(JSON.stringify({
    success: result.success,
    vehicle: result.vehicle ? {
      vin: result.vehicle.vin,
      year: result.vehicle.year,
      make: result.vehicle.make,
      model: result.vehicle.model,
      trim: result.vehicle.trim,
      style: result.vehicle.style,
      engine: result.vehicle.engine,
      driveType: result.vehicle.driveType,
      transmission: result.vehicle.transmission,
      fuel: result.vehicle.fuel,
      color: result.vehicle.color,
    } : null,
  }, null, 2));
}

main().catch(error => {
  console.error('[platetovin] Smoke check failed:', error.message);
  process.exit(1);
});
