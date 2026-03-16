/**
 * POST /api/admin/import-invoices
 *
 * Accepts confirmed parsed invoice data, upserts into omega_installs,
 * then runs lead matching and revenue backfill RPCs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ParsedInvoice } from '../parse-invoice/route';
import { runOmegaCleanup } from '@/lib/omega/data-cleanup';
import { scheduleReviewRequest } from '@/lib/drip/scheduler';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizePhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

function computeCosts(lineItems: ParsedInvoice['line_items']): { parts_cost: number; labor_cost: number } {
  // Labor line items typically have no part number or are "Remove And Install"
  const LABOR_KEYWORDS = ['remove and install', 'labor', 'installation', 'r&i'];
  let parts_cost = 0;
  let labor_cost = 0;
  for (const item of lineItems) {
    const desc = item.description.toLowerCase();
    if (LABOR_KEYWORDS.some(k => desc.includes(k))) {
      labor_cost += item.cost;
    } else {
      parts_cost += item.cost;
    }
  }
  return { parts_cost, labor_cost };
}

export async function POST(request: NextRequest) {
  try {
    const { invoices } = await request.json() as { invoices: ParsedInvoice[] };

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices provided' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const invoice of invoices) {
      if (invoice.parse_error || !invoice.job_number) {
        results.skipped++;
        continue;
      }

      try {
        const phone = normalizePhone(invoice.customer_phone);
        const { parts_cost, labor_cost } = computeCosts(invoice.line_items);

        const { error } = await supabase
          .from('omega_installs')
          .upsert({
            omega_invoice_id: `upload_${invoice.job_number}`,
            customer_name: invoice.customer_name || null,
            customer_email: invoice.customer_email || null,
            customer_phone: phone,
            install_date: invoice.invoice_date || new Date().toISOString(),
            invoice_number: invoice.job_number,
            job_type: invoice.job_type || null,
            vehicle_year: invoice.vehicle_year || null,
            vehicle_make: invoice.vehicle_make || null,
            vehicle_model: invoice.vehicle_model || null,
            vin: invoice.vin || null,
            parts_cost: parts_cost || null,
            labor_cost: labor_cost || null,
            tax_amount: invoice.tax_amount || null,
            total_revenue: invoice.total,
            payment_method: invoice.payment_method || null,
            payment_status: invoice.balance === 0 ? 'paid' : 'partial',
            status: 'completed',
            raw_data: {
              source: 'manual_upload',
              source_filename: invoice.source_filename,
              scheduled_date: invoice.scheduled_date,
              customer_address: invoice.customer_address,
              line_items: invoice.line_items,
              subtotal: invoice.subtotal,
              balance: invoice.balance,
              payment_reference: invoice.payment_reference,
            },
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'omega_invoice_id' });

        if (error) {
          results.errors.push(`Job ${invoice.job_number}: ${error.message}`);
        } else {
          results.imported++;
        }
      } catch (err: any) {
        results.errors.push(`Job ${invoice.job_number}: ${err.message}`);
      }
    }

    // Run lead matching
    let matched = 0;
    try {
      const { error: matchError } = await supabase.rpc('match_omega_to_leads');
      if (matchError) {
        console.error('Lead matching failed:', matchError.message);
      } else {
        // Count only from this batch of uploaded invoice IDs
        const uploadIds = invoices
          .filter(inv => !inv.parse_error && inv.job_number)
          .map(inv => `upload_${inv.job_number}`);
        const { count } = await supabase
          .from('omega_installs')
          .select('id', { count: 'exact', head: true })
          .in('omega_invoice_id', uploadIds)
          .not('matched_lead_id', 'is', null);
        matched = count || 0;
      }
    } catch (err: any) {
      console.error('match_omega_to_leads error:', err.message);
    }

    // Run revenue backfill
    try {
      await supabase.rpc('fn_backfill_lead_revenue');
    } catch (err: any) {
      console.error('fn_backfill_lead_revenue error:', err.message);
    }

    const batchIds = invoices
      .filter(inv => !inv.parse_error && inv.job_number)
      .map(inv => `upload_${inv.job_number}`);

    // Get unmatched jobs from this batch
    const { data: unmatched } = await supabase
      .from('omega_installs')
      .select('invoice_number, customer_name, customer_phone, total_revenue')
      .in('omega_invoice_id', batchIds)
      .is('matched_lead_id', null)
      .order('updated_at', { ascending: false });

    // Get matched jobs from this batch
    const { data: matchedJobs } = await supabase
      .from('omega_installs')
      .select('invoice_number, customer_name, customer_phone, total_revenue, match_confidence')
      .in('omega_invoice_id', batchIds)
      .not('matched_lead_id', 'is', null)
      .order('updated_at', { ascending: false });

    console.log(`Invoice import complete: ${results.imported} imported, ${matched} total matched leads`);

    // Schedule review requests for leads just marked completed by the backfill
    let reviewsScheduled = 0;
    try {
      const { data: matchedLeadIds } = await supabase
        .from('omega_installs')
        .select('matched_lead_id')
        .in('omega_invoice_id', batchIds)
        .not('matched_lead_id', 'is', null);

      if (matchedLeadIds && matchedLeadIds.length > 0) {
        const ids = matchedLeadIds.map((r: any) => r.matched_lead_id);
        const { data: completedLeads } = await supabase
          .from('leads')
          .select('id, first_name, phone_e164, email, vehicle_year, vehicle_make, vehicle_model')
          .in('id', ids)
          .eq('status', 'completed')
          .or('phone_e164.not.is.null,email.not.is.null');

        for (const lead of completedLeads || []) {
          try {
            const result = await scheduleReviewRequest(lead.id, {
              firstName: lead.first_name || 'there',
              phone: lead.phone_e164 || '',
              email: lead.email || undefined,
              vehicleYear: lead.vehicle_year || 0,
              vehicleMake: lead.vehicle_make || '',
              vehicleModel: lead.vehicle_model || '',
              smsConsent: !!lead.phone_e164,
            });
            reviewsScheduled += result.scheduled;
          } catch (err: any) {
            console.error(`Review request failed for lead ${lead.id}:`, err.message);
          }
        }
      }
    } catch (err: any) {
      console.error('import-invoices review scheduling error:', err.message);
    }

    // Run cleanup on just-imported records (daysSince=1 catches today's uploads)
    let cleanup = { checked: 0, updated: 0, flagged: 0, errors: 0 };
    try {
      cleanup = await runOmegaCleanup(supabase, { daysSince: 1 });
    } catch (err: any) {
      console.error('import-invoices cleanup error:', err.message);
    }

    return NextResponse.json({
      ok: true,
      imported: results.imported,
      skipped: results.skipped,
      matched,
      reviewsScheduled,
      matchedJobs: matchedJobs || [],
      unmatched: unmatched || [],
      errors: results.errors,
    });

  } catch (error: any) {
    console.error('import-invoices error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
