#!/usr/bin/env -S npx tsx
/**
 * Interactive local setup for Mygrant API environment variables.
 *
 * This writes to .env.local, which is gitignored. Sensitive values are masked
 * during entry and are never printed back to the terminal.
 *
 * Usage:
 *   npx tsx scripts/setup-mygrant-env.ts
 *   npx tsx scripts/setup-mygrant-env.ts --check
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

interface EnvSpec {
  key: string;
  label: string;
  defaultValue?: string;
  sensitive?: boolean;
  required?: boolean;
  normalize?: (value: string) => string;
  validate?: (value: string) => string | null;
}

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');
const REQUIRED_KEYS = [
  'MYGRANT_AUTH_TOKEN',
  'MYGRANT_CUSTOMER_ID',
  'MYGRANT_WEB_USER_ID',
  'MYGRANT_PASSWORD',
  'MYGRANT_CUSTOMER_CONTACT',
  'MYGRANT_ENVIRONMENT',
];

const specs: EnvSpec[] = [
  {
    key: 'MYGRANT_AUTH_TOKEN',
    label: 'Mygrant API auth token',
    sensitive: true,
    required: true,
    validate: value => value.length >= 20 ? null : 'Token looks too short.',
  },
  {
    key: 'MYGRANT_CUSTOMER_ID',
    label: 'Mygrant customer ID',
    defaultValue: 'C038742-001',
    required: true,
    normalize: value => value.toUpperCase(),
    validate: value => /^C\d{6}-\d{3}$/i.test(value) ? null : 'Expected a value like C038742-001.',
  },
  {
    key: 'MYGRANT_WEB_USER_ID',
    label: 'Mygrant web user ID',
    defaultValue: 'dshikiar@yahoo.com',
    required: true,
    normalize: value => value.toLowerCase(),
    validate: value => value.includes('@') ? null : 'Expected an email-style web user ID.',
  },
  {
    key: 'MYGRANT_PASSWORD',
    label: 'Mygrant web login password',
    sensitive: true,
    required: true,
    validate: value => value.length >= 4 ? null : 'Password must be at least 4 characters.',
  },
  {
    key: 'MYGRANT_CUSTOMER_CONTACT',
    label: 'Mygrant customer contact',
    defaultValue: 'dshikiar@yahoo.com',
    required: false,
    normalize: value => value.toLowerCase(),
  },
  {
    key: 'MYGRANT_ENVIRONMENT',
    label: 'Mygrant environment',
    defaultValue: 'TEST',
    required: true,
    normalize: value => value.toUpperCase(),
    validate: value => value === 'TEST' || value === 'PROD' ? null : 'Use TEST or PROD.',
  },
];

async function main() {
  if (process.argv.includes('--check')) {
    printCheck(readEnvFile(ENV_PATH));
    return;
  }

  console.log('Mygrant environment setup');
  console.log(`Target: ${ENV_PATH}`);
  console.log('Sensitive values are hidden while typing and will not be printed.\n');

  const current = readEnvFile(ENV_PATH);
  const updates: Record<string, string> = {};
  const rl = readline.createInterface({ input, output });

  try {
    for (const spec of specs) {
      const existing = current.values[spec.key];
      const value = await promptForSpec(rl, spec, existing);
      if (value !== undefined) updates[spec.key] = value;
    }
  } finally {
    rl.close();
  }

  writeEnvFile(ENV_PATH, current.lines, updates);
  console.log('\nSaved Mygrant settings to .env.local.');
  printCheck(readEnvFile(ENV_PATH));
  console.log('\nNext test:');
  console.log('  npx tsx scripts/mygrant-inquiry-smoke.ts --vehicle-year=2020 --vehicle-make=Toyota --vehicle-model=Camry');
}

async function promptForSpec(
  rl: readline.Interface,
  spec: EnvSpec,
  existing?: string
): Promise<string | undefined> {
  const existingLabel = existing ? ' [currently set; press Enter to keep]' : '';
  const defaultLabel = !existing && spec.defaultValue ? ` [default: ${spec.defaultValue}]` : '';

  while (true) {
    const raw = spec.sensitive
      ? await promptHidden(`${spec.label}${existingLabel}${defaultLabel}: `)
      : await rl.question(`${spec.label}${existingLabel}${defaultLabel}: `);

    let value = raw.trim();
    if (!value && existing) return existing;
    if (!value && spec.defaultValue) value = spec.defaultValue;
    if (!value && !spec.required) return '';
    if (!value) {
      console.log(`${spec.label} is required.`);
      continue;
    }

    value = spec.normalize ? spec.normalize(value) : value;
    const validationError = spec.validate?.(value);
    if (validationError) {
      console.log(validationError);
      continue;
    }

    return value;
  }
}

async function promptHidden(prompt: string): Promise<string> {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    const rl = readline.createInterface({ input, output });
    try {
      return await rl.question(prompt);
    } finally {
      rl.close();
    }
  }

  return new Promise((resolve, reject) => {
    let value = '';
    output.write(prompt);
    input.setRawMode(true);
    input.resume();

    const cleanup = () => {
      input.setRawMode(false);
      input.off('data', onData);
      output.write('\n');
    };

    const onData = (chunk: Buffer) => {
      const text = chunk.toString('utf8');

      if (text === '\u0003') {
        cleanup();
        reject(new Error('Setup cancelled.'));
        return;
      }

      if (text === '\r' || text === '\n') {
        cleanup();
        resolve(value);
        return;
      }

      if (text === '\u007f' || text === '\b') {
        if (value.length > 0) {
          value = value.slice(0, -1);
          output.write('\b \b');
        }
        return;
      }

      for (const char of text) {
        if (char >= ' ' && char !== '\u007f') {
          value += char;
          output.write('*');
        }
      }
    };

    input.on('data', onData);
  });
}

function readEnvFile(filePath: string): { lines: string[]; values: Record<string, string> } {
  if (!fs.existsSync(filePath)) return { lines: [], values: {} };
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  const values: Record<string, string> = {};

  for (const line of lines) {
    const parsed = parseEnvLine(line);
    if (parsed) values[parsed.key] = parsed.value;
  }

  return { lines, values };
}

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (!match) return null;

  return {
    key: match[1],
    value: unquoteEnvValue(match[2].trim()),
  };
}

function writeEnvFile(filePath: string, existingLines: string[], updates: Record<string, string>) {
  const nextLines = existingLines.length ? [...existingLines] : [];
  const seen = new Set<string>();

  for (let index = 0; index < nextLines.length; index += 1) {
    const parsed = parseEnvLine(nextLines[index]);
    if (!parsed || !(parsed.key in updates)) continue;
    nextLines[index] = `${parsed.key}=${formatEnvValue(updates[parsed.key])}`;
    seen.add(parsed.key);
  }

  const missingUpdates = Object.entries(updates).filter(([key]) => !seen.has(key));
  if (missingUpdates.length > 0) {
    if (nextLines.length > 0 && nextLines[nextLines.length - 1].trim() !== '') {
      nextLines.push('');
    }
    nextLines.push('# Mygrant API');
    for (const [key, value] of missingUpdates) {
      nextLines.push(`${key}=${formatEnvValue(value)}`);
    }
  }

  fs.writeFileSync(filePath, `${nextLines.join('\n').replace(/\n+$/, '')}\n`, { mode: 0o600 });
}

function formatEnvValue(value: string): string {
  if (/^[A-Za-z0-9_@./+=:-]*$/.test(value)) return value;
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')}"`;
}

function unquoteEnvValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function printCheck(env: { values: Record<string, string> }) {
  console.log('\nMygrant env status:');
  for (const key of REQUIRED_KEYS) {
    console.log(`  ${key}: ${env.values[key] ? 'present' : 'missing'}`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
