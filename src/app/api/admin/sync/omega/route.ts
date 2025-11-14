/**
 * Omega EDI Sync Endpoint
 * Syncs quotes and invoices from Omega EDI to our database
 *
 * Usage:
 * POST /api/admin/sync/omega
 * Body: { type: "quotes" | "invoices" | "all", startDate?: "YYYY-MM-DD", endDate?: "YYYY-MM-DD" }
 *
 * Can be triggered manually or via cron job
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminApiKey } from '@/lib/api-auth';
import { getOmegaClient, validateOmegaConfig, type OmegaQuote, type OmegaInvoice } from '@/lib/omegaEDI';

// ============================================================================
// POST - Sync Omega Data
// ============================================================================

export async function POST(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  const startTime = Date.now();

  try {

    // Parse request body
    const body = await req.json();
    const {
      type = 'all',
      startDate,
      endDate
    } = body;

    console.log('🔄 Starting Omega EDI sync:', { type, startDate, endDate });

    // Validate Omega config
    const config = validateOmegaConfig();
    if (!config.isValid) {
      return NextResponse.json(
        {
          error: 'Omega EDI not configured',
          missing: config.missingVars
        },
        { status: 500 }
      );
    }

    // Initialize clients
    const omega = getOmegaClient();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Sync results
    const results = {
      quotes: { fetched: 0, created: 0, updated: 0, matched: 0, errors: [] as string[] },
      invoices: { fetched: 0, created: 0, updated: 0, matched: 0, errors: [] as string[] },
    };

    // ==========================================================================
    // SYNC QUOTES
    // ==========================================================================

    if (type === 'quotes' || type === 'all') {
      console.log('📊 Syncing quotes from Omega EDI...');

      try {
        const quotes = await omega.getQuotes(startDate, endDate);
        results.quotes.fetched = quotes.length;

        console.log(`  Fetched ${quotes.length} quotes from Omega`);

        for (const quote of quotes) {
          try {
            // Upsert quote (insert or update if exists)
            const { data, error } = await supabase
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
              }, {
                onConflict: 'omega_quote_id',
              })
              .select('id')
              .single();

            if (error) {
              console.error(`  ❌ Error upserting quote ${quote.id}:`, error);
              results.quotes.errors.push(`Quote ${quote.id}: ${error.message}`);
            } else {
              results.quotes.created++;
              console.log(`  ✅ Upserted quote ${quote.id}`);
            }
          } catch (err: any) {
            console.error(`  ❌ Error processing quote ${quote.id}:`, err);
            results.quotes.errors.push(`Quote ${quote.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching quotes from Omega:', err);
        results.quotes.errors.push(`Fetch error: ${err.message}`);
      }
    }

    // ==========================================================================
    // SYNC INVOICES
    // ==========================================================================

    if (type === 'invoices' || type === 'all') {
      console.log('💰 Syncing invoices from Omega EDI...');

      try {
        const invoices = await omega.getInvoices(startDate, endDate);
        results.invoices.fetched = invoices.length;

        console.log(`  Fetched ${invoices.length} invoices from Omega`);

        for (const invoice of invoices) {
          try {
            // Upsert invoice
            const { data, error } = await supabase
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
              }, {
                onConflict: 'omega_invoice_id',
              })
              .select('id')
              .single();

            if (error) {
              console.error(`  ❌ Error upserting invoice ${invoice.id}:`, error);
              results.invoices.errors.push(`Invoice ${invoice.id}: ${error.message}`);
            } else {
              results.invoices.created++;
              console.log(`  ✅ Upserted invoice ${invoice.id}`);
            }
          } catch (err: any) {
            console.error(`  ❌ Error processing invoice ${invoice.id}:`, err);
            results.invoices.errors.push(`Invoice ${invoice.id}: ${err.message}`);
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching invoices from Omega:', err);
        results.invoices.errors.push(`Fetch error: ${err.message}`);
      }
    }

    // ==========================================================================
    // RUN MATCHING
    // ==========================================================================

    console.log('🔗 Running customer matching...');

    try {
      const { error: matchError } = await supabase.rpc('match_omega_to_leads');

      if (matchError) {
        console.error('❌ Error running matching:', matchError);
        results.quotes.errors.push(`Matching error: ${matchError.message}`);
      } else {
        console.log('✅ Customer matching completed');

        // Count matches
        const { count: quoteMatches } = await supabase
          .from('omega_quotes')
          .select('id', { count: 'exact', head: true })
          .not('matched_lead_id', 'is', null);

        const { count: invoiceMatches } = await supabase
          .from('omega_installs')
          .select('id', { count: 'exact', head: true })
          .not('matched_lead_id', 'is', null);

        results.quotes.matched = quoteMatches || 0;
        results.invoices.matched = invoiceMatches || 0;

        console.log(`  📎 Matched ${quoteMatches} quotes and ${invoiceMatches} invoices to leads`);
      }
    } catch (err: any) {
      console.error('❌ Error in matching process:', err);
      results.quotes.errors.push(`Matching error: ${err.message}`);
    }

    // ==========================================================================
    // LOG SYNC
    // ==========================================================================

    const duration = Date.now() - startTime;

    await supabase.from('omega_sync_log').insert({
      sync_type: type,
      sync_status: results.quotes.errors.length > 0 || results.invoices.errors.length > 0 ? 'partial' : 'success',

      records_fetched: results.quotes.fetched + results.invoices.fetched,
      records_created: results.quotes.created + results.invoices.created,
      records_updated: results.quotes.updated + results.invoices.updated,
      records_matched: results.quotes.matched + results.invoices.matched,
      records_failed: results.quotes.errors.length + results.invoices.errors.length,

      error_message: [...results.quotes.errors, ...results.invoices.errors].join('; ') || null,

      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: duration,

      metadata: { startDate, endDate, results },
    });

    console.log(`✅ Omega sync completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      quotes: results.quotes,
      invoices: results.invoices,
      total: {
        fetched: results.quotes.fetched + results.invoices.fetched,
        created: results.quotes.created + results.invoices.created,
        matched: results.quotes.matched + results.invoices.matched,
        errors: results.quotes.errors.length + results.invoices.errors.length,
      },
    });

  } catch (error: any) {
    console.error('❌ Omega sync failed:', error);

    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Check Omega Status
// ============================================================================

export async function GET(req: NextRequest) {
  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)
  const authError = validateAdminApiKey(req);
  if (authError) return authError;

  try {

    // Check configuration
    const config = validateOmegaConfig();

    if (!config.isValid) {
      return NextResponse.json({
        configured: false,
        missing: config.missingVars,
      });
    }

    // Test connection
    const omega = getOmegaClient();
    const health = await omega.healthCheck();

    // Get last sync info
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: lastSync } = await supabase
      .from('omega_sync_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    // Get current counts
    const { count: quotesCount } = await supabase
      .from('omega_quotes')
      .select('id', { count: 'exact', head: true });

    const { count: installsCount } = await supabase
      .from('omega_installs')
      .select('id', { count: 'exact', head: true });

    const { count: matchedQuotesCount } = await supabase
      .from('omega_quotes')
      .select('id', { count: 'exact', head: true })
      .not('matched_lead_id', 'is', null);

    const { count: matchedInstallsCount } = await supabase
      .from('omega_installs')
      .select('id', { count: 'exact', head: true })
      .not('matched_lead_id', 'is', null);

    return NextResponse.json({
      configured: true,
      healthy: health.success,
      message: health.message,
      lastSync: lastSync || null,
      counts: {
        quotes: quotesCount || 0,
        installs: installsCount || 0,
        matchedQuotes: matchedQuotesCount || 0,
        matchedInstalls: matchedInstallsCount || 0,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Status check failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
