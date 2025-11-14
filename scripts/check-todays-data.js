import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  console.log('Current time:', now.toISOString());
  console.log('Today (midnight):', today.toISOString());
  console.log('Yesterday (midnight):', yesterday.toISOString());
  console.log('');

  // Check today's calls
  const { data: todayCalls, error: todayCallsError } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', today.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  if (todayCallsError) {
    console.error('Error fetching today\'s calls:', todayCallsError);
  } else {
    const uniqueToday = new Set(todayCalls.map(c => c.from_number)).size;
    console.log(`Today's calls: ${todayCalls.length} total, ${uniqueToday} unique callers`);
    if (todayCalls.length > 0) {
      console.log('  First call:', todayCalls[todayCalls.length - 1].start_time);
      console.log('  Last call:', todayCalls[0].start_time);
    }
  }
  console.log('');

  // Check yesterday's calls
  const { data: yesterdayCalls, error: yesterdayCallsError } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', yesterday.toISOString())
    .lt('start_time', today.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  if (yesterdayCallsError) {
    console.error('Error fetching yesterday\'s calls:', yesterdayCallsError);
  } else {
    const uniqueYesterday = new Set(yesterdayCalls.map(c => c.from_number)).size;
    console.log(`Yesterday's calls: ${yesterdayCalls.length} total, ${uniqueYesterday} unique callers`);
    if (yesterdayCalls.length > 0) {
      console.log('  First call:', yesterdayCalls[yesterdayCalls.length - 1].start_time);
      console.log('  Last call:', yesterdayCalls[0].start_time);
    }
  }
  console.log('');

  // Check today's leads
  const { data: todayLeads, error: todayLeadsError } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (todayLeadsError) {
    console.error('Error fetching today\'s leads:', todayLeadsError);
  } else {
    console.log(`Today's web leads: ${todayLeads.length}`);
    if (todayLeads.length > 0) {
      console.log('  First lead:', todayLeads[todayLeads.length - 1].created_at);
      console.log('  Last lead:', todayLeads[0].created_at);
    }
  }
  console.log('');

  // Check yesterday's leads
  const { data: yesterdayLeads, error: yesterdayLeadsError } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString())
    .order('created_at', { ascending: false });

  if (yesterdayLeadsError) {
    console.error('Error fetching yesterday\'s leads:', yesterdayLeadsError);
  } else {
    console.log(`Yesterday's web leads: ${yesterdayLeads.length}`);
    if (yesterdayLeads.length > 0) {
      console.log('  First lead:', yesterdayLeads[yesterdayLeads.length - 1].created_at);
      console.log('  Last lead:', yesterdayLeads[0].created_at);
    }
  }
}

checkData().catch(console.error);
