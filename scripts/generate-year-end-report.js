/**
 * Generate Year-End Summary Report for 2025
 * This script generates a comprehensive summary of business performance for the year
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function importFetch() {
  const { default: fetch } = await import('node-fetch');
  return fetch;
}

async function generateYearEndReport() {
  const fetch = await importFetch();
  
  console.log('🎊 Generating Year-End Summary Report for 2025...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Define date ranges for 2025
  const yearStart = new Date('2025-01-01T00:00:00.000Z');
  const yearEnd = new Date('2025-12-31T23:59:59.999Z');
  const now = new Date();

  console.log(`📅 Report Period: ${yearStart.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`);

  // 1. Fetch all calls for 2025
  console.log('📞 Fetching call data...');
  const { data: allCalls } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', yearStart.toISOString())
    .lte('start_time', yearEnd.toISOString())
    .order('start_time', { ascending: false });

  // Deduplicate calls (same logic as daily report)
  const sessionMap = new Map();
  (allCalls || []).forEach(call => {
    const existing = sessionMap.get(call.session_id);
    if (!existing) {
      sessionMap.set(call.session_id, call);
    } else {
      const isInboundToUs = call.direction === 'Inbound' && call.to_number === '+17209187465';
      const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === '+17209187465';
      if (isInboundToUs && !existingIsInboundToUs) {
        sessionMap.set(call.session_id, call);
      }
    }
  });
  const calls = Array.from(sessionMap.values());

  // 2. Fetch all leads for 2025
  console.log('📋 Fetching leads data...');
  const { data: allLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', yearStart.toISOString())
    .lte('created_at', yearEnd.toISOString())
    .order('created_at', { ascending: false });

  // Filter test leads
  const leads = (allLeads || []).filter(lead => {
    const email = (lead.email || '').toLowerCase();
    const name = ((lead.first_name || '') + ' ' + (lead.last_name || '')).toLowerCase();
    const hasTest = email.includes('test') || name.includes('test');
    const isPink = email.endsWith('@pink.com') || email.endsWith('@pinkautoglass.com');
    return !(hasTest && isPink);
  });

  // 3. Fetch conversion events for 2025
  console.log('🖱️ Fetching conversion events...');
  const { data: conversionEvents } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', yearStart.toISOString())
    .lte('created_at', yearEnd.toISOString())
    .in('event_type', ['phone_click', 'text_click']);

  // 4. Get monthly breakdown
  console.log('📊 Calculating monthly breakdown...');
  
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize all months
  for (let i = 0; i < 12; i++) {
    const month = String(i + 1).padStart(2, '0');
    monthlyData[month] = {
      name: monthNames[i],
      calls: 0,
      uniqueCallers: new Set(),
      leads: 0,
      clickToCalls: 0,
      clickToTexts: 0,
      totalLeads: 0
    };
  }

  // Process calls
  calls.forEach(call => {
    if (call.direction === 'Inbound') {
      const date = new Date(call.start_time);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      if (monthlyData[month]) {
        monthlyData[month].calls++;
        monthlyData[month].uniqueCallers.add(call.from_number);
      }
    }
  });

  // Process leads
  leads.forEach(lead => {
    const date = new Date(lead.created_at);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    if (monthlyData[month]) {
      monthlyData[month].leads++;
    }
  });

  // Process conversion events
  (conversionEvents || []).forEach(event => {
    const date = new Date(event.created_at);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    if (monthlyData[month]) {
      if (event.event_type === 'phone_click') {
        monthlyData[month].clickToCalls++;
      } else if (event.event_type === 'text_click') {
        monthlyData[month].clickToTexts++;
      }
    }
  });

  // Calculate totals
  Object.values(monthlyData).forEach(month => {
    month.uniqueCallers = month.uniqueCallers.size;
    month.totalLeads = month.calls + month.leads + month.clickToCalls + month.clickToTexts;
  });

  // 5. Calculate year totals
  const yearTotals = {
    totalCalls: calls.filter(c => c.direction === 'Inbound').length,
    uniqueCallers: new Set(calls.filter(c => c.direction === 'Inbound').map(c => c.from_number)).size,
    totalLeads: leads.length,
    totalClickToCalls: (conversionEvents || []).filter(e => e.event_type === 'phone_click').length,
    totalClickToTexts: (conversionEvents || []).filter(e => e.event_type === 'text_click').length,
    grandTotal: 0
  };
  
  yearTotals.grandTotal = yearTotals.totalCalls + yearTotals.totalLeads + yearTotals.totalClickToCalls + yearTotals.totalClickToTexts;

  // 6. Find peak months
  const sortedMonths = Object.entries(monthlyData)
    .map(([key, data]) => ({ month: key, name: data.name, ...data }))
    .sort((a, b) => b.totalLeads - a.totalLeads);

  const bestMonth = sortedMonths[0];
  const quietestMonth = sortedMonths[sortedMonths.length - 1];

  // 7. Calculate average per month
  const currentMonth = now.getMonth() + 1; // 1-12
  const activeMonths = currentMonth; // How many months we have data for
  const avgPerMonth = Math.round(yearTotals.grandTotal / activeMonths);

  console.log('✅ Data analysis complete!\n');
  
  // Generate HTML report
  const html = generateYearEndHTML({
    yearTotals,
    monthlyData,
    bestMonth,
    quietestMonth,
    avgPerMonth,
    activeMonths,
    currentDate: now
  });

  // Save to file
  const outputPath = path.join(__dirname, '..', 'year-end-report-2025.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`📄 Year-end report generated: ${outputPath}`);
  
  return outputPath;
}

function generateYearEndHTML(data) {
  const { yearTotals, monthlyData, bestMonth, quietestMonth, avgPerMonth, activeMonths, currentDate } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pink Auto Glass - 2025 Year-End Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
      color: white;
      padding: 40px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 2.5em;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 1.1em;
    }
    .content {
      padding: 32px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      border-left: 4px solid;
      transition: transform 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
    }
    .stat-card.calls { border-left-color: #3b82f6; }
    .stat-card.leads { border-left-color: #10b981; }
    .stat-card.clicks { border-left-color: #8b5cf6; }
    .stat-card.total { border-left-color: #f59e0b; }
    .stat-number {
      font-size: 2.5em;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .monthly-chart {
      background: #f8f9fa;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .chart-title {
      font-size: 1.5em;
      font-weight: 600;
      margin: 0 0 24px 0;
      text-align: center;
      color: #333;
    }
    .chart-bars {
      display: flex;
      align-items: end;
      height: 200px;
      gap: 8px;
      padding: 0 16px;
    }
    .bar {
      flex: 1;
      background: linear-gradient(180deg, #E91E63, #C2185B);
      border-radius: 4px 4px 0 0;
      min-height: 4px;
      position: relative;
      transition: all 0.3s;
    }
    .bar:hover {
      opacity: 0.8;
    }
    .bar-label {
      position: absolute;
      bottom: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.8em;
      color: #666;
      font-weight: 500;
    }
    .bar-value {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7em;
      color: #333;
      font-weight: 600;
      background: rgba(255,255,255,0.9);
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .insights {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
      margin-top: 32px;
    }
    .insight-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
    }
    .insight-title {
      font-size: 1.2em;
      font-weight: 600;
      margin: 0 0 8px 0;
    }
    .insight-text {
      opacity: 0.9;
      line-height: 1.5;
    }
    .highlight {
      background: rgba(255,255,255,0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
    .footer {
      background: #f8f9fa;
      padding: 24px 32px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e5e7eb;
    }
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .chart-bars {
        height: 150px;
      }
      .insights {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 2025 Year-End Summary</h1>
      <p>Pink Auto Glass Business Performance Report</p>
      <p>Generated on ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <div class="stats-grid">
        <div class="stat-card calls">
          <div class="stat-number">${yearTotals.totalCalls.toLocaleString()}</div>
          <div class="stat-label">Phone Calls (${yearTotals.uniqueCallers} unique callers)</div>
        </div>
        <div class="stat-card leads">
          <div class="stat-number">${yearTotals.totalLeads.toLocaleString()}</div>
          <div class="stat-label">Quote Requests</div>
        </div>
        <div class="stat-card clicks">
          <div class="stat-number">${(yearTotals.totalClickToCalls + yearTotals.totalClickToTexts).toLocaleString()}</div>
          <div class="stat-label">Website Interactions</div>
        </div>
        <div class="stat-card total">
          <div class="stat-number">${yearTotals.grandTotal.toLocaleString()}</div>
          <div class="stat-label">Total Leads</div>
        </div>
      </div>

      <div class="monthly-chart">
        <h2 class="chart-title">Monthly Lead Generation</h2>
        <div class="chart-bars">
          ${Object.entries(monthlyData).map(([key, month]) => {
            const maxValue = Math.max(...Object.values(monthlyData).map(m => m.totalLeads));
            const height = maxValue > 0 ? (month.totalLeads / maxValue) * 100 : 2;
            return `
              <div class="bar" style="height: ${height}%">
                <div class="bar-value">${month.totalLeads}</div>
                <div class="bar-label">${month.name}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="insights">
        <div class="insight-card">
          <div class="insight-title">🏆 Best Performance</div>
          <div class="insight-text">
            <span class="highlight">${bestMonth.name}</span> was your strongest month with 
            <span class="highlight">${bestMonth.totalLeads} total leads</span>, including 
            ${bestMonth.calls} phone calls and ${bestMonth.leads} quote requests.
          </div>
        </div>
        
        <div class="insight-card">
          <div class="insight-title">📈 Growth Insights</div>
          <div class="insight-text">
            Averaging <span class="highlight">${avgPerMonth} leads per month</span> across ${activeMonths} months. 
            Your business generated leads from multiple sources: phone calls (${((yearTotals.totalCalls / yearTotals.grandTotal) * 100).toFixed(1)}%), 
            website forms (${((yearTotals.totalLeads / yearTotals.grandTotal) * 100).toFixed(1)}%), 
            and website interactions (${(((yearTotals.totalClickToCalls + yearTotals.totalClickToTexts) / yearTotals.grandTotal) * 100).toFixed(1)}%).
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-title">🎯 Key Metrics</div>
          <div class="insight-text">
            Your phone generated <span class="highlight">${yearTotals.uniqueCallers} unique customers</span> 
            across ${yearTotals.totalCalls} calls. The website conversion tracking shows 
            <span class="highlight">${yearTotals.totalClickToCalls} click-to-calls</span> and 
            <span class="highlight">${yearTotals.totalClickToTexts} click-to-texts</span>, 
            demonstrating strong digital engagement.
          </div>
        </div>

        <div class="insight-card">
          <div class="insight-title">🚀 2026 Outlook</div>
          <div class="insight-text">
            Based on your current trajectory of <span class="highlight">${avgPerMonth} leads/month</span>, 
            you're positioned for continued growth. Focus on your strongest channels: phone and website forms, 
            while optimizing the click-to-contact features for even better conversion rates.
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Pink Auto Glass - Year-End Summary Report | Generated ${currentDate.toLocaleDateString()}</p>
      <p>Data includes: RingCentral call logs, website quote forms, and conversion tracking</p>
    </div>
  </div>
</body>
</html>`;
}

if (require.main === module) {
  generateYearEndReport().then(filePath => {
    console.log(`\n🎊 Year-end report complete! File saved to: ${filePath}`);
    console.log(`\n💡 To view the report, run: open "${filePath}"`);
  }).catch(console.error);
}

module.exports = { generateYearEndReport };