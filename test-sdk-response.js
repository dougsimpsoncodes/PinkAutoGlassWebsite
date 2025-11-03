const { SDK } = require('@ringcentral/sdk');

const rcsdk = new SDK({
  server: process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com',
  clientId: process.env.RINGCENTRAL_CLIENT_ID?.trim(),
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET?.trim(),
});

const platform = rcsdk.platform();

platform.login({ jwt: process.env.RINGCENTRAL_JWT_TOKEN?.trim() })
  .then(async () => {
    console.log('✓ Logged in successfully');
    
    // Make a test API call
    const response = await platform.get('/restapi/v1.0/account/~/extension/~');
    
    console.log('\nResponse object details:');
    console.log('typeof response:', typeof response);
    console.log('response.constructor.name:', response.constructor.name);
    console.log('\nAvailable methods:');
    console.log('- json:', typeof response.json);
    console.log('- text:', typeof response.text);
    console.log('- ok:', typeof response.ok);
    console.log('- response:', typeof response.response);
    console.log('- request:', typeof response.request);
    console.log('\nAll keys:', Object.keys(response));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  });
