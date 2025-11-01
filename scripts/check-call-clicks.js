const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCallClicks() {
  try {
    // Get all time phone click events
    const { data: allTime, error: allTimeError } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'phone_click');

    if (allTimeError) throw allTimeError;

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: last30Days, error: last30Error } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'phone_click')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (last30Error) throw last30Error;

    // Get last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: last7Days, error: last7Error } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'phone_click')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (last7Error) throw last7Error;

    // Get today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData, error: todayError } = await supabase
      .from('conversion_events')
      .select('*', { count: 'exact' })
      .eq('event_type', 'phone_click')
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    // Get breakdown by source (last 30 days)
    const { data: bySource, error: bySourceError } = await supabase
      .from('conversion_events')
      .select('utm_source, utm_campaign, button_location')
      .eq('event_type', 'phone_click')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (bySourceError) throw bySourceError;

    // Count by source
    const sourceCounts = {};
    const locationCounts = {};
    bySource?.forEach(event => {
      const source = event.utm_source || 'direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;

      const location = event.button_location || 'unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    console.log('\n=== CALL BUTTON CLICKS ANALYSIS ===\n');
    console.log('All Time: ' + (allTime?.length || 0) + ' clicks');
    console.log('Last 30 Days: ' + (last30Days?.length || 0) + ' clicks');
    console.log('Last 7 Days: ' + (last7Days?.length || 0) + ' clicks');
    console.log('Today: ' + (todayData?.length || 0) + ' clicks');

    console.log('\n--- By Traffic Source (Last 30 Days) ---');
    Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(source + ': ' + count + ' clicks');
      });

    console.log('\n--- By Button Location (Last 30 Days) ---');
    Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([location, count]) => {
        console.log(location + ': ' + count + ' clicks');
      });

    // Also check other conversion types
    const { data: allConversions, error: allConvError } = await supabase
      .from('conversion_events')
      .select('event_type')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (!allConvError) {
      console.log('\n--- All Conversion Types (Last 30 Days) ---');
      const typeCounts = {};
      allConversions?.forEach(event => {
        typeCounts[event.event_type] = (typeCounts[event.event_type] || 0) + 1;
      });
      Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          console.log(type + ': ' + count);
        });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCallClicks();
