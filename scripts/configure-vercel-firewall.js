#!/usr/bin/env node

/**
 * Configure Vercel Firewall to bypass /api/admin/* routes
 * Uses Vercel REST API to update firewall configuration
 */

const https = require('https');

// Get team/project info from .vercel/project.json
const fs = require('fs');
const path = require('path');

const projectJsonPath = path.join(__dirname, '../.vercel/project.json');
if (!fs.existsSync(projectJsonPath)) {
  console.error('Error: .vercel/project.json not found. Run `vercel link` first.');
  process.exit(1);
}

const projectConfig = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
const projectId = projectConfig.projectId;
const orgId = projectConfig.orgId;

// Get Vercel token from environment or .vercel/auth.json
let token = process.env.VERCEL_TOKEN;
if (!token) {
  const authJsonPath = path.join(require('os').homedir(), '.vercel/auth.json');
  if (fs.existsSync(authJsonPath)) {
    const authConfig = JSON.parse(fs.readFileSync(authJsonPath, 'utf8'));
    token = authConfig.token;
  }
}

if (!token) {
  console.error('Error: VERCEL_TOKEN environment variable or auth token not found');
  console.error('Run: export VERCEL_TOKEN=your_token_here');
  process.exit(1);
}

console.log('Configuring Vercel Firewall...');
console.log(`Project ID: ${projectId}`);
console.log(`Org ID: ${orgId}\n`);

// Firewall configuration
const firewallConfig = {
  firewallEnabled: true,
  rules: [
    {
      id: 'bypass-admin-api',
      name: 'Bypass Admin API Routes',
      description: 'Allow authenticated admin API requests without firewall challenges',
      active: true,
      conditionGroup: [
        {
          conditions: [
            {
              type: 'path',
              op: 'pre', // 'pre' = starts with
              value: '/api/admin/'
            }
          ]
        }
      ],
      action: {
        mitigate: {
          action: 'bypass'
        }
      }
    },
    {
      id: 'bypass-admin-pages',
      name: 'Bypass Admin Pages',
      description: 'Allow authenticated admin page requests',
      active: true,
      conditionGroup: [
        {
          conditions: [
            {
              type: 'path',
              op: 'pre',
              value: '/admin/'
            }
          ]
        }
      ],
      action: {
        mitigate: {
          action: 'bypass'
        }
      }
    }
  ],
  ips: [],
  crs: {
    sd: { active: true, action: 'log' },
    ma: { active: true, action: 'log' },
    lfi: { active: true, action: 'log' },
    rfi: { active: true, action: 'log' },
    rce: { active: true, action: 'log' },
    php: { active: true, action: 'log' },
    gen: { active: true, action: 'log' },
    xss: { active: true, action: 'log' },
    sqli: { active: true, action: 'log' },
    sf: { active: true, action: 'log' },
    java: { active: true, action: 'log' }
  }
};

// Make API request
const data = JSON.stringify(firewallConfig);

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v1/security/firewall/${projectId}?teamId=${orgId}`,
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Firewall configuration updated successfully!\n');
      console.log('Rules created:');
      console.log('  1. Bypass all /api/admin/* routes');
      console.log('  2. Bypass all /admin/* pages');
      console.log('\nCore Rule Set (CRS) set to "log" mode for monitoring.');
      console.log('\nWait 1-2 minutes for changes to propagate, then test your admin site.');
    } else {
      console.error('❌ Failed to update firewall configuration');
      console.error('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
