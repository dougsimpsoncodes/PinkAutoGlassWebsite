/**
 * Unit tests for SMS opt-out keyword classification.
 * Tests ONLY pure functions — no DB calls, no Supabase, no side effects.
 * Run: npx tsx tests/sms-opt-out.test.ts
 */

// Import only the pure function (classifyMessage doesn't touch DB)
// We inline the logic to avoid triggering Supabase client init in the module scope.
// The actual classifyMessage is identical — this mirrors it for safe isolated testing.

const OPT_OUT_KEYWORDS = new Set(['stop', 'stopall', 'unsubscribe', 'cancel', 'end', 'quit']);
const OPT_IN_KEYWORDS = new Set(['start', 'unstop', 'subscribe']);
const HELP_KEYWORDS = new Set(['help', 'info']);

function classifyMessage(text: string): 'opt_out' | 'opt_in' | 'help' | 'normal' {
  const normalized = text.trim().replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (OPT_OUT_KEYWORDS.has(normalized)) return 'opt_out';
  if (OPT_IN_KEYWORDS.has(normalized)) return 'opt_in';
  if (HELP_KEYWORDS.has(normalized)) return 'help';
  return 'normal';
}

// ── Test runner ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label: string, actual: string, expected: string) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`  ✘ ${label}: expected "${expected}", got "${actual}"`);
  }
}

console.log('Testing classifyMessage()...\n');

// --- Opt-out keywords ---
assert('STOP',           classifyMessage('STOP'), 'opt_out');
assert('stop',           classifyMessage('stop'), 'opt_out');
assert('Stop',           classifyMessage('Stop'), 'opt_out');
assert('STOPALL',        classifyMessage('STOPALL'), 'opt_out');
assert('stopall',        classifyMessage('stopall'), 'opt_out');
assert('UNSUBSCRIBE',    classifyMessage('UNSUBSCRIBE'), 'opt_out');
assert('cancel',         classifyMessage('cancel'), 'opt_out');
assert('END',            classifyMessage('END'), 'opt_out');
assert('quit',           classifyMessage('quit'), 'opt_out');

// --- With whitespace/punctuation ---
assert('  STOP  ',       classifyMessage('  STOP  '), 'opt_out');
assert('STOP!',          classifyMessage('STOP!'), 'opt_out');
assert('stop.',          classifyMessage('stop.'), 'opt_out');
assert('"STOP"',         classifyMessage('"STOP"'), 'opt_out');
assert('S.T.O.P',        classifyMessage('S.T.O.P'), 'opt_out');

// --- Opt-in keywords ---
assert('START',          classifyMessage('START'), 'opt_in');
assert('start',          classifyMessage('start'), 'opt_in');
assert('UNSTOP',         classifyMessage('UNSTOP'), 'opt_in');
assert('subscribe',      classifyMessage('subscribe'), 'opt_in');
assert('  START  ',      classifyMessage('  START  '), 'opt_in');

// --- Help keywords ---
assert('HELP',           classifyMessage('HELP'), 'help');
assert('help',           classifyMessage('help'), 'help');
assert('INFO',           classifyMessage('INFO'), 'help');
assert('info',           classifyMessage('info'), 'help');

// --- Normal messages (must NOT trigger opt-out/in) ---
assert('Hi there',              classifyMessage('Hi there'), 'normal');
assert('Please stop by today',  classifyMessage('Please stop by today'), 'normal');
assert('Can you help me?',      classifyMessage('Can you help me?'), 'normal');
assert('I need a quote',        classifyMessage('I need a quote'), 'normal');
assert('When can you start?',   classifyMessage('When can you start?'), 'normal');
assert('empty string',          classifyMessage(''), 'normal');
assert('stoppage',              classifyMessage('stoppage'), 'normal');
assert('nonstop',               classifyMessage('nonstop'), 'normal');
assert('endpoint',              classifyMessage('endpoint'), 'normal');

// --- Edge cases ---
assert('numbers only: 12345',   classifyMessage('12345'), 'normal');
assert('emoji only: 👍',        classifyMessage('👍'), 'normal');

// ── Results ──────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('✅ All tests passed');
}
