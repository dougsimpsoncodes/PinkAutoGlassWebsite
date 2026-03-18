/**
 * Nightly Omega EDI Sync Cron
 *
 * Runs nightly at 5:00 UTC (10 PM MST / 11 PM MDT).
 * 1. Syncs last 2 days of quotes and invoices from Omega EDI
 * 2. Runs lead matching (phone/email)
 * 3. Backfills revenue data onto matched leads
 *
 * Vercel crons require GET. Auth via CRON_SECRET bearer token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getOmegaClient, validateOmegaConfig } from '@/lib/omegaEDI';
import { scheduleReviewRequest } from '@/lib/drip/scheduler';
import { runOmegaCleanup } from '@/lib/omega/data-cleanup';

export async function GET(request: NextRequest) {
  // Verify cron secret (same pattern as other cron jobs)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // ── Schedule Review Requests for Completed Jobs ─────────────
    // Runs regardless of Omega config — only needs Supabase.
    // 7-day lookback survives weekend gaps; dedup prevents double-sends.
    let reviewsScheduled = 0;
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: completedLeads } = await supabase
        .from('leads')
        .select('id, first_name, phone_e164, email, vehicle_year, vehicle_make, vehicle_model')
        .eq('status', 'completed')
        .gte('updated_at', since)
        .or('phone_e164.not.is.null,email.not.is.null');

      if (completedLeads && completedLeads.length > 0) {
        console.log(`Omega cron: scheduling review requests for ${completedLeads.length} recently completed leads`);
        for (const lead of completedLeads) {
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
            console.error(`Omega cron: review request failed for lead ${lead.id}:`, err.message);
          }
        }
        console.log(`Omega cron: scheduled ${reviewsScheduled} review request messages`);
      }
    } catch (err: any) {
      console.error('Omega cron: review request scheduling error:', err.message);
    }

    // Validate Omega config — if not set, skip EDI sync but reviews already ran
    const config = validateOmegaConfig();
    if (!config.isValid) {
      console.warn('Omega EDI not configured, skipping EDI sync');
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Omega EDI not configured',
        missing: config.missingVars,
        reviewsScheduled,
      });
    }

    const omega = getOmegaClient();

    // Sync last 2 days (overlap window for late-arriving records)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Omega cron sync: ${startDate} to ${endDate}`);

    const results = {
      quotes: { fetched: 0, upserted: 0, errors: [] as string[] },
      invoices: { fetched: 0, upserted: 0, errors: [] as string[] },
      matching: { matched: 0 },
      backfill: { quotes_updated: 0, installs_updated: 0, statuses_updated: 0 },
    };

    // ── Sync Quotes ──────────────────────────────────────────────
    try {
      const quotes = await omega.getQuotes(startDate, endDate);
      results.quotes.fetched = quotes.length;

      for (const quote of quotes) {
        const { error } = await supabase
          .from('omega_quotes')
          .upsert({
            omega_quote_id: quote.id,
            omega_customer_id: quote.customer_id,
            customer_name: quote.customer_name,
            customer_email: quote.customer_email,
            customer_phone: quote.customer_phone,
            quote_date: quote.quote_date,
            quote_number: quote.quote_number,
            vehicle_year: quote.vehicle_year,
            vehicle_make: quote.vehicle_make,
            vehicle_model: quote.vehicle_model,
            vin: quote.vin,
            quoted_amount: quote.quoted_amount,
            tax_amount: quote.tax_amount,
            total_amount: quote.total_amount,
            status: quote.status || 'pending',
            raw_data: quote.raw_data,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'omega_quote_id' });

        if (error) {
          results.quotes.errors.push(`Quote ${quote.id}: ${error.message}`);
        } else {
          results.quotes.upserted++;
        }
      }
    } catch (err: any) {
      results.quotes.errors.push(`Fetch error: ${err.message}`);
      console.error('Omega cron: quote fetch failed:', err.message);
    }

    // ── Sync Invoices ────────────────────────────────────────────
    try {
      const invoices = await omega.getInvoices(startDate, endDate);
      results.invoices.fetched = invoices.length;

      for (const invoice of invoices) {
        const { error } = await supabase
          .from('omega_installs')
          .upsert({
            omega_invoice_id: invoice.id,
            omega_quote_id: invoice.quote_id,
            omega_customer_id: invoice.customer_id,
            customer_name: invoice.customer_name,
            customer_email: invoice.customer_email,
            customer_phone: invoice.customer_phone,
            install_date: invoice.invoice_date,
            invoice_number: invoice.invoice_number,
            job_type: invoice.job_type,
            vehicle_year: invoice.vehicle_year,
            vehicle_make: invoice.vehicle_make,
            vehicle_model: invoice.vehicle_model,
            vin: invoice.vin,
            parts_cost: invoice.parts_cost,
            labor_cost: invoice.labor_cost,
            tax_amount: invoice.tax_amount,
            total_revenue: invoice.total_amount,
            payment_method: invoice.payment_method,
            payment_status: invoice.payment_status,
            status: invoice.status || 'completed',
            raw_data: invoice.raw_data,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'omega_invoice_id' });

        if (error) {
          results.invoices.errors.push(`Invoice ${invoice.id}: ${error.message}`);
        } else {
          results.invoices.upserted++;
        }
      }
    } catch (err: any) {
      results.invoices.errors.push(`Fetch error: ${err.message}`);
      console.error('Omega cron: invoice fetch failed:', err.message);
    }

    // ── Run Matching ─────────────────────────────────────────────
    try {
      const { error: matchError } = await supabase.rpc('match_omega_to_leads');
      if (matchError) {
        console.error('Omega cron: matching failed:', matchError.message);
      } else {
        const { count } = await supabase
          .from('omega_installs')
          .select('id', { count: 'exact', head: true })
          .not('matched_lead_id', 'is', null);
        results.matching.matched = count || 0;
      }
    } catch (err: any) {
      console.error('Omega cron: matching error:', err.message);
    }

    // ── Revenue Backfill ─────────────────────────────────────────
    try {
      const { data: backfillData, error: backfillError } = await supabase.rpc('fn_backfill_lead_revenue');

      if (backfillError) {
        console.error('Omega cron: backfill failed:', backfillError.message);
      } else if (backfillData && backfillData.length > 0) {
        const row = backfillData[0];
        results.backfill.quotes_updated = row.quotes_updated || 0;
        results.backfill.installs_updated = row.installs_updated || 0;
        results.backfill.statuses_updated = row.statuses_updated || 0;
        console.log('Revenue backfill:', results.backfill);
      }
    } catch (err: any) {
      console.error('Omega cron: backfill error:', err.message);
    }

    // ── Data Cleanup ─────────────────────────────────────────────
    let cleanup = { checked: 0, updated: 0, flagged: 0, errors: 0 };
    try {
      cleanup = await runOmegaCleanup(supabase, { daysSince: 3 });
    } catch (err: any) {
      console.error('Omega cron: cleanup error:', err.message);
    }

    // ── Log Sync ─────────────────────────────────────────────────
    const duration = Date.now() - startTime;
    const allErrors = [...results.quotes.errors, ...results.invoices.errors];

    await supabase.from('omega_sync_log').insert({
      sync_type: 'cron',
      sync_status: allErrors.length > 0 ? 'partial' : 'success',
      records_fetched: results.quotes.fetched + results.invoices.fetched,
      records_created: results.quotes.upserted + results.invoices.upserted,
      records_matched: results.matching.matched,
      records_failed: allErrors.length,
      error_message: allErrors.join('; ') || null,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: duration,
      metadata: { startDate, endDate, results, reviewsScheduled, cleanup },
    });

    console.log(`Omega cron completed in ${duration}ms`);

    return NextResponse.json({
      ok: true,
      duration_ms: duration,
      ...results,
    });
  } catch (error: any) {
    console.error('Omega sync cron failed:', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
