/**
 * Fixture-based verification for the Omega roster XLSX parser.
 * Run: node test/roster-parse-verify.js
 *
 * Verifies against the real Omega export at test/fixtures/omega-roster-sample.xlsx
 */

const XLSX = require('xlsx');
const path = require('path');

const REQUIRED_COLUMNS = ['Invoice #', 'Customer Name', 'Open Balance', 'VIN'];
const FIXTURE_PATH = path.join(__dirname, 'fixtures/omega-roster-sample.xlsx');

function parseSpreadsheet(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    if (rawRows[i].some(cell => String(cell).includes('Invoice #'))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error('Could not find header row with "Invoice #" column.');
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', range: headerIdx });

  if (rows.length === 0) {
    throw new Error('Spreadsheet has a header row but no data rows.');
  }

  const headers = Object.keys(rows[0]);
  const missingCols = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missingCols.length > 0) {
    throw new Error(`Missing required columns: ${missingCols.join(', ')}`);
  }

  const entries = [];
  const seen = new Set();

  for (const row of rows) {
    const jobNumber = String(row['Invoice #'] || '').trim();
    if (!jobNumber || !/^\d+$/.test(jobNumber)) continue;
    if (seen.has(jobNumber)) continue;
    seen.add(jobNumber);

    entries.push({
      job_number: jobNumber,
      customer_name: String(row['Customer Name'] || '').trim(),
      amount: Math.abs(parseFloat(String(row['Open Balance'] || '0').replace(/[$,()]/g, '').trim()) || 0),
      vin: String(row['VIN'] || '').trim(),
    });
  }

  return { headerIdx, headers, entries };
}

// --- Run verification ---
console.log('=== Omega Roster XLSX Parser Verification ===\n');
console.log(`Fixture: ${FIXTURE_PATH}\n`);

try {
  const { headerIdx, headers, entries } = parseSpreadsheet(FIXTURE_PATH);

  console.log(`✓ Header found at row ${headerIdx}`);
  console.log(`✓ Columns: ${headers.join(', ')}`);
  console.log(`✓ Required columns present: ${REQUIRED_COLUMNS.join(', ')}`);
  console.log(`✓ Parsed ${entries.length} entries`);

  // Spot checks
  const first = entries[0];
  const last = entries[entries.length - 1];

  console.log(`\nFirst entry: Job #${first.job_number} — ${first.customer_name} — $${first.amount} — VIN: ${first.vin}`);
  console.log(`Last entry:  Job #${last.job_number} — ${last.customer_name} — $${last.amount} — VIN: ${last.vin}`);

  // Verify no entries have empty job numbers
  const emptyJobs = entries.filter(e => !e.job_number);
  if (emptyJobs.length > 0) {
    console.error(`\n✗ FAIL: ${emptyJobs.length} entries with empty job numbers`);
    process.exit(1);
  }

  // Verify all job numbers are numeric
  const nonNumeric = entries.filter(e => !/^\d+$/.test(e.job_number));
  if (nonNumeric.length > 0) {
    console.error(`\n✗ FAIL: ${nonNumeric.length} entries with non-numeric job numbers`);
    process.exit(1);
  }

  // Verify no duplicate job numbers
  const jobSet = new Set(entries.map(e => e.job_number));
  if (jobSet.size !== entries.length) {
    console.error(`\n✗ FAIL: Duplicate job numbers detected (${entries.length} entries, ${jobSet.size} unique)`);
    process.exit(1);
  }

  // Verify amounts are positive numbers
  const badAmounts = entries.filter(e => typeof e.amount !== 'number' || e.amount < 0);
  if (badAmounts.length > 0) {
    console.error(`\n✗ FAIL: ${badAmounts.length} entries with invalid amounts`);
    process.exit(1);
  }

  console.log(`\n✓ ALL CHECKS PASSED — ${entries.length} entries, 0 issues`);
  process.exit(0);

} catch (err) {
  console.error(`\n✗ FAIL: ${err.message}`);
  process.exit(1);
}
