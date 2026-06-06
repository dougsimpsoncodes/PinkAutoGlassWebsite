import dotenv from 'dotenv';
import { SDK } from '@ringcentral/sdk';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

function maskPhone(value?: string): string {
  const digits = (value || '').replace(/\D/g, '');
  if (!digits) return '<empty>';
  return `***${digits.slice(-4)} (${digits.length} digits)`;
}

async function main() {
  const clientId = process.env.RINGCENTRAL_CLIENT_ID;
  const clientSecret = process.env.RINGCENTRAL_CLIENT_SECRET;
  const jwtToken = process.env.RINGCENTRAL_JWT_TOKEN;
  const server = process.env.RINGCENTRAL_SERVER_URL || 'https://platform.ringcentral.com';
  const configuredSender = process.env.RINGCENTRAL_PHONE_NUMBER;

  if (!clientId || !clientSecret || !jwtToken || !configuredSender) {
    throw new Error('Missing RingCentral env. Required: RINGCENTRAL_CLIENT_ID, RINGCENTRAL_CLIENT_SECRET, RINGCENTRAL_JWT_TOKEN, RINGCENTRAL_PHONE_NUMBER.');
  }

  const sdk = new SDK({ server, clientId, clientSecret });
  const platform = sdk.platform();
  await platform.login({ jwt: jwtToken });

  const numbers = await (await platform.get('/restapi/v1.0/account/~/extension/~/phone-number')).json();
  const configuredDigits = configuredSender.replace(/\D/g, '');
  const records = numbers.records || [];
  const match = records.find((record: { phoneNumber?: string }) => {
    const digits = (record.phoneNumber || '').replace(/\D/g, '');
    return digits === configuredDigits;
  });

  if (!match) {
    throw new Error(`Configured RingCentral sender ${maskPhone(configuredSender)} is not assigned to the authenticated extension.`);
  }

  const features = Array.isArray(match.features) ? match.features : [];
  if (!features.includes('SmsSender')) {
    const smsCapable = records
      .filter((record: { features?: string[] }) => Array.isArray(record.features) && record.features.includes('SmsSender'))
      .map((record: { phoneNumber?: string }) => maskPhone(record.phoneNumber))
      .join(', ') || 'none';

    throw new Error(
      `Configured RingCentral sender ${maskPhone(configuredSender)} is assigned to the extension but lacks SmsSender. ` +
      `Use an SMS-capable extension number instead. Available SMS-capable numbers: ${smsCapable}.`
    );
  }

  console.log(`RingCentral SMS sender check passed: ${maskPhone(configuredSender)} has SmsSender on the authenticated extension.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
