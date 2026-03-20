/**
 * POST /api/admin/roster-audit
 *
 * Accepts an Omega Accounts Aging Detail export (XLSX/CSV preferred)
 * or screenshot(s) as fallback. Cross-references job numbers against
 * omega_installs to find which invoices haven't been uploaded yet.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { jsonrepair } from 'jsonrepair';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const SPREADSHEET_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv',
];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...SPREADSHEET_TYPES];

interface RosterEntry {
  job_number: string;
  customer_name: string;
  amount: number;
  vin: string;
}

// --- Spreadsheet parsing (XLSX/CSV) ---

const REQUIRED_COLUMNS = ['Invoice #', 'Customer Name', 'Open Balance', 'VIN'];

function parseSpreadsheet(buffer: ArrayBuffer): RosterEntry[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // The Omega export has an empty first row — find the actual header row
  const rawRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  let headerIdx = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    if (rawRows[i].some((cell: any) => String(cell).includes('Invoice #'))) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) {
    throw new Error('Could not find header row with "Invoice #" column. Is this an Omega Accounts Aging Detail export?');
  }

  // Re-parse with correct header row
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
    range: headerIdx,
  });

  if (rows.length === 0) {
    throw new Error('Spreadsheet has a header row but no data rows.');
  }

  // Validate required columns exist
  const headers = Object.keys(rows[0]);
  const missingCols = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
  if (missingCols.length > 0) {
    throw new Error(`Missing required columns: ${missingCols.join(', ')}. Found: ${headers.join(', ')}`);
  }

  console.log(`Spreadsheet: header at row ${headerIdx}, ${rows.length} data rows, columns: ${headers.join(', ')}`);

  const entries: RosterEntry[] = [];
  const seenJobNumbers = new Set<string>();

  for (const row of rows) {
    const jobNumber = String(row['Invoice #'] || '').trim();
    if (!jobNumber || !/^\d+$/.test(jobNumber)) continue; // skip non-numeric / summary rows

    // Deduplicate within same upload
    if (seenJobNumbers.has(jobNumber)) continue;
    seenJobNumbers.add(jobNumber);

    const customerName = String(row['Customer Name'] || '').trim();
    const vin = String(row['VIN'] || '').trim();

    // Open Balance is the amount, formatted like -289.00 or " $(1,023.27)"
    const rawAmount = String(row['Open Balance'] || row['Amount'] || '0');
    const amount = Math.abs(parseFloat(rawAmount.replace(/[$,()]/g, '').trim()) || 0);

    entries.push({ job_number: jobNumber, customer_name: customerName, amount, vin });
  }

  return entries;
}

// --- Screenshot parsing (Gemini Vision fallback) ---

const EXTRACT_PROMPT = `You are extracting job data from an Omega EDI "Accounts Aging Detail" report screenshot.

Return ONLY valid JSON with this structure:
{
  "row_count": number,
  "entries": [
    {
      "job_number": "string (the 5-digit number in the second column, e.g. 10236)",
      "customer_name": "string (the rightmost name column — keep each name on its own row, do NOT shift names between rows)",
      "amount": number (the dollar amount in parentheses, no $ sign, as a positive number),
      "vin": "string (the VIN column, 17-character alphanumeric code)"
    }
  ]
}

CRITICAL RULES:
- EVERY row must be extracted — count them carefully. The row_count field must match entries.length.
- Pay special attention to the LAST row at the bottom of the screenshot — it is easy to miss. If a row is partially visible, still extract it.
- Each row's data must stay aligned — do NOT mix up customer names, amounts, or VINs between rows.
- Read the table left-to-right for each row: date | job_number | type | amount1 | amount2 | payment | status | VIN | customer_name
- job_number is the clickable 5-digit number (e.g. 10236, 10239)
- amount is the dollar value shown in parentheses like "$ (289.00)" → 289.00
- If a field is not visible or partially cut off, use empty string or 0 — but still include the row
- Do NOT include header rows, totals, or summary rows at the bottom (rows with no job number)
- Return the raw JSON object, no markdown, no explanation`;

async function parseScreenshots(files: File[]): Promise<RosterEntry[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const allEntries: RosterEntry[] = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const result = await model.generateContent([
      { inlineData: { mimeType: file.type, data: base64 } },
      EXTRACT_PROMPT,
    ]);

    const rawText = result.response.text();
    console.log(`Roster parse for ${file.name}:`, rawText.substring(0, 300));

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.log('Attempting jsonrepair for roster...');
      parsed = JSON.parse(jsonrepair(rawText));
    }

    const entries: RosterEntry[] = Array.isArray(parsed) ? parsed : (parsed.entries || []);
    if (parsed.row_count && parsed.row_count !== entries.length) {
      console.warn(`Roster row_count mismatch: declared ${parsed.row_count}, got ${entries.length} entries`);
    }
    allEntries.push(...entries.filter((e: RosterEntry) => e.job_number));
  }

  return allEntries;
}

// --- Main handler ---

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files per upload` },
        { status: 400 }
      );
    }

    // Classify each file as spreadsheet or image
    const spreadsheetFiles: File[] = [];
    const imageFiles: File[] = [];

    for (const file of files) {
      const ext = file.name.toLowerCase().split('.').pop();
      const isSheet = SPREADSHEET_TYPES.includes(file.type) || ['xlsx', 'xls', 'csv'].includes(ext || '');
      const isImage = IMAGE_TYPES.includes(file.type);

      if (!isSheet && !isImage) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Accepts XLSX, CSV, PNG, or JPG.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (isSheet) spreadsheetFiles.push(file);
      else imageFiles.push(file);
    }

    // Reject mixed uploads — must be all spreadsheets or all images
    if (spreadsheetFiles.length > 0 && imageFiles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot mix spreadsheet and image files. Upload either an XLSX/CSV or screenshot(s), not both.' },
        { status: 400 }
      );
    }

    // Spreadsheets: accept only one file
    if (spreadsheetFiles.length > 1) {
      return NextResponse.json(
        { error: 'Upload one spreadsheet file at a time.' },
        { status: 400 }
      );
    }

    let allEntries: RosterEntry[];
    let source: 'spreadsheet' | 'screenshot';

    if (spreadsheetFiles.length === 1) {
      source = 'spreadsheet';
      const buffer = await spreadsheetFiles[0].arrayBuffer();
      allEntries = parseSpreadsheet(buffer);
      console.log(`Roster spreadsheet parsed: ${allEntries.length} entries from ${spreadsheetFiles[0].name}`);
    } else {
      source = 'screenshot';
      allEntries = await parseScreenshots(imageFiles);
    }

    if (allEntries.length === 0) {
      return NextResponse.json(
        { error: 'No job numbers found in the uploaded file' },
        { status: 400 }
      );
    }

    // Cross-reference against omega_installs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const jobNumbers = allEntries.map(e => e.job_number);
    const omegaIds = jobNumbers.map(jn => `upload_${jn}`);

    // Supabase .in() has a limit — batch if needed
    const batchSize = 100;
    const existingIds = new Set<string>();
    for (let i = 0; i < omegaIds.length; i += batchSize) {
      const batch = omegaIds.slice(i, i + batchSize);
      const { data } = await supabase
        .from('omega_installs')
        .select('omega_invoice_id')
        .in('omega_invoice_id', batch);
      for (const r of data || []) {
        existingIds.add(r.omega_invoice_id);
      }
    }

    const missing = allEntries.filter(e => !existingIds.has(`upload_${e.job_number}`));
    const found = allEntries.filter(e => existingIds.has(`upload_${e.job_number}`));

    console.log(`Roster audit (${source}): ${allEntries.length} total, ${found.length} already uploaded, ${missing.length} missing`);

    return NextResponse.json({
      ok: true,
      source,
      total: allEntries.length,
      uploaded: found.length,
      missing,
    });
  } catch (error: any) {
    console.error('roster-audit error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
