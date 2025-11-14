#!/usr/bin/env node

const https = require('https');

const username = 'admin';
const password = 'Pink!';
const auth = Buffer.from(`${username}:${password}`).toString('base64');

console.log('Testing /api/admin/calls endpoint...\n');

const options = {
  hostname: 'pinkautoglass.com',
  port: 443,
  path: '/api/admin/calls?limit=1000',
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}\n`);
    console.log('Response headers:');
    Object.keys(res.headers).forEach(key => {
      if (key.toLowerCase().includes('cache') || key.toLowerCase().includes('vercel')) {
        console.log(`  ${key}: ${res.headers[key]}`);
      }
    });

    try {
      const json = JSON.parse(data);
      console.log('\nResponse data:');
      console.log(`  Total calls: ${json.total}`);
      console.log(`  Calls returned: ${json.calls?.length || 0}`);
      console.log(`  Limit: ${json.limit}`);
      console.log(`  Offset: ${json.offset}`);

      if (json.calls && json.calls.length > 0) {
        console.log('\n📅 Most recent 5 calls:');
        json.calls.slice(0, 5).forEach((call, i) => {
          console.log(`  ${i + 1}. ${call.start_time} | ${call.direction} | ${call.result}`);
        });

        console.log('\n📅 Oldest 5 calls:');
        json.calls.slice(-5).forEach((call, i) => {
          console.log(`  ${i + 1}. ${call.start_time} | ${call.direction} | ${call.result}`);
        });

        // Check for Nov 7 vs Nov 12 calls
        const nov12Calls = json.calls.filter(c => c.start_time.startsWith('2025-11-12'));
        const nov7Calls = json.calls.filter(c => c.start_time.startsWith('2025-11-07'));

        console.log(`\n📊 Call date distribution:`);
        console.log(`  Nov 12 calls: ${nov12Calls.length}`);
        console.log(`  Nov 7 calls: ${nov7Calls.length}`);
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Request failed:', error.message);
});

req.end();
