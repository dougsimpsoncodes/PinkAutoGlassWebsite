#!/usr/bin/env node
/**
 * Run a Supabase migration via the Management API.
 *
 * Why: the existing scripts/run-migration.js connects via POSTGRES_URL
 * which currently points at a stale project ref. The Management API uses
 * the live project's REST URL to derive the project ref and authenticates
 * via the Personal Access Token at ~/.supabase/access-token.
 *
 * Usage:
 *   node scripts/run-migration-via-api.js supabase/migrations/<file>.sql
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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
    if (!process.env[key]) process.env[key] = val;
  }
}

const root = path.join(__dirname, '..');
loadEnv(path.join(root, '.env.local'));

// Derive the live project ref from NEXT_PUBLIC_SUPABASE_URL — never trust POSTGRES_URL,
// it's been observed to point at stale projects.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}
const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!projectRefMatch) {
  console.error(`❌ Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  process.exit(1);
}
const projectRef = projectRefMatch[1];

// Read PAT from the Supabase CLI's standard location
const tokenPath = path.join(os.homedir(), '.supabase', 'access-token');
if (!fs.existsSync(tokenPath)) {
  console.error(`❌ Supabase access token not found at ${tokenPath}`);
  console.error('   Run: supabase login');
  process.exit(1);
}
const accessToken = fs.readFileSync(tokenPath, 'utf8').trim();
if (!accessToken) {
  console.error(`❌ ${tokenPath} is empty`);
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error('❌ Usage: node scripts/run-migration-via-api.js <path-to-sql-file>');
  process.exit(1);
}
const sqlPath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
if (!fs.existsSync(sqlPath)) {
  console.error(`❌ File not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const fileName = path.basename(sqlPath);

(async () => {
  console.log(`\n🔄 Applying via Management API: ${fileName}`);
  console.log(`   project: ${projectRef}`);
  console.log(`   sql:     ${sql.length} bytes`);

  const url = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }

  if (!res.ok) {
    console.error(`\n❌ HTTP ${res.status} ${res.statusText}`);
    console.error('   response:', JSON.stringify(parsed, null, 2));
    process.exit(1);
  }

  console.log(`\n✅ Applied: ${fileName}`);
  console.log('   response:', JSON.stringify(parsed, null, 2));
})().catch((e) => {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
});
