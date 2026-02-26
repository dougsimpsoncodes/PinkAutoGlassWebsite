#!/usr/bin/env node
/**
 * Supabase Migration Runner
 * Connects directly via POSTGRES_URL (IPv4 pooler) using node-postgres.
 * No CLI linking, no IPv6, no PAT needed.
 *
 * Usage:
 *   node scripts/run-migration.js supabase/migrations/20260226_add_insurance_carrier.sql
 *   node scripts/run-migration.js  (runs all .sql files in supabase/migrations/ in order)
 *
 * Reads POSTGRES_URL from .env.local.service (or .env.local)
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load a .env file into process.env (skip if not present)
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    val = val.replace(/\\n$/, ''); // Strip literal \n corruption
    if (!process.env[key]) process.env[key] = val;
  }
}

const root = path.join(__dirname, '..');
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, '.env.local.service'));

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('❌ POSTGRES_URL not found in .env.local or .env.local.service');
  process.exit(1);
}

// Parse connection string into individual params to avoid URL parsing issues with special chars
function parseConnectionString(url) {
  const u = new URL(url);
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: parseInt(u.port) || 5432,
    database: u.pathname.replace(/^\//, ''),
    ssl: { rejectUnauthorized: false },
  };
}

async function runMigrationFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  console.log(`\n🔄 Applying: ${fileName}`);

  const client = new Client(parseConnectionString(connectionString));
  await client.connect();

  try {
    await client.query(sql);
    console.log(`✅ Applied: ${fileName}`);
  } catch (err) {
    console.error(`❌ Failed: ${fileName}`);
    console.error(`   ${err.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

async function runAllMigrations() {
  const migrationsDir = path.join(root, 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  console.log(`Found ${files.length} migration file(s).`);
  for (const file of files) {
    await runMigrationFile(path.join(migrationsDir, file));
  }
  console.log('\n✅ Done.');
}

const arg = process.argv[2];
if (arg) {
  const filePath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
  runMigrationFile(filePath);
} else {
  runAllMigrations();
}
