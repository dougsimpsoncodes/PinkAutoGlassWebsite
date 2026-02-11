/**
 * Daily Data Sync Cron Job
 * Syncs:
 * - RingCentral call logs
 * - Google Ads search terms and campaign performance
 * - Google Search Console organic queries
 * Triggered by Vercel Cron at 6am MT (1pm UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SDK } from '@ringcentral/sdk';
import {
  validateGoogleAdsConfig,
  fetchSearchQueryReport,
  fetchCampaignPerformance,
} from '@/lib/googleAds';
import {
  validateSearchConsoleConfig,
  fetchQueryPerformance,
  fetchDailyPerformance,
} from '@/lib/googleSearchConsole';
import { syncOfflineConversions, syncMicrosoftOfflineConversions } from '@/lib/offlineConversionSync';
import { validateMicrosoftAdsConfig, fetchSearchTerms as fetchMicrosoftSearchTerms } from '@/lib/microsoftAds';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting data sync...');

    const supabase = getSupabaseClient();
    const results = {
      ringcentral: {
        calls: { success: false, records: 0, error: null as string | null },
      },
      googleAds: {
        campaigns: { success: false, records: 0, error: null as string | null },
        searchTerms: { success: false, records: 0, error: null as string | null },
        offlineConversions: { success: false, uploaded: 0, failed: 0, error: null as string | null },
      },
      microsoftAds: {
        searchTerms: { success: false, records: 0, error: null as string | null },
        offlineConversions: { success: false, uploaded: 0, failed: 0, error: null as string | null },
      },
      googleSearchConsole: {
        queries: { success: false, records: 0, error: null as string | null },
        dailyTotals: { success: false, records: 0, error: null as string | null },
      },
    };

    // Date range: last 7 days (Google Ads data is typically delayed by 1-2 days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // 7 days back

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`📅 Syncing data from ${startDateStr} to ${endDateStr}`);

    // ========================================
    // 1. Sync RingCentral Call Logs
    // ========================================
    try {
      const RC_JWT_TOKEN = process.env.RINGCENTRAL_JWT_TOKEN;
      const RC_CLIENT_ID = process.env.RINGCENTRAL_CLIENT_ID;
      const RC_CLIENT_SECRET = process.env.RINGCENTRAL_CLIENT_SECRET;
      const RC_SERVER_URL = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';

      if (RC_JWT_TOKEN && RC_CLIENT_ID && RC_CLIENT_SECRET) {
        console.log('📞 Syncing RingCentral calls...');

        const rcsdk = new SDK({
          server: RC_SERVER_URL,
          clientId: RC_CLIENT_ID.trim(),
          clientSecret: RC_CLIENT_SECRET.trim(),
        });

        const platform = rcsdk.platform();
        await platform.login({ jwt: RC_JWT_TOKEN.trim() });

        const authData = await platform.auth().data();
        const accessToken = authData.access_token;

        // Incremental sync: get most recent call's start_time
        const { data: lastCall } = await supabase
          .from('ringcentral_calls')
          .select('start_time')
          .order('start_time', { ascending: false })
          .limit(1)
          .single();

        // If we have existing calls, only fetch calls newer than the last one (plus 1 hour buffer)
        // Otherwise, do a 30-day backfill
        let callDateFrom: Date;
        const isIncrementalSync = !!lastCall?.start_time;

        if (isIncrementalSync) {
          callDateFrom = new Date(lastCall.start_time);
          callDateFrom.setHours(callDateFrom.getHours() - 1); // 1-hour buffer
          console.log(`🔄 Incremental RingCentral sync since ${callDateFrom.toISOString()}`);
        } else {
          callDateFrom = new Date();
          callDateFrom.setDate(callDateFrom.getDate() - 30);
          console.log(`📥 Full RingCentral sync: 30 days of history`);
        }

        const callLogResponse = await fetch(
          `${RC_SERVER_URL}/restapi/v1.0/account/~/call-log?` +
            new URLSearchParams({
              dateFrom: callDateFrom.toISOString(),
              perPage: '1000',
              view: 'Detailed',
            }),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (callLogResponse.ok) {
          const callLogData = await callLogResponse.json();
          const records = callLogData.records || [];
          const syncTimestamp = new Date().toISOString();

          // Transform all records to database format for batch upsert
          const callDataBatch = records.map((call: any) => ({
            call_id: call.id,
            session_id: call.sessionId,
            start_time: call.startTime,
            end_time: call.endTime || null,
            duration: call.duration || 0,
            direction: call.direction,
            from_number: call.from?.phoneNumber || '',
            from_name: call.from?.name || null,
            to_number: call.to?.phoneNumber || '',
            to_name: call.to?.name || null,
            result: call.result,
            action: call.action || '',
            recording_id: call.recording?.id || null,
            recording_uri: call.recording?.uri || null,
            recording_type: call.recording?.type || null,
            recording_content_uri: call.recording?.contentUri || null,
            transport: call.transport || '',
            sync_timestamp: syncTimestamp,
            raw_data: call,
          }));

          // Batch upsert - single database call instead of N calls
          let inserted = callDataBatch.length;
          if (callDataBatch.length > 0) {
            const { error } = await supabase
              .from('ringcentral_calls')
              .upsert(callDataBatch, { onConflict: 'call_id' });

            if (error) {
              inserted = 0;
              console.error('Batch upsert error:', error.message);
            }
          }

          results.ringcentral.calls = {
            success: inserted > 0,
            records: inserted,
            error: null,
          };
          console.log(`✅ Synced ${inserted} RingCentral calls (batch)`);
        } else {
          const errorText = await callLogResponse.text();
          throw new Error(`RingCentral API error: ${errorText}`);
        }
      } else {
        results.ringcentral.calls.error = 'RingCentral not configured';
        console.warn('⚠️ RingCentral not configured');
      }
    } catch (error: any) {
      results.ringcentral.calls.error = error.message;
      console.error('❌ RingCentral sync failed:', error.message);
    }

    // ========================================
    // 2. Sync Google Ads Campaign Performance
    // ========================================
    try {
      const configValid = validateGoogleAdsConfig();
      if (configValid.isValid) {
        console.log('📊 Syncing Google Ads campaigns...');
        const campaignData = await fetchCampaignPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of campaignData) {
          const dbRecord = {
            date: record.date,
            report_date: record.date,
            campaign_id: record.campaign_id.toString(),
            campaign_name: record.campaign_name,
            campaign_status: record.campaign_status,
            channel_type: record.channel_type,
            impressions: record.impressions,
            clicks: record.clicks,
            interactions: record.interactions,
            cost: record.cost,
            conversions: record.conversions,
            conversions_value: record.conversions_value,
            all_conversions: record.all_conversions,
            all_conversions_value: record.all_conversions_value,
            view_through_conversions: record.view_through_conversions,
            sync_timestamp: new Date().toISOString(),
            raw_data: record,
          };

          const { error } = await supabase
            .from('google_ads_daily_performance')
            .upsert(dbRecord, { onConflict: 'date,campaign_id' });

          if (!error) inserted++;
        }

        results.googleAds.campaigns = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} campaign records`);
      } else {
        results.googleAds.campaigns.error = `Missing config: ${configValid.missingVars.join(', ')}`;
        console.warn('⚠️ Google Ads not configured');
      }
    } catch (error: any) {
      results.googleAds.campaigns.error = error.message;
      console.error('❌ Google Ads campaign sync failed:', error.message);
    }

    // ========================================
    // 3. Sync Google Ads Search Terms
    // ========================================
    try {
      const configValid = validateGoogleAdsConfig();
      if (configValid.isValid) {
        console.log('🔍 Syncing Google Ads search terms...');
        const searchTermData = await fetchSearchQueryReport(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of searchTermData) {
          const dbRecord = {
            report_date: record.date,
            search_term: record.search_term,
            search_term_match_type: record.match_type,
            keyword_id: record.ad_group_id,
            keyword_text: record.ad_group_name,
            campaign_id: record.campaign_id.toString(),
            campaign_name: record.campaign_name,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: Math.round(record.cost * 1000000),
            conversions: record.conversions,
            ctr: record.impressions > 0 ? (record.clicks / record.impressions) * 100 : 0,
            cost: record.cost,
            sync_timestamp: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_ads_search_terms')
            .upsert(dbRecord, { onConflict: 'report_date,search_term,campaign_id' });

          if (!error) inserted++;
        }

        results.googleAds.searchTerms = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} search term records`);
      } else {
        results.googleAds.searchTerms.error = `Missing config: ${configValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.googleAds.searchTerms.error = error.message;
      console.error('❌ Google Ads search terms sync failed:', error.message);
    }

    // ========================================
    // 4. Sync Google Search Console Queries
    // ========================================
    try {
      const configValid = validateSearchConsoleConfig();
      if (configValid.isValid) {
        console.log('🌐 Syncing Google Search Console queries...');
        const queryData = await fetchQueryPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of queryData) {
          const dbRecord = {
            date: record.date,
            query: record.query,
            page_url: record.page_url || null,
            impressions: record.impressions,
            clicks: record.clicks,
            ctr: record.ctr,
            position: record.position,
            device_type: record.device_type || null,
            country: 'usa',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_search_console_queries')
            .upsert(dbRecord, { onConflict: 'date,query,page_url,device_type' });

          if (!error) inserted++;
        }

        results.googleSearchConsole.queries = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} GSC query records`);
      } else {
        results.googleSearchConsole.queries.error = `Missing config: ${configValid.missingVars.join(', ')}`;
        console.warn('⚠️ Google Search Console not configured');
      }
    } catch (error: any) {
      results.googleSearchConsole.queries.error = error.message;
      console.error('❌ GSC queries sync failed:', error.message);
    }

    // ========================================
    // 5. Sync Google Search Console Daily Totals
    // ========================================
    try {
      const configValid = validateSearchConsoleConfig();
      if (configValid.isValid) {
        console.log('📈 Syncing GSC daily totals...');
        const dailyData = await fetchDailyPerformance(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of dailyData) {
          const dbRecord = {
            date: record.date,
            total_impressions: record.impressions,
            total_clicks: record.clicks,
            average_ctr: record.ctr,
            average_position: record.position,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('google_search_console_daily_totals')
            .upsert(dbRecord, { onConflict: 'date' });

          if (!error) inserted++;
        }

        results.googleSearchConsole.dailyTotals = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} GSC daily total records`);
      } else {
        results.googleSearchConsole.dailyTotals.error = `Missing config: ${configValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.googleSearchConsole.dailyTotals.error = error.message;
      console.error('❌ GSC daily totals sync failed:', error.message);
    }

    // ========================================
    // 6. Upload Offline Conversions to Google Ads
    // ========================================
    // This must run AFTER RingCentral sync so we have the latest calls
    try {
      const configValid = validateGoogleAdsConfig();
      const hasOfflineConversionAction = !!process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID;

      if (configValid.isValid && hasOfflineConversionAction) {
        console.log('📤 Uploading offline conversions to Google Ads...');
        const syncResult = await syncOfflineConversions();

        results.googleAds.offlineConversions = {
          success: true,
          uploaded: syncResult.conversionsUploaded,
          failed: syncResult.conversionsFailed,
          error: syncResult.errors.length > 0 ? syncResult.errors.join('; ') : null,
        };

        if (syncResult.conversionsUploaded > 0) {
          console.log(`✅ Uploaded ${syncResult.conversionsUploaded} offline conversions`);
        } else {
          console.log('📭 No offline conversions to upload');
        }
      } else if (!hasOfflineConversionAction) {
        results.googleAds.offlineConversions.error = 'GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID not configured';
        console.warn('⚠️ Offline conversion upload skipped: No conversion action ID configured');
      } else {
        results.googleAds.offlineConversions.error = `Missing config: ${configValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.googleAds.offlineConversions.error = error.message;
      console.error('❌ Offline conversion upload failed:', error.message);
    }

    // ========================================
    // 7. Upload Offline Conversions to Microsoft Ads
    // ========================================
    // This must run AFTER RingCentral sync so we have the latest calls
    try {
      const msConfigValid = validateMicrosoftAdsConfig();

      if (msConfigValid.isValid) {
        console.log('📤 Uploading offline conversions to Microsoft Ads...');
        const syncResult = await syncMicrosoftOfflineConversions();

        results.microsoftAds.offlineConversions = {
          success: true,
          uploaded: syncResult.conversionsUploaded,
          failed: syncResult.conversionsFailed,
          error: syncResult.errors.length > 0 ? syncResult.errors.join('; ') : null,
        };

        if (syncResult.conversionsUploaded > 0) {
          console.log(`✅ Uploaded ${syncResult.conversionsUploaded} Microsoft Ads offline conversions`);
        } else {
          console.log('📭 No Microsoft Ads offline conversions to upload');
        }
      } else {
        results.microsoftAds.offlineConversions.error = `Missing config: ${msConfigValid.missingVars.join(', ')}`;
        console.warn('⚠️ Microsoft Ads offline conversion upload skipped: Not configured');
      }
    } catch (error: any) {
      results.microsoftAds.offlineConversions.error = error.message;
      console.error('❌ Microsoft Ads offline conversion upload failed:', error.message);
    }

    // ========================================
    // 8. Sync Microsoft Ads Search Terms
    // ========================================
    try {
      const msConfigValid = validateMicrosoftAdsConfig();
      if (msConfigValid.isValid) {
        console.log('🔍 Syncing Microsoft Ads search terms...');
        const searchTermData = await fetchMicrosoftSearchTerms(startDateStr, endDateStr);

        let inserted = 0;
        for (const record of searchTermData) {
          const dbRecord = {
            date: startDateStr, // Summary aggregation — use start of range
            search_term: record.search_term,
            campaign_name: record.campaign_name,
            campaign_id: '0', // Not available from search term report
            ad_group_name: record.ad_group_name || 'Unknown',
            ad_group_id: '0', // Not available from search term report
            keyword_text: record.keyword_text || null,
            match_type: record.match_type || null,
            impressions: record.impressions,
            clicks: record.clicks,
            cost_micros: record.cost_micros,
            conversions: record.conversions,
          };

          const { error } = await supabase
            .from('microsoft_ads_search_terms')
            .upsert(dbRecord, { onConflict: 'date,search_term,campaign_name' });

          if (!error) inserted++;
          else if (inserted === 0) console.warn('Microsoft Ads upsert error sample:', error.message);
        }

        results.microsoftAds.searchTerms = {
          success: true,
          records: inserted,
          error: null,
        };
        console.log(`✅ Synced ${inserted} Microsoft Ads search term records`);
      } else {
        results.microsoftAds.searchTerms.error = `Missing config: ${msConfigValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.microsoftAds.searchTerms.error = error.message;
      console.error('❌ Microsoft Ads search terms sync failed:', error.message);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Search data sync completed in ${duration}s`);

    return NextResponse.json({
      success: true,
      message: `Search data sync completed in ${duration}s`,
      dateRange: {
        from: startDateStr,
        to: endDateStr,
      },
      results,
    });
  } catch (error: any) {
    console.error('❌ Critical error during search data sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
