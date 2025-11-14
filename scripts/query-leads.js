#!/usr/bin/env node

const https = require('https');
const fs = require('fs');

const envContent = fs.readFileSync('.env.production', 'utf8');
const username = envContent.match(/ADMIN_USERNAME="?([^"\n]+)"?/)[1].trim();
const password = envContent.match(/ADMIN_PASSWORD="?([^"\n]+)"?/)[1].trim();

const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

https.get({
  hostname: 'pinkautoglass.com',
  path: '/api/admin/leads?status=new&limit=10',
  headers: { 'Authorization': auth }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Total new leads:', json.count);
    console.log('');
    if (json.leads) {
      json.leads.forEach((lead, i) => {
        const date = new Date(lead.created_at);
        console.log(`${i+1}. ${lead.email}`);
        console.log(`   Created: ${date.toLocaleString()}`);
        console.log(`   Name: ${lead.first_name || ''} ${lead.last_name || ''}`);
        console.log('');
      });
    }
  });
});
