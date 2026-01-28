/**
 * Validate Email Configuration for Daily Reports
 * Checks all required environment variables and email settings
 */

require('dotenv').config({ path: '.env.local' });

function validateEmailConfig() {
  console.log('🔍 Validating email configuration for daily reports...\n');

  const checks = [
    {
      name: 'RESEND_API_KEY',
      value: process.env.RESEND_API_KEY,
      required: true,
      description: 'Resend API key for sending emails'
    },
    {
      name: 'FROM_EMAIL',
      value: process.env.FROM_EMAIL,
      required: true,
      description: 'From email address'
    },
    {
      name: 'ADMIN_EMAIL',
      value: process.env.ADMIN_EMAIL,
      required: true,
      description: 'Admin email recipients (comma-separated)'
    },
    {
      name: 'CRON_SECRET',
      value: process.env.CRON_SECRET,
      required: true,
      description: 'Secret for authenticating cron jobs'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      required: true,
      description: 'Supabase project URL'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY,
      required: true,
      description: 'Supabase service role key'
    },
    {
      name: 'GOOGLE_ADS_CLIENT_ID',
      value: process.env.GOOGLE_ADS_CLIENT_ID,
      required: false,
      description: 'Google Ads API client ID'
    },
    {
      name: 'GOOGLE_ADS_REFRESH_TOKEN',
      value: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      required: false,
      description: 'Google Ads API refresh token'
    },
    {
      name: 'MICROSOFT_ADS_CLIENT_ID',
      value: process.env.MICROSOFT_ADS_CLIENT_ID,
      required: false,
      description: 'Microsoft Ads API client ID'
    },
    {
      name: 'MICROSOFT_ADS_REFRESH_TOKEN',
      value: process.env.MICROSOFT_ADS_REFRESH_TOKEN,
      required: false,
      description: 'Microsoft Ads API refresh token'
    }
  ];

  let allValid = true;
  let issues = [];

  checks.forEach(check => {
    const hasValue = check.value && check.value.trim() !== '';
    const status = hasValue ? '✅' : (check.required ? '❌' : '⚠️ ');
    
    console.log(`${status} ${check.name}`);
    console.log(`   ${check.description}`);
    
    if (hasValue) {
      // Show partial value for security
      const maskedValue = check.value.length > 10 
        ? `${check.value.slice(0, 8)}...${check.value.slice(-4)}`
        : `${check.value.slice(0, 3)}***`;
      console.log(`   Value: ${maskedValue}\n`);
    } else {
      if (check.required) {
        console.log(`   ❌ MISSING (required)\n`);
        allValid = false;
        issues.push(`Missing required: ${check.name}`);
      } else {
        console.log(`   ⚠️  Not set (optional - ads data may be missing)\n`);
        issues.push(`Optional missing: ${check.name}`);
      }
    }
  });

  // Test email parsing
  if (process.env.ADMIN_EMAIL) {
    const emails = process.env.ADMIN_EMAIL.split(',').map(e => e.trim());
    console.log('📧 Admin email recipients:');
    emails.forEach((email, i) => {
      const isValid = email.includes('@') && email.includes('.');
      console.log(`   ${i + 1}. ${email} ${isValid ? '✅' : '❌'}`);
      if (!isValid) {
        issues.push(`Invalid email: ${email}`);
        allValid = false;
      }
    });
    console.log('');
  }

  // Summary
  if (allValid) {
    console.log('🎉 All required email configuration is valid!');
    console.log('✅ Daily reports should work properly.');
    
    if (issues.length > 0) {
      console.log('\n⚠️  Optional issues (may affect ads data):');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
  } else {
    console.log('❌ Email configuration has issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n🔧 Fix these issues before daily reports will work.');
  }

  return allValid;
}

// Test email sending if config is valid
async function testEmailSend() {
  if (!validateEmailConfig()) {
    console.log('\n❌ Skipping email test due to configuration issues.');
    return;
  }

  console.log('\n🧪 Testing email send capability...');
  
  try {
    const { sendAdminEmail } = require('../src/lib/notifications/email.ts');
    
    const testHtml = `
      <h1>Daily Report Email Test</h1>
      <p>This is a test email to verify daily report functionality.</p>
      <p>Time: ${new Date().toISOString()}</p>
      <p>If you received this, email sending is working correctly!</p>
    `;

    const success = await sendAdminEmail('🧪 Daily Report Email Test', testHtml);
    
    if (success) {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your admin email inbox for the test message.');
    } else {
      console.log('❌ Test email failed to send.');
    }
  } catch (error) {
    console.error('❌ Email test error:', error.message);
  }
}

if (require.main === module) {
  // Run validation and optionally test email
  const args = process.argv.slice(2);
  const shouldTestEmail = args.includes('--test-email');

  if (shouldTestEmail) {
    testEmailSend().catch(console.error);
  } else {
    validateEmailConfig();
    console.log('\n💡 Run with --test-email to send a test email.');
  }
}

module.exports = { validateEmailConfig };