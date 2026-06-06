import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const allowedLegacyFiles = new Set([
  'src/app/api/booking/submit/route.ts',
  'src/app/api/lead/route.ts',
  'src/app/api/webhook/ringcentral/sms/route.ts',
  'src/lib/drip/processor.ts',
  'src/lib/notifications/beetexting.ts',
]);

const autoQuoterFiles = [
  'src/lib/quote/contact-notifications.ts',
  'src/lib/quote/booking-notifications.ts',
  'src/app/api/quote/contact/route.ts',
  'src/app/api/quote/book/route.ts',
];

for (const file of autoQuoterFiles) {
  const contents = readFileSync(file, 'utf8');
  assert(
    !/beetexting|sendCustomerSMS/.test(contents),
    `${file} must not use Beetexting; auto-quoter SMS must use RingCentral sendSMS/sendAdminSMS`
  );
}

const matches = execFileSync(
  'rg',
  ['-l', "beetexting|sendCustomerSMS", 'src/app', 'src/lib'],
  { encoding: 'utf8' }
)
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const unexpected = matches.filter((file) => !allowedLegacyFiles.has(file));
assert.deepEqual(
  unexpected,
  [],
  `Unexpected Beetexting usage found. New notification work must use RingCentral only: ${unexpected.join(', ')}`
);

console.log('Beetexting guard passed: auto-quoter is RingCentral-only and no new Beetexting usage was found.');
