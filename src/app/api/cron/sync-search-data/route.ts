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
  fetchCallConversions,
  fetchCallView,
} from '@/lib/googleAds';
import { crossReferenceCallsToRingCentral } from '@/lib/callAttributionSync';
import { syncCallLeads } from '@/lib/callLeadSync';
import {
  validateSearchConsoleConfig,
  fetchQueryPerformance,
  fetchDailyPerformance,
} from '@/lib/googleSearchConsole';
import { syncOfflineConversions, syncMicrosoftOfflineConversions } from '@/lib/offlineConversionSync';
import {
  validateMicrosoftAdsConfig,
  fetchSearchTerms as fetchMicrosoftSearchTerms,
  fetchCampaignPerformance as fetchMicrosoftCampaignPerformance,
} from '@/lib/microsoftAds';
import { validateGBPConfig, fetchGBPCallMetrics } from '@/lib/googleBusinessProfile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max
const UPSERT_CHUNK_SIZE = 250;
const SCRAPE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
};

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
        callConversions: { success: false, records: 0, error: null as string | null },
        callView: { success: false, records: 0, error: null as string | null },
        searchTerms: { success: false, records: 0, error: null as string | null },
        offlineConversions: { success: false, uploaded: 0, failed: 0, error: null as string | null },
      },
      callLeadSync: {
        success: false, created: 0, updated: 0, skipped: 0, error: null as string | null,
      },
      callAttribution: {
        crossReference: { success: false, matched: 0, unmatched: 0, error: null as string | null },
      },
      microsoftAds: {
        campaigns: { success: false, records: 0, error: null as string | null },
        searchTerms: { success: false, records: 0, error: null as string | null },
        offlineConversions: { success: false, uploaded: 0, failed: 0, error: null as string | null },
      },
      gbp: {
        calls: { success: false, records: 0, error: null as string | null },
        reviewsMeta: { success: false, userRatingCount: 0, averageRating: 0, error: null as string | null },
      },
      googleSearchConsole: {
        queries: { success: false, records: 0, error: null as string | null },
        dailyTotals: { success: false, records: 0, error: null as string | null },
      },
    };

    // Date range: last 7 days through yesterday for ads metrics (delayed 1-2 days)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7); // 7 days back

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Call attribution + lead sync include today (real-time data, no delay)
    const todayStr = new Date().toISOString().split('T')[0];

    console.log(`📅 Syncing ads data ${startDateStr}→${endDateStr}, calls through ${todayStr}`);

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
    // 2.5. Sync Google Ads Call Conversions + Call View
    // ========================================
    try {
      const configValid = validateGoogleAdsConfig();
      if (configValid.isValid) {
        // 2.5a: Aggregate call conversions by conversion action
        console.log('📞 Syncing Google Ads call conversions...');
        const conversions = await fetchCallConversions(startDateStr, endDateStr);
        if (conversions.length > 0) {
          const dbRecords = conversions.map(c => ({
            date: c.date,
            campaign_id: c.campaign_id,
            campaign_name: c.campaign_name,
            conversion_action_id: c.conversion_action_id,
            conversion_action_name: c.conversion_action_name,
            call_conversions: c.conversions,
            call_conversions_value: c.conversions_value,
            sync_timestamp: new Date().toISOString(),
          }));
          const { error } = await supabase
            .from('google_ads_call_conversions')
            .upsert(dbRecords, { onConflict: 'date,campaign_id,conversion_action_id' });
          if (!error) {
            results.googleAds.callConversions = { success: true, records: dbRecords.length, error: null };
            console.log(`✅ Synced ${dbRecords.length} call conversion records`);
          } else {
            results.googleAds.callConversions.error = error.message;
          }
        } else {
          results.googleAds.callConversions = { success: true, records: 0, error: null };
        }

        // 2.5b: Individual call records via call_view (yesterday only to avoid timeout)
        const yesterday = endDateStr;
        console.log(`📞 Fetching call_view for ${yesterday}...`);
        try {
          const calls = await fetchCallView(yesterday);
          if (calls.length > 0) {
            const dbRecords = calls.map(c => ({
              resource_name: c.resource_name,
              start_date_time: c.start_date_time,
              end_date_time: c.end_date_time,
              call_duration_seconds: c.call_duration_seconds,
              caller_area_code: c.caller_area_code,
              caller_country_code: c.caller_country_code,
              call_status: c.call_status,
              call_type: c.call_type,
              call_tracking_display_location: c.call_tracking_display_location,
              campaign_id: c.campaign_id,
              campaign_name: c.campaign_name,
              ad_group_id: c.ad_group_id,
              ad_group_name: c.ad_group_name,
              sync_timestamp: new Date().toISOString(),
            }));
            const { error } = await supabase
              .from('google_ads_calls')
              .upsert(dbRecords, { onConflict: 'resource_name' });
            if (!error) {
              results.googleAds.callView = { success: true, records: dbRecords.length, error: null };
              console.log(`✅ Synced ${dbRecords.length} call_view records`);
            } else {
              results.googleAds.callView.error = error.message;
            }
          } else {
            results.googleAds.callView = { success: true, records: 0, error: null };
          }
        } catch (cvError: any) {
          results.googleAds.callView.error = cvError.message;
          console.warn(`⚠️ call_view sync failed (non-fatal): ${cvError.message}`);
        }
      }
    } catch (error: any) {
      results.googleAds.callConversions.error = error.message;
      console.error('❌ Google Ads call sync failed:', error.message);
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
      const hasOfflineConversionAction = !!process.env.GOOGLE_ADS_OFFLINE_CONVERSION_ACTION_ID || !!process.env.GOOGLE_ADS_OFFLINE_LEAD_FORM_ACTION_ID;

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
        results.googleAds.offlineConversions.error = 'No Google Ads offline conversion action ID configured';
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
    // 8. Sync Microsoft Ads Campaign Performance (Daily)
    // ========================================
    try {
      const msConfigValid = validateMicrosoftAdsConfig();
      if (msConfigValid.isValid) {
        console.log('📊 Syncing Microsoft Ads campaign performance...');
        const campaignData = await fetchMicrosoftCampaignPerformance(startDateStr, endDateStr);

        const campaignRecordsRaw = campaignData.map((record) => ({
          date: record.date,
          campaign_id: record.campaign_id,
          campaign_name: record.campaign_name,
          campaign_status: record.campaign_status,
          impressions: record.impressions,
          clicks: record.clicks,
          cost_micros: record.cost_micros,
          conversions: record.conversions,
          conversion_value_micros: record.conversion_value_micros,
          ctr: record.ctr,
          average_cpc_micros: record.average_cpc_micros,
          channel_type: record.channel_type,
        }));

        const campaignRecords = dedupeRecords(
          campaignRecordsRaw,
          (r) => `${r.date}|${r.campaign_id}`
        );

        const stored = await upsertInChunks(
          supabase,
          'microsoft_ads_daily_performance',
          campaignRecords,
          'date,campaign_id'
        );

        results.microsoftAds.campaigns = {
          success: true,
          records: stored,
          error: null,
        };
        console.log(`✅ Synced ${stored} Microsoft Ads daily performance records`);
      } else {
        results.microsoftAds.campaigns.error = `Missing config: ${msConfigValid.missingVars.join(', ')}`;
      }
    } catch (error: any) {
      results.microsoftAds.campaigns.error = error.message;
      console.error('❌ Microsoft Ads campaign sync failed:', error.message);
    }

    // ========================================
    // 9. Sync Microsoft Ads Search Terms
    // ========================================
    try {
      const msConfigValid = validateMicrosoftAdsConfig();
      if (msConfigValid.isValid) {
        console.log('🔍 Syncing Microsoft Ads search terms...');
        const searchTermData = await fetchMicrosoftSearchTerms(startDateStr, endDateStr);

        // Delete existing data for this date range, then insert fresh
        await supabase
          .from('microsoft_ads_search_terms')
          .delete()
          .gte('date', startDateStr)
          .lte('date', endDateStr);

        // Aggregate by (date, campaign_id, search_term) to match unique constraint
        // Same search term can appear in multiple ad groups within one campaign
        const aggregated = new Map<string, {
          date: string; search_term: string; campaign_name: string;
          campaign_id: string; ad_group_name: string; ad_group_id: string;
          keyword_text: string | null; match_type: string | null;
          impressions: number; clicks: number; cost_micros: number; conversions: number;
        }>();

        for (const record of searchTermData) {
          const key = `${startDateStr}|${record.campaign_id || '0'}|${record.search_term}`;
          const existing = aggregated.get(key);
          if (existing) {
            existing.impressions += record.impressions;
            existing.clicks += record.clicks;
            existing.cost_micros += record.cost_micros;
            existing.conversions += record.conversions;
          } else {
            aggregated.set(key, {
              date: startDateStr,
              search_term: record.search_term,
              campaign_name: record.campaign_name,
              campaign_id: record.campaign_id || '0',
              ad_group_name: record.ad_group_name || 'Unknown',
              ad_group_id: record.ad_group_id || '0',
              keyword_text: record.keyword_text || null,
              match_type: record.match_type || null,
              impressions: record.impressions,
              clicks: record.clicks,
              cost_micros: record.cost_micros,
              conversions: record.conversions,
            });
          }
        }

        const dbRecords = Array.from(aggregated.values());
        console.log(`Microsoft Ads: ${searchTermData.length} raw → ${dbRecords.length} aggregated records`);

        // Batch insert in chunks of 100
        let inserted = 0;
        for (let i = 0; i < dbRecords.length; i += 100) {
          const chunk = dbRecords.slice(i, i + 100);
          const { error } = await supabase
            .from('microsoft_ads_search_terms')
            .insert(chunk);

          if (!error) inserted += chunk.length;
          else console.error('Microsoft Ads insert error:', error.message, error.code);
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

    // ========================================
    // 9.5. Sync Google Business Profile Call Metrics
    // ========================================
    try {
      const gbpConfig = validateGBPConfig();
      if (gbpConfig.isValid) {
        console.log('📞 Syncing GBP call metrics...');
        const metrics = await fetchGBPCallMetrics(startDateStr, endDateStr);
        if (metrics.length > 0) {
          const locationName = process.env.GBP_LOCATION_ID || 'default';
          const dbRecords = metrics.map(m => ({
            date: m.date,
            location_name: locationName,
            total_calls: m.totalCalls,
            missed_calls: m.missedCalls,
            answered_calls: m.answeredCalls,
            calls_under_30s: m.callsUnder30s,
            calls_30s_to_120s: m.calls30sTo120s,
            calls_over_120s: m.callsOver120s,
            sync_timestamp: new Date().toISOString(),
            raw_data: m.rawData,
          }));
          const { error } = await supabase
            .from('gbp_call_metrics')
            .upsert(dbRecords, { onConflict: 'date,location_name' });
          if (!error) {
            results.gbp.calls = { success: true, records: dbRecords.length, error: null };
            console.log(`✅ Synced ${dbRecords.length} GBP call metric records`);
          } else {
            results.gbp.calls.error = error.message;
          }
        } else {
          results.gbp.calls = { success: true, records: 0, error: null };
          console.log('📞 GBP: No call data returned');
        }
      } else {
        results.gbp.calls.error = `Not configured: ${gbpConfig.missingVars.join(', ')}`;
        console.warn('⚠️ GBP not configured, skipping');
      }
    } catch (error: any) {
      results.gbp.calls.error = error.message;
      console.error('❌ GBP sync failed:', error.message);
    }

    // ========================================
    // 9.6. Sync Google Reviews Meta (count + rating from Places API)
    // ========================================
    try {
      const placesKey = process.env.GOOGLE_PLACES_SERVER_KEY;
      if (placesKey) {
        console.log('⭐ Syncing Google Reviews meta...');

        // Resolve Place ID from Google Maps page
        const defaultPlaceUrl = 'https://www.google.com/maps/place/Pink+Auto+Glass/@39.6700653,-106.2157665,8z/data=!3m1!4b1!4m6!3m5!1s0x6587cd12fed014a3:0xd0b210c48f4d989d!8m2!3d39.6775295!4d-104.8964855!16s%2Fg%2F11y19h096l?entry=ttu';
        const placeUrl = process.env.GOOGLE_MAPS_PLACE_URL || defaultPlaceUrl;
        const scrapeResp = await fetch(placeUrl, { headers: SCRAPE_HEADERS, cache: 'no-store' });
        const html = scrapeResp.ok ? await scrapeResp.text() : '';
        const previewMatch = html.match(/<link href="([^"]*\/maps\/preview\/place\?[^"]+)" as="fetch"/i);

        let placeId: string | null = null;
        if (previewMatch) {
          const previewUrl = new URL(previewMatch[1].replace(/&amp;/g, '&'), 'https://www.google.com').toString();
          const previewResp = await fetch(previewUrl, { headers: SCRAPE_HEADERS, cache: 'no-store' });
          if (previewResp.ok) {
            const raw = await previewResp.text();
            const idMatch = raw.match(/"(ChIJ[^"]+)"/);
            placeId = idMatch ? idMatch[1] : null;
          }
        }

        if (placeId) {
          const placesResp = await fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
            {
              cache: 'no-store',
              headers: {
                'X-Goog-Api-Key': placesKey,
                'X-Goog-FieldMask': 'rating,userRatingCount',
              },
            }
          );

          if (placesResp.ok) {
            const placesData = await placesResp.json();
            const userRatingCount = Number(placesData.userRatingCount || 0);
            const averageRating = Number(placesData.rating || 0);

            await supabase.from('google_reviews_meta').insert({
              user_rating_count: userRatingCount,
              average_rating: averageRating,
              place_id: placeId,
              synced_at: new Date().toISOString(),
            });

            results.gbp.reviewsMeta = { success: true, userRatingCount, averageRating, error: null };
            console.log(`✅ Google Reviews meta: ${userRatingCount} reviews, ${averageRating} avg rating`);
          } else {
            results.gbp.reviewsMeta.error = `Places API ${placesResp.status}`;
            console.warn(`⚠️ Places API returned ${placesResp.status}`);
          }
        } else {
          results.gbp.reviewsMeta.error = 'Could not resolve Place ID';
          console.warn('⚠️ Could not resolve Place ID for reviews meta');
        }
      } else {
        results.gbp.reviewsMeta.error = 'GOOGLE_PLACES_SERVER_KEY not set';
        console.warn('⚠️ Google Places not configured, skipping reviews meta');
      }
    } catch (error: any) {
      results.gbp.reviewsMeta.error = error.message;
      console.error('❌ Google Reviews meta sync failed:', error.message);
    }

    // ========================================
    // 10. Cross-Reference Google Ads Calls to RingCentral
    // ========================================
    // Must run after both call_view (step 2.5) and RingCentral (step 1) syncs complete
    try {
      console.log('🔗 Cross-referencing Google Ads calls to RingCentral...');
      const crossRef = await crossReferenceCallsToRingCentral(supabase, startDateStr, todayStr);
      results.callAttribution.crossReference = {
        success: true,
        matched: crossRef.matched,
        unmatched: crossRef.unmatched,
        error: crossRef.errors > 0 ? `${crossRef.errors} update errors` : null,
      };
    } catch (error: any) {
      results.callAttribution.crossReference.error = error.message;
      console.error('❌ Cross-reference failed:', error.message);
    }

    // ========================================
    // 11. Create/Update Leads for Qualifying Callers
    // ========================================
    // Must run AFTER cross-reference (step 10) so Google Ads attribution
    // is already populated on ringcentral_calls.ad_platform before we
    // create leads from those calls.
    try {
      console.log('📋 Syncing call-based leads...');
      const callLeadResult = await syncCallLeads(supabase, startDateStr, todayStr);
      results.callLeadSync = {
        success: true,
        created: callLeadResult.created,
        updated: callLeadResult.updated,
        skipped: callLeadResult.skipped,
        error: null,
      };
      console.log(`✅ Call leads: ${callLeadResult.created} created, ${callLeadResult.updated} updated, ${callLeadResult.skipped} skipped`);
    } catch (error: any) {
      results.callLeadSync.error = error.message;
      console.error('❌ Call lead sync failed:', error.message);
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

async function upsertInChunks<T extends Record<string, any>>(
  supabase: ReturnType<typeof getSupabaseClient>,
  table: string,
  records: T[],
  onConflict: string
): Promise<number> {
  let stored = 0;

  for (let i = 0; i < records.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = records.slice(i, i + UPSERT_CHUNK_SIZE);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict });
    if (!error) stored += chunk.length;
    else console.error(`${table} upsert error:`, error.message, error.code);
  }

  return stored;
}

function dedupeRecords<T>(records: T[], keyFn: (record: T) => string): T[] {
  const byKey = new Map<string, T>();
  for (const record of records) {
    byKey.set(keyFn(record), record);
  }
  return Array.from(byKey.values());
}
