/**
 * Guard for isTeamOrTestContact (src/lib/constants.ts) — the team/test auto-tag
 * the auto-quoter booking path uses to keep internal/dev/team bookings out of
 * reporting (is_test=true). Run: npx tsx scripts/verify-test-detection.ts
 *
 * Covers the real pollution we saw: PAG-26BE "Kody Test" (team phone + name) and
 * PAG-8389 "Test"/555/"TEST" street — plus the false-positive guards that must
 * NOT tag a real customer.
 */
// Set env lists BEFORE importing (the helpers read process.env lazily on first call).
process.env.EXCLUDED_DRIP_PHONES = '+13036567671'; // simulate Kody's team phone in the list
process.env.TEST_PHONES = '+13031112222';

import { isTeamOrTestContact } from '../src/lib/constants';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { failures++; console.error('  ❌ FAIL:', msg); } else { console.log('  ✅', msg); }
}

console.log('SHOULD TAG (team/test):');
assert(isTeamOrTestContact({ fullName: 'Kody Test', phoneE164: '+13036567671', email: 'kodyolin5@gmail.com', street: '4999 Clayton St' }), 'PAG-26BE: team phone (env) + "test" in name');
assert(isTeamOrTestContact({ fullName: 'Test', phoneE164: '+13035555555', email: 'x@yahoo.com', street: 'TEST' }), 'PAG-8389: "Test" name + 555 phone + "TEST" street');
assert(isTeamOrTestContact({ phoneE164: '+13035555555' }), '555 exchange phone alone');
assert(isTeamOrTestContact({ fullName: 'jane test' }), 'name contains "test" as a word');
assert(isTeamOrTestContact({ street: '  TEST ' }), 'street "TEST" (trim + case-insensitive)');
assert(isTeamOrTestContact({ email: 'dan@PinkAutoGlass.com' }), 'team @pinkautoglass.com email (case-insensitive)');
assert(isTeamOrTestContact({ phoneE164: '+13031112222' }), 'phone in TEST_PHONES env list');

console.log('SHOULD NOT TAG (real customers — false-positive guards):');
assert(!isTeamOrTestContact({ fullName: 'Nicole Nielsen', phoneE164: '+13037778888', email: 'nicole@gmail.com', street: '1700 Lincoln St' }), 'ordinary real customer');
assert(!isTeamOrTestContact({ fullName: 'Testa Rosa', phoneE164: '+13037778888' }), '"Testa" is not the word "test"');
assert(!isTeamOrTestContact({ fullName: 'Pat Contest', phoneE164: '+13037778888' }), '"Contest" is not the word "test"');
assert(!isTeamOrTestContact({ street: 'Testament Way', phoneE164: '+13037778888' }), 'street "Testament Way" is not exactly "test"');
assert(!isTeamOrTestContact({ email: 'someone@pinkautoglassrepair.com', phoneE164: '+13037778888' }), 'look-alike domain is not the team domain');
assert(!isTeamOrTestContact({}), 'empty contact');

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
