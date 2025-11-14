#!/usr/bin/env node

const https = require('https');

// Submit a test lead to production
const leadData = {
  firstName: 'Test',
  lastName: 'Email Fix',
  phone: '+17209187465', // Pink Auto Glass number
  email: 'doug@pinkautoglass.com',
  vehicleYear: 2024,
  vehicleMake: 'Toyota',
  vehicleModel: 'Camry',
  serviceType: 'repair',
  mobileService: true,
  zipCode: '80202',
  city: 'Denver',
  state: 'CO',
  smsConsent: false,
  privacyAcknowledgment: true,
  formStartTime: Date.now() - 5000, // Started 5 seconds ago
};

const postData = JSON.stringify(leadData);

const options = {
  hostname: 'pinkautoglass.com',
  path: '/api/lead',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

console.log('📤 Submitting test lead to production...');
console.log('Lead details:', {
  name: `${leadData.firstName} ${leadData.lastName}`,
  email: leadData.email,
  vehicle: `${leadData.vehicleYear} ${leadData.vehicleMake} ${leadData.vehicleModel}`
});
console.log('');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response body:', data);
    console.log('');

    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      console.log('✅ Lead submitted successfully!');
      console.log('   Lead ID:', response.leadId);
      console.log('');
      console.log('⏳ Now checking if email was sent...');
      console.log('   Wait 5 seconds for email to be sent, then run:');
      console.log('   node scripts/check-resend-emails.js | grep -A3 "Email Fix"');
    } else {
      console.log('❌ Lead submission failed');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
