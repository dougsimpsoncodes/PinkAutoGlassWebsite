#!/usr/bin/env -S npx tsx
/**
 * Guard for the Mygrant integration invariant in .claude/CLAUDE.md.
 *
 * Usage:
 *   npx tsx scripts/verify-mygrant-client.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { MYGRANT_USER_AGENT, MygrantClient, parseMygrantSoapResponse, type MygrantConfig } from '../src/lib/mygrant/client';

const EXPECTED_USER_AGENT = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';
const ROOT = process.cwd();
const CLIENT_PATH = path.join(ROOT, 'src/lib/mygrant/client.ts');
const IDENTITY_PATH = path.join(ROOT, 'src/lib/integration-identity.ts');
const AUTOBOLT_CLIENT_PATH = path.join(ROOT, 'src/lib/autobolt/client.ts');
const AUTOBOLT_VERIFY_PATH = path.join(ROOT, 'scripts/verify-autobolt-client.ts');
// Standalone diagnostic scripts that probe vendors directly; can't easily
// import from src/ (they're .mjs and need to run via plain `node`).
const PROBE_MYGRANT_PATH = path.join(ROOT, 'scripts/probe-mygrant-nags.mjs');
const PROBE_AUTOBOLT_PATH = path.join(ROOT, 'scripts/probe-autobolt-vehicle.mjs');

async function assertHeader() {
  let capturedUserAgent: string | null = null;
  const mockFetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    capturedUserAgent = headers.get('User-Agent');
    return new Response(
      '<soap:Envelope><soap:Body><InboundTrafficResponse><InboundTrafficResult><![CDATA[<MygrantXMLOrderingSystemRequest><RequestSet></RequestSet><RequestStatusCode>0</RequestStatusCode><RequestStatusText>Success</RequestStatusText></MygrantXMLOrderingSystemRequest>]]></InboundTrafficResult></InboundTrafficResponse></soap:Body></soap:Envelope>',
      { status: 200 }
    );
  };

  const config: MygrantConfig = {
    authToken: 'test-token',
    customerId: 'C000001-001',
    webUserId: 'demoacct',
    password: 'password',
    customerContact: 'Test',
    environment: 'TEST',
    baseUrl: 'https://webservice-staging.mygrantglass.com/v2/CoRE650WebService.asmx',
  };

  await new MygrantClient(config, mockFetch as typeof fetch).inquireByNags([{ nagsPrefix: 'DW', nagsNumber: '01658' }]);
  if (capturedUserAgent !== EXPECTED_USER_AGENT) {
    throw new Error(`Mygrant User-Agent mismatch. Expected ${EXPECTED_USER_AGENT}, got ${capturedUserAgent}`);
  }
}

function assertSingleUserAgentDefinition() {
  if (MYGRANT_USER_AGENT !== EXPECTED_USER_AGENT) {
    throw new Error(`MYGRANT_USER_AGENT constant mismatch. Expected ${EXPECTED_USER_AGENT}`);
  }

  // Allowlist: identity module owns the literal; vendor clients (Mygrant, AutoBolt)
  // re-export aliases; verify scripts assert against the expected value;
  // standalone diagnostic probe scripts hardcode it because they can't import
  // from src/.
  const literalAllowlist = new Set([
    CLIENT_PATH,
    IDENTITY_PATH,
    AUTOBOLT_CLIENT_PATH,
    AUTOBOLT_VERIFY_PATH,
    PROBE_MYGRANT_PATH,
    PROBE_AUTOBOLT_PATH,
  ]);
  const constantAllowlist = new Set([CLIENT_PATH]);

  const matches = findTextMatches(ROOT, 'MYGRANT_USER_AGENT')
    .filter(file => isCodeFile(file))
    .filter(file => !file.endsWith('scripts/verify-mygrant-client.ts'));

  const invalid = matches.filter(file => !constantAllowlist.has(file));
  if (invalid.length > 0) {
    throw new Error(`MYGRANT_USER_AGENT may only be defined/referenced in src/lib/mygrant/client.ts. Offenders:\n${invalid.join('\n')}`);
  }

  const literalMatches = findTextMatches(ROOT, 'PinkAutoGlass-OMS/')
    .filter(file => isCodeFile(file))
    .filter(file => !file.endsWith('scripts/verify-mygrant-client.ts'));
  const literalInvalid = literalMatches.filter(file => !literalAllowlist.has(file));
  if (literalInvalid.length > 0) {
    throw new Error(`OMS User-Agent literal may only appear in the identity module + vendor clients + verify scripts. Offenders:\n${literalInvalid.join('\n')}`);
  }
}

function assertMygrantDomainGuard() {
  const matches = findTextMatches(ROOT, 'mygrantglass.com')
    .filter(file => isCodeFile(file))
    .filter(file => !file.includes('/node_modules/'))
    .filter(file => !file.endsWith('scripts/verify-mygrant-client.ts'))
    .filter(file => !file.endsWith('.env.example'));

  // Standalone diagnostic probe needs the base URL inline (plain .mjs, no TS imports).
  const allowed = new Set([CLIENT_PATH, PROBE_MYGRANT_PATH]);
  const invalid = matches.filter(file => !allowed.has(file));
  if (invalid.length > 0) {
    throw new Error(`Mygrant domain references must stay centralized in src/lib/mygrant/client.ts. Offenders:\n${invalid.join('\n')}`);
  }
}

function assertReturnCodeParsing() {
  const parsed = parseMygrantSoapResponse(
    '<soap:Envelope><soap:Body><InboundTrafficResponse><InboundTrafficResult><![CDATA[<?xml version="1.0" encoding="utf-8" standalone="yes"?><Order><ReturnCode>e610</ReturnCode><ReturnText>Internal error: Something went wrong.</ReturnText></Order>]]></InboundTrafficResult></InboundTrafficResponse></soap:Body></soap:Envelope>'
  );

  if (parsed.requestStatusCode !== 'e610') {
    throw new Error(`Expected Mygrant ReturnCode fallback to parse e610, got ${parsed.requestStatusCode}`);
  }
  if (parsed.requestStatusText !== 'Internal error: Something went wrong.') {
    throw new Error(`Expected Mygrant ReturnText fallback to parse, got ${parsed.requestStatusText}`);
  }
}

function assertStandardStatusParsing() {
  const parsed = parseMygrantSoapResponse(
    '<soap:Envelope><soap:Body><InboundTrafficResponse><InboundTrafficResult><![CDATA[<MygrantXMLOrderingSystemRequest><RequestSet></RequestSet><RequestStatusCode>0</RequestStatusCode><RequestStatusText>Success</RequestStatusText></MygrantXMLOrderingSystemRequest>]]></InboundTrafficResult></InboundTrafficResponse></soap:Body></soap:Envelope>'
  );

  if (parsed.requestStatusCode !== '0' || parsed.requestStatusText !== 'Success') {
    throw new Error('Expected Mygrant standard status fields to parse.');
  }
}

function findTextMatches(root: string, needle: string): string[] {
  const results: string[] = [];
  walk(root, file => {
    if (shouldSkip(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(needle)) results.push(file);
  });
  return results;
}

function walk(dir: string, visit: (file: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', '.next', 'node_modules', 'playwright-report', 'test-results'].includes(entry.name)) continue;
      // Skip stale TS build outputs under scripts/temp/ — gitignored, not source.
      if (entry.name === 'temp' && /\/scripts\/?$/.test(dir)) continue;
      walk(fullPath, visit);
    } else if (entry.isFile()) {
      visit(fullPath);
    }
  }
}

function shouldSkip(file: string): boolean {
  return [
    '.png', '.jpg', '.jpeg', '.webp', '.zip', '.xlsx', '.pdf', '.ico', '.DS_Store',
  ].some(ext => file.endsWith(ext));
}

function isCodeFile(file: string): boolean {
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].some(ext => file.endsWith(ext));
}

async function main() {
  assertSingleUserAgentDefinition();
  assertMygrantDomainGuard();
  assertStandardStatusParsing();
  assertReturnCodeParsing();
  await assertHeader();
  assertScoringGuard();
  console.log('[mygrant] Client guard passed.');
}

function assertScoringGuard() {
  const result = spawnSync('npx', ['tsx', 'scripts/verify-mygrant-scoring.ts'], {
    cwd: ROOT,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`Mygrant scoring guard failed:\n${result.stdout}${result.stderr}`);
  }
}

main().catch(error => {
  console.error('[mygrant] Client guard failed:', error.message);
  process.exit(1);
});
