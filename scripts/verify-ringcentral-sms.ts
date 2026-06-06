import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

const sourceSearch = spawnSync(
  'rg',
  ['-l', "notifications/beetexting|provider:\\s*['\"]beetexting['\"]", 'src/app', 'src/lib'],
  { encoding: 'utf8' }
);

assert(
  sourceSearch.status === 0 || sourceSearch.status === 1,
  `Source search failed: ${sourceSearch.stderr}`
);

const sourceMatches = sourceSearch.stdout
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

assert.deepEqual(
  sourceMatches,
  [],
  `Deprecated Beetexting SMS source usage found. SMS must use RingCentral only: ${sourceMatches.join(', ')}`
);

const autoQuoterFiles = [
  'src/lib/quote/contact-notifications.ts',
  'src/lib/quote/booking-notifications.ts',
  'src/app/api/quote/contact/route.ts',
  'src/app/api/quote/book/route.ts',
];

for (const file of autoQuoterFiles) {
  const contents = readFileSync(file, 'utf8');
  assert(
    !/ringcentral-customer|sendCustomerSMS/.test(contents),
    `${file} must use direct RingCentral sendSMS/sendAdminSMS helpers`
  );
}

console.log('RingCentral SMS guard passed: deprecated provider usage was not found.');
