/**
 * POST /api/admin/parse-invoice
 *
 * Accepts up to 5 Omega invoice screenshots (PNG/JPG).
 * Uses Gemini 2.5 Flash to extract structured invoice data from each image.
 * Returns parsed invoice objects for preview before import.
 *
 * 5-layer defense for reliable JSON parsing:
 *   1. responseSchema — token-level constrained decoding
 *   2. maxOutputTokens — prevents thinking-token truncation
 *   3. Preprocessing — strips markdown fences, extracts JSON
 *   4. JSON.parse → jsonrepair fallback
 *   5. Retry with exponential backoff (1 retry on failure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_RETRIES = 1;

export interface ParsedInvoice {
  // Source
  source_filename: string;

  // Job info
  job_number: string;
  invoice_date: string;       // YYYY-MM-DD
  job_type: string;           // Mobile, Shop, etc.
  scheduled_date: string;     // YYYY-MM-DD

  // Customer
  customer_name: string;
  customer_phone: string;     // raw, normalized during import
  customer_email: string;
  customer_address: string;

  // Vehicle
  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vin: string;

  // Line items
  line_items: {
    part_number: string;
    description: string;
    list_price: number;
    cost: number;
  }[];

  // Financials
  subtotal: number;
  tax_amount: number;
  total: number;
  balance: number;

  // Payment
  payment_method: string;
  payment_reference: string;

  // Parse status
  parse_error?: string;
}

// Layer 1: Schema-enforced structured output
const INVOICE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    job_number: { type: SchemaType.STRING },
    invoice_date: { type: SchemaType.STRING, description: 'YYYY-MM-DD format' },
    job_type: { type: SchemaType.STRING },
    scheduled_date: { type: SchemaType.STRING, description: 'YYYY-MM-DD format' },
    customer_name: { type: SchemaType.STRING },
    customer_phone: { type: SchemaType.STRING, description: 'Raw digits/format as shown' },
    customer_email: { type: SchemaType.STRING },
    customer_address: { type: SchemaType.STRING },
    vehicle_year: { type: SchemaType.INTEGER },
    vehicle_make: { type: SchemaType.STRING },
    vehicle_model: { type: SchemaType.STRING },
    vin: { type: SchemaType.STRING },
    line_items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          part_number: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          list_price: { type: SchemaType.NUMBER },
          cost: { type: SchemaType.NUMBER },
        },
        required: ['part_number', 'description', 'list_price', 'cost'],
      },
    },
    subtotal: { type: SchemaType.NUMBER },
    tax_amount: { type: SchemaType.NUMBER },
    total: { type: SchemaType.NUMBER },
    balance: { type: SchemaType.NUMBER },
    payment_method: { type: SchemaType.STRING },
    payment_reference: { type: SchemaType.STRING },
  },
  required: [
    'job_number', 'invoice_date', 'job_type', 'scheduled_date',
    'customer_name', 'customer_phone', 'customer_email', 'customer_address',
    'vehicle_year', 'vehicle_make', 'vehicle_model', 'vin',
    'line_items', 'subtotal', 'tax_amount', 'total', 'balance',
    'payment_method', 'payment_reference',
  ],
};

const EXTRACT_PROMPT = `You are extracting structured data from a Pink Auto Glass invoice screenshot.

Return ONLY valid JSON matching the provided schema.

Rules:
- All numbers must be actual numbers (not strings)
- Dates must be YYYY-MM-DD format
- If a field is not visible, use empty string or 0
- Do not include $ signs in numbers
- Include ALL line items shown on the invoice`;

// Layer 3: Preprocessing — clean raw LLM response before parsing
function cleanLLMResponse(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  // Extract the top-level JSON object using bracket-depth counting
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    let endBrace = -1;
    for (let i = firstBrace; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { endBrace = i; break; } }
    }
    if (endBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, endBrace + 1);
    }
  }
  // Remove control characters (except newlines/tabs which are valid in JSON strings)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  return cleaned;
}

// Layer 5: Retry with exponential backoff + jitter
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function parseInvoiceWithRetry(
  model: any,
  file: File,
): Promise<ParsedInvoice> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const mimeType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  const content = [
    { inlineData: { mimeType, data: base64 } },
    EXTRACT_PROMPT,
  ];

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const backoff = 1000 * Math.pow(2, attempt - 1) + Math.random() * 500;
        console.log(`Retry ${attempt} for ${file.name}, waiting ${Math.round(backoff)}ms`);
        await delay(backoff);
      }

      const result = await model.generateContent(content);
      const rawText = result.response.text();
      const finishReason = result.response.candidates?.[0]?.finishReason;

      console.log(`Gemini response for ${file.name}: ${rawText.length} chars, finishReason=${finishReason}`);

      // Check for truncation
      if (finishReason && finishReason !== 'STOP') {
        if (attempt < MAX_RETRIES) {
          console.warn(`Non-STOP finish reason "${finishReason}" for ${file.name}, retrying...`);
          lastError = new Error(`Response truncated (finishReason: ${finishReason})`);
          continue;
        }
        // Last attempt — don't silently accept truncated data
        throw new Error(`Response truncated on final attempt (finishReason: ${finishReason})`);
      }

      // Layer 3: Preprocess
      const cleaned = cleanLLMResponse(rawText);

      // Layer 4: Parse with jsonrepair fallback
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr: any) {
        console.error(`JSON.parse failed for ${file.name}:`, parseErr.message);
        try {
          parsed = JSON.parse(jsonrepair(cleaned));
          console.log(`jsonrepair succeeded for ${file.name}`);
        } catch (repairErr: any) {
          console.error(`jsonrepair also failed for ${file.name}:`, repairErr.message);
          // If we have retries left, try again
          if (attempt < MAX_RETRIES) {
            lastError = new Error(`Failed to parse JSON: ${parseErr.message}`);
            continue;
          }
          throw new Error(`Failed to parse JSON: ${parseErr.message}. Raw text: ${rawText.substring(0, 200)}`);
        }
      }

      return { ...parsed, source_filename: file.name };

    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.warn(`Attempt ${attempt + 1} failed for ${file.name}: ${err.message}`);
        continue;
      }
    }
  }

  // All retries exhausted
  console.error(`All attempts failed for ${file.name}:`, lastError?.message);
  return {
    source_filename: file.name,
    job_number: '',
    invoice_date: '',
    job_type: '',
    scheduled_date: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    vehicle_year: 0,
    vehicle_make: '',
    vehicle_model: '',
    vin: '',
    line_items: [],
    subtotal: 0,
    tax_amount: 0,
    total: 0,
    balance: 0,
    payment_method: '',
    payment_reference: '',
    parse_error: lastError?.message || 'Unknown error',
  };
}

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

    // Validate all files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PNG/JPG allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} exceeds 10MB limit` },
          { status: 400 }
        );
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: INVOICE_SCHEMA,  // Layer 1: token-level schema enforcement
        maxOutputTokens: 8192,           // Layer 2: prevent thinking-token truncation
      },
    });

    // Parse each image in parallel with retry
    const results = await Promise.all(
      files.map(file => parseInvoiceWithRetry(model, file))
    );

    const successful = results.filter(r => !r.parse_error).length;
    const failed = results.filter(r => r.parse_error).length;

    console.log(`Invoice parse: ${successful} succeeded, ${failed} failed`);

    return NextResponse.json({
      ok: true,
      invoices: results,
      summary: { successful, failed, total: results.length },
    });

  } catch (error: any) {
    console.error('parse-invoice error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
