// Test script for Google Ads API connection
require('dotenv').config({ path: '.env.local' });

async function testGoogleAdsConnection() {
  try {
    console.log('Testing Google Ads API Connection...\n');

    // Check environment variables
    console.log('Configuration Check:');
    console.log('  CLIENT_ID:', process.env.GOOGLE_ADS_CLIENT_ID ? 'Set' : 'Missing');
    console.log('  CLIENT_SECRET:', process.env.GOOGLE_ADS_CLIENT_SECRET ? 'Set' : 'Missing');
    console.log('  REFRESH_TOKEN:', process.env.GOOGLE_ADS_REFRESH_TOKEN ? 'Set' : 'Missing');
    console.log('  DEVELOPER_TOKEN:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'Set' : 'Missing');
    console.log('  CUSTOMER_ID:', process.env.GOOGLE_ADS_CUSTOMER_ID ? 'Set' : 'Missing');
    console.log('');

    if (!process.env.GOOGLE_ADS_CLIENT_ID || !process.env.GOOGLE_ADS_CLIENT_SECRET || !process.env.GOOGLE_ADS_REFRESH_TOKEN || !process.env.GOOGLE_ADS_DEVELOPER_TOKEN || !process.env.GOOGLE_ADS_CUSTOMER_ID) {
      throw new Error('Missing required Google Ads API credentials');
    }

    // Import Google Ads library
    const { GoogleAdsApi } = require('google-ads-api');

    console.log('Connecting to Google Ads API...');

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    console.log('  Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);
    console.log('');

    // Test query - get customer info
    console.log('Fetching account information...');

    const query = `
      SELECT
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone,
        customer.status
      FROM customer
      LIMIT 1
    `;

    const customerInfo = await customer.query(query);

    if (customerInfo && customerInfo.length > 0) {
      const info = customerInfo[0].customer;
      console.log('');
      console.log('Connection Successful!');
      console.log('');
      console.log('Account Details:');
      console.log('  Account Name:', info.descriptive_name || 'N/A');
      console.log('  Customer ID:', info.id);
      console.log('  Currency:', info.currency_code);
      console.log('  Time Zone:', info.time_zone);
      console.log('  Status:', info.status);
      console.log('');
      console.log('Google Ads API is working correctly!');
    } else {
      throw new Error('No customer data returned');
    }

  } catch (error) {
    console.error('');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('DEVELOPER_TOKEN_PROHIBITED')) {
      console.error('This error means your developer token only has "Test Account" access.');
      console.error('You need to apply for "Basic Access" in the Google Ads API Center.');
      console.error('Go to: https://ads.google.com/aw/apicenter');
    } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('invalid_grant')) {
      console.error('This error means the refresh token is invalid or does not have access to this account.');
      console.error('Make sure you generated the refresh token with the account that has access to Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);
    } else if (error.message.includes('INVALID_CUSTOMER_ID')) {
      console.error('The customer ID is invalid. Make sure it is the 10-digit number without dashes.');
    }

    console.error('');
    console.error('Full error details:', error);

    process.exit(1);
  }
}

testGoogleAdsConnection();
