// Check RingCentral delivery status for discount rescue SMS sent since launch
import { SDK } from '@ringcentral/sdk';

const sdk = new SDK({
  server: process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com',
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

await sdk.platform().login({ jwt: process.env.RINGCENTRAL_JWT_TOKEN });

const resp = await sdk.platform().get('/restapi/v1.0/account/~/extension/~/message-store', {
  messageType: 'SMS',
  direction: 'Outbound',
  dateFrom: '2026-06-10T14:00:00.000Z',
  perPage: 200,
});
const data = await resp.json();

for (const m of data.records || []) {
  const snippet = (m.subject || '').slice(0, 60).replace(/\n/g, ' ');
  const isRescue = (m.subject || '').includes('10% off');
  if (isRescue) {
    console.log(JSON.stringify({
      time: m.creationTime,
      to: m.to?.[0]?.phoneNumber?.slice(-4),
      status: m.messageStatus,
      smsDeliveryTime: m.smsDeliveryTime || null,
      snippet,
    }));
  }
}
