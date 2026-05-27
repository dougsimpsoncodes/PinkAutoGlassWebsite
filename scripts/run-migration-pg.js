#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) process.env[key] = value.replace(/\\n$/, '');
  }
}

const root = path.join(__dirname, '..');
loadEnv(path.join(root, '.env.local'));
loadEnv(path.join(root, '.env.local.service'));

const connectionString = process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('POSTGRES_URL not found in .env.local or .env.local.service.');
  process.exit(1);
}

function resolveMigrationPath(inputPath) {
  const migrationsDir = fs.realpathSync(path.resolve(root, 'supabase', 'migrations'));
  const candidate = path.isAbsolute(inputPath) ? inputPath : `${process.cwd()}${path.sep}${inputPath}`;

  if (!fs.existsSync(candidate)) {
    throw new Error(`Migration file not found: ${candidate}`);
  }

  const resolved = fs.realpathSync(candidate);
  const relative = path.relative(migrationsDir, resolved);

  if (relative.startsWith('..') || path.isAbsolute(relative) || !resolved.endsWith('.sql')) {
    throw new Error(`Migration path must be a .sql file inside ${migrationsDir}`);
  }

  return resolved;
}

async function main() {
  const migrationArg = process.argv[2] || 'supabase/migrations/20251027_create_analytics_tables.sql';
  const migrationPath = resolveMigrationPath(path.isAbsolute(migrationArg) ? migrationArg : path.join(process.cwd(), migrationArg));

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 5000,
  });

  await client.connect();

  try {
    const connectionInfo = await client.query('SELECT current_database(), current_user');
    console.log('Database:', connectionInfo.rows[0].current_database);
    console.log('User:', connectionInfo.rows[0].current_user);

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`Running migration: ${path.basename(migrationPath)}`);
    const migrationQuery = Object.create(null);
    migrationQuery.text = sql;
    migrationQuery.values = [];
    await client.query(migrationQuery);
    console.log('Migration completed successfully.');
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
