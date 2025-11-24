#!/usr/bin/env node

/**
 * Google Ads Authentication Diagnostic Script
 *
 * This script diagnoses Google Ads API authentication issues and provides
 * actionable solutions based on the specific error encountered.
 *
 * Usage:
 *   node scripts/diagnose-google-ads-auth.js
 *
 * Prerequisites:
 *   - Node.js 18+
 *   - Environment variables loaded (via .env.local, .env.production, or Vercel)
 */

const https = require('https');
const path = require('path');

// Try to load environment variables from various sources
function loadEnv() {
  const envFiles = ['.env.local', '.env.production', '.env'];

  for (const envFile of envFiles) {
    try {
      require('dotenv').config({ path: path.join(process.cwd(), envFile) });
    } catch (e) {
      // dotenv not available or file doesn't exist, continue
    }
  }
}

loadEnv();

// Required credentials
const REQUIRED_VARS = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID'
];

// ANSI colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

function logResult(label, value, status = 'info') {
  const statusColors = {
    pass: 'green',
    fail: 'red',
    warn: 'yellow',
    info: 'cyan'
  };
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : status === 'warn' ? '⚠' : '→';
  console.log(`${colors[statusColors[status]]}${icon}${colors.reset} ${label}: ${value}`);
}

/**
 * Check if all required environment variables are present
 */
function checkEnvironmentVariables() {
  logSection('1. ENVIRONMENT VARIABLES CHECK');

  const results = {
    present: [],
    missing: [],
    hasNewlines: []
  };

  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];

    if (!value || value.trim() === '') {
      results.missing.push(varName);
      logResult(varName, 'MISSING', 'fail');
    } else {
      // Check for newline characters
      if (value.includes('\n') || value.includes('\\n')) {
        results.hasNewlines.push(varName);
        logResult(varName, `Present but contains newline character!`, 'warn');
      } else {
        results.present.push(varName);
        // Show masked value for security
        const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
        logResult(varName, `Present (${masked})`, 'pass');
      }
    }
  }

  return results;
}

/**
 * Test OAuth token by exchanging refresh token for access token
 */
