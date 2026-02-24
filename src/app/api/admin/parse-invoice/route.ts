/**
 * POST /api/admin/parse-invoice
 *
 * Accepts up to 5 Omega invoice screenshots (PNG/JPG).
 * Uses Claude Vision to extract structured invoice data from each image.
 * Returns parsed invoice objects for preview before import.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

const EXTRACT_PROMPT = `You are extracting structured data from a Pink Auto Glass invoice screenshot.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "job_number": "string",
  "invoice_date": "YYYY-MM-DD",
  "job_type": "string",
  "scheduled_date": "YYYY-MM-DD",
  "customer_name": "string",
  "customer_phone": "string (raw digits/format as shown)",
  "customer_email": "string (empty string if blank)",
  "customer_address": "string",
  "vehicle_year": number,
  "vehicle_make": "string",
  "vehicle_model": "string",
  "vin": "string",
  "line_items": [
    {
      "part_number": "string",
      "description": "string",
      "list_price": number,
      "cost": number
    }
  ],
  "subtotal": number,
  "tax_amount": number,
  "total": number,
  "balance": number,
  "payment_method": "string",
  "payment_reference": "string"
}

Rules:
- All numbers must be actual numbers (not strings)
- Dates must be YYYY-MM-DD format
- If a field is not visible, use empty string or 0
- Do not include $ signs in numbers
- Include ALL line items shown on the invoice`;

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

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Parse each image in parallel
    const parsePromises = files.map(async (file): Promise<ParsedInvoice> => {
      try {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: EXTRACT_PROMPT,
                },
              ],
            },
          ],
        });

        const raw = message.content[0].type === 'text'
          ? message.content[0].text
          : '';

        // Strip markdown code fences if Claude wraps the JSON
        const responseText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

        const parsed = JSON.parse(responseText);
        return { ...parsed, source_filename: file.name };

      } catch (err: any) {
        console.error(`Failed to parse ${file.name}:`, err.message);
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
          parse_error: err.message,
        };
      }
    });

    const results = await Promise.all(parsePromises);

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
