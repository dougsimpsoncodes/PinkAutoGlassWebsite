#!/usr/bin/env -S npx tsx
/**
 * Mygrant SOAP smoke checks.
 *
 * Usage:
 *   npx tsx scripts/mygrant-inquiry-smoke.ts --nags=DW01658
 *   npx tsx scripts/mygrant-inquiry-smoke.ts --vehicle-year=2020 --vehicle-make=Toyota --vehicle-model=Camry
 */

import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { getMygrantClient, type MygrantParsedResponse } from '../src/lib/mygrant/client';
import { evaluateMygrantWindshieldCandidates, publicScoredMygrantCandidate } from '../src/lib/quote/mygrant-scoring';

loadDotenv({ path: path.resolve(process.cwd(), '.env.local') });

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function parseNags(value: string): { nagsPrefix: string; nagsNumber: string } {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = normalized.match(/^([A-Z]{2})(\d{3,5})$/);
  if (!match) throw new Error('Use --nags=DW01658 or --nags=DW1658');
  return {
    nagsPrefix: match[1],
    nagsNumber: match[2].padStart(5, '0'),
  };
}

async function main() {
  const client = getMygrantClient();
  const opportunityId = `quote_spike_${Date.now()}`;
  const nags = argValue('nags');

  if (nags) {
    const item = parseNags(nags);
    console.log(`[mygrant] Inquiry by NAGS ${item.nagsPrefix}${item.nagsNumber}`);
    const result = await client.inquireByNags([{ ...item, quantity: 1 }], opportunityId);
    printSummary(result);
    return;
  }

  const vehicleYear = Number.parseInt(argValue('vehicle-year') || '', 10);
  const vehicleMake = argValue('vehicle-make');
  const vehicleModel = argValue('vehicle-model');

  if (vehicleYear && vehicleMake && vehicleModel) {
    console.log(`[mygrant] Exploratory inquiry by vehicle ${vehicleYear} ${vehicleMake} ${vehicleModel}`);
    const result = await client.inquireByVehicle([{ vehicleYear, vehicleMake, vehicleModel, quantity: 1 }], opportunityId);
    printSummary(result);
    return;
  }

  throw new Error('Pass either --nags=DW01658 or --vehicle-year=2020 --vehicle-make=Toyota --vehicle-model=Camry');
}

function printSummary(result: MygrantParsedResponse) {
  const allResponses = result.requestItems.flatMap(item => item.responses);
  const selection = evaluateMygrantWindshieldCandidates(allResponses);

  console.log(JSON.stringify({
    requestStatusCode: result.requestStatusCode,
    requestStatusText: result.requestStatusText,
    windshieldSelection: {
      confidence: selection.confidence,
      reasons: selection.reasons,
      selectedPart: selection.selectedPart ? {
        nagsPrefix: selection.selectedPart.nagsPrefix,
        nagsNumber: selection.selectedPart.nagsNumber,
        productId: selection.selectedPart.productId,
        brand: selection.selectedPart.brand,
        partDesc: selection.selectedPart.partDesc,
        qtyAvailable: selection.selectedPart.qtyAvailable,
        customerUnitPrice: selection.selectedPart.customerUnitPrice,
        shipFromBranch: selection.selectedPart.shipFromBranchName,
      } : null,
      topCandidates: selection.rankedCandidates.slice(0, 8).map(publicScoredMygrantCandidate),
    },
    requestItems: result.requestItems.map(item => ({
      requestItemNo: item.requestItemNo,
      responseCount: item.responses.length,
      responses: item.responses.map(response => ({
        productType: response.productType,
        part: response.part,
        partDesc: response.partDesc,
        brand: response.brand,
        qtyAvailable: response.qtyAvailable,
        customerUnitPrice: response.customerUnitPrice,
        listUnitPrice: response.listUnitPrice,
        shipFromBranch: response.shipFromBranchName,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
        estimatedDeliveryTime: response.estimatedDeliveryTime,
        notes: response.notes,
        code: response.code,
      })),
    })),
  }, null, 2));
}

main().catch(error => {
  console.error('[mygrant] Smoke check failed:', error.message);
  process.exit(1);
});