async function testOAuthToken() {
  logSection('2. OAUTH TOKEN TEST');

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    logResult('Token test', 'Skipped - missing credentials', 'warn');
    return { success: false, error: 'missing_credentials' };
  }

  log('Attempting to exchange refresh token for access token...', 'cyan');

  return new Promise((resolve) => {
    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.access_token) {
            logResult('Token exchange', 'SUCCESS - Got valid access token', 'pass');
            logResult('Token type', response.token_type, 'info');
            logResult('Expires in', `${response.expires_in} seconds`, 'info');
            resolve({ success: true, accessToken: response.access_token });
          } else if (response.error) {
            logResult('Token exchange', `FAILED - ${response.error}`, 'fail');
            if (response.error_description) {
              logResult('Error details', response.error_description, 'fail');
            }
            resolve({ success: false, error: response.error, description: response.error_description });
          }
        } catch (e) {
          logResult('Token exchange', `FAILED - Could not parse response`, 'fail');
          resolve({ success: false, error: 'parse_error', rawResponse: data });
        }
      });
    });

    req.on('error', (e) => {
      logResult('Token exchange', `FAILED - Network error: ${e.message}`, 'fail');
      resolve({ success: false, error: 'network_error', message: e.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Test Google Ads API connection (if token test passed)
 */
async function testGoogleAdsAPI(accessToken) {
  logSection('3. GOOGLE ADS API TEST');

  if (!accessToken) {
    logResult('API test', 'Skipped - no valid access token', 'warn');
    return { success: false, error: 'no_token' };
  }

  const customerId = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/[-\s]/g, '');
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  log('Testing Google Ads API connection...', 'cyan');

  return new Promise((resolve) => {
    const query = 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1';
    const postData = JSON.stringify({ query });

    const options = {
      hostname: 'googleads.googleapis.com',
      port: 443,
      path: `/v18/customers/${customerId}/googleAds:searchStream`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          logResult('API connection', 'SUCCESS', 'pass');
          try {
            const response = JSON.parse(data);
            if (response[0]?.results?.[0]?.customer) {
              const customer = response[0].results[0].customer;
              logResult('Customer ID', customer.id, 'info');
              logResult('Account name', customer.descriptiveName || 'N/A', 'info');
            }
          } catch (e) {
            // Response parsing optional
          }
          resolve({ success: true });
        } else {
          logResult('API connection', `FAILED - HTTP ${res.statusCode}`, 'fail');
          try {
            const error = JSON.parse(data);
            if (error.error?.message) {
              logResult('Error', error.error.message, 'fail');
            }
          } catch (e) {
            logResult('Response', data.substring(0, 200), 'fail');
          }
          resolve({ success: false, statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (e) => {
      logResult('API connection', `FAILED - ${e.message}`, 'fail');
      resolve({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Generate diagnosis and recommendations
 */
function generateDiagnosis(envResults, tokenResult, apiResult) {
  logSection('4. DIAGNOSIS & RECOMMENDATIONS');

  const issues = [];
  const solutions = [];

  // Check for missing variables
  if (envResults.missing.length > 0) {
    issues.push(`Missing environment variables: ${envResults.missing.join(', ')}`);
    solutions.push({
      priority: 'HIGH',
      action: 'Add missing environment variables',
      steps: [
        'Check Vercel dashboard for missing variables',
        'Or add to .env.local for local development',
        `Missing: ${envResults.missing.join(', ')}`
      ]
    });
  }

  // Check for newline issues
  if (envResults.hasNewlines.length > 0) {
    issues.push(`Variables with newline characters: ${envResults.hasNewlines.join(', ')}`);
    solutions.push({
      priority: 'HIGH',
      action: 'Remove newline characters from environment variables',
      steps: [
        'Run: vercel env rm <VAR_NAME> production -y',
        'Run: printf \'%s\' \'<value>\' | vercel env add <VAR_NAME> production',
        'Redeploy: vercel --prod',
        `Affected variables: ${envResults.hasNewlines.join(', ')}`
      ]
    });
  }

  // Check token errors
  if (tokenResult && !tokenResult.success) {
    if (tokenResult.error === 'invalid_grant') {
      issues.push('OAuth refresh token is invalid or expired');
      solutions.push({
        priority: 'HIGH',
        action: 'Regenerate refresh token AND check OAuth app publishing status',
        steps: [
          '1. Go to Google Cloud Console > APIs & Services > OAuth consent screen',
          '2. Check "Publishing status" - if "Testing", tokens expire in 7 DAYS',
          '3. Click "PUBLISH APP" to switch to Production mode (no verification needed)',
          '4. Generate new refresh token: node scripts/generate-google-ads-refresh-token.js',
          '5. Update in Vercel: vercel env rm GOOGLE_ADS_REFRESH_TOKEN production -y',
          '6. Add new token: printf \'%s\' \'<new_token>\' | vercel env add GOOGLE_ADS_REFRESH_TOKEN production',
          '7. Redeploy: vercel --prod'
        ]
      });

      // Add specific note about Testing vs Production mode
      log('\n⚠️  IMPORTANT: Testing Mode vs Production Mode', 'yellow');
      console.log('   If your OAuth app is in "Testing" mode, refresh tokens expire every 7 days!');
      console.log('   Publishing to "Production" mode makes tokens last indefinitely.');
      console.log('   This does NOT require Google verification - just click "PUBLISH APP".\n');

    } else if (tokenResult.error === 'invalid_client') {
      issues.push('OAuth client credentials are invalid');
      solutions.push({
        priority: 'HIGH',
        action: 'Verify OAuth client credentials',
        steps: [
          'Go to Google Cloud Console > APIs & Services > Credentials',
          'Find your OAuth 2.0 Client ID',
          'Verify GOOGLE_ADS_CLIENT_ID matches the Client ID',
          'Verify GOOGLE_ADS_CLIENT_SECRET matches the Client secret',
          'If credentials were regenerated, update all three: CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN'
        ]
      });
    } else if (tokenResult.error === 'unauthorized_client') {
      issues.push('Refresh token was generated with different OAuth credentials');
      solutions.push({
        priority: 'HIGH',
        action: 'Regenerate refresh token with correct credentials',
        steps: [
          'The refresh token must be generated using YOUR OAuth Client ID/Secret',
          'If using OAuth Playground, enable "Use your own OAuth credentials"',
          'Generate new token: node scripts/generate-google-ads-refresh-token.js',
          'Update GOOGLE_ADS_REFRESH_TOKEN in Vercel'
        ]
      });
    }
  }

  // Print diagnosis
  if (issues.length === 0) {
    log('✓ No issues detected - Google Ads authentication is working correctly!', 'green');
  } else {
    log(`Found ${issues.length} issue(s):\n`, 'red');
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }

  // Print solutions
  if (solutions.length > 0) {
    logSection('5. RECOMMENDED SOLUTIONS');

    solutions.forEach((solution, i) => {
      console.log(`\n[${solution.priority}] Solution ${i + 1}: ${solution.action}`);
      console.log('-'.repeat(50));
      solution.steps.forEach((step, j) => {
        console.log(`   ${step}`);
      });
    });
  }

  return { issues, solutions };
}

/**
 * Main diagnostic function
 */
async function runDiagnostics() {
  console.log('\n');
  log('╔══════════════════════════════════════════════════════════╗', 'blue');
  log('║     GOOGLE ADS AUTHENTICATION DIAGNOSTIC TOOL            ║', 'blue');
  log('╚══════════════════════════════════════════════════════════╝', 'blue');
  console.log(`\nRunning diagnostics at: ${new Date().toISOString()}\n`);

  // Step 1: Check environment variables
  const envResults = checkEnvironmentVariables();

  // Step 2: Test OAuth token exchange
  const tokenResult = await testOAuthToken();

  // Step 3: Test Google Ads API (only if token worked)
  const apiResult = await testGoogleAdsAPI(tokenResult.success ? tokenResult.accessToken : null);

  // Step 4: Generate diagnosis
  const diagnosis = generateDiagnosis(envResults, tokenResult, apiResult);

  // Summary
  logSection('SUMMARY');
  const allPassed = envResults.missing.length === 0 &&
                    envResults.hasNewlines.length === 0 &&
                    tokenResult.success &&
                    apiResult.success;

  if (allPassed) {
    log('✓ All checks passed! Google Ads integration is healthy.', 'green');
  } else {
    log('✗ Issues detected. See recommendations above.', 'red');
  }

  console.log('\n');

  // Return results for programmatic use
  return {
    healthy: allPassed,
    environment: envResults,
    tokenTest: tokenResult,
    apiTest: apiResult,
    diagnosis
  };
}

// Run if executed directly
if (require.main === module) {
  runDiagnostics()
    .then(results => {
      process.exit(results.healthy ? 0 : 1);
    })
    .catch(err => {
      console.error('Diagnostic script failed:', err);
      process.exit(1);
    });
}

module.exports = { runDiagnostics };
