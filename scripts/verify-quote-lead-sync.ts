/**
 * Guard for the shared auto-quoter → leads sync (src/lib/quote/leadSync.ts).
 * Exercises the dedupe branches + key invariants with a mock Supabase client.
 * Run: npx tsx scripts/verify-quote-lead-sync.ts
 */
import {
  findOrCreateQuoteLead,
  buildAttributionFromSession,
  splitName,
  shortQuoteToken,
  type QuoteLeadQuote,
} from '../src/lib/quote/leadSync';

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) { console.error(`  ✗ ${msg}`); failures++; } else console.log(`  ✓ ${msg}`);
}

const QUOTE: QuoteLeadQuote = {
  id: 'q1', quote_token: 'abcdef1234567890', lead_id: null, status: 'ready_exact',
  session_id: 'sess-1', quote_total_cents: 45000,
  vehicle_year: 2020, vehicle_make: 'Mazda', vehicle_model: '3', vehicle_trim: null,
  zip: '80205', state: 'CO',
};

(async () => {
// ── Pure helpers ──
assert(splitName('Patrick Malz').firstName === 'Patrick' && splitName('Patrick Malz').lastName === 'Malz', 'splitName splits first/last');
assert(splitName('Cher').lastName === '' && splitName('Cher').firstName === 'Cher', 'splitName single name → empty last');
assert(splitName('   ').firstName === 'Customer', 'splitName blank → Customer fallback');
assert(shortQuoteToken('abcdef1234') === 'ABCDEF12', 'shortQuoteToken → first 8 upper');

/** Minimal chainable mock that returns programmed results and records writes. */
function mockClient(opts: {
  existingLead?: { id: string } | null;
  sessionRow?: any | null;
  rpcError?: { code?: string; message?: string } | null;
}) {
  const writes: { table: string; type: 'update' | 'rpc'; payload: any }[] = [];
  const make = (table: string) => {
    const q: any = {
      _table: table,
      select() { return q; }, eq() { return q; }, in() { return q; }, gte() { return q; },
      order() { return q; }, limit() { return q; },
      single() { return Promise.resolve({ data: table === 'leads' ? opts.existingLead ?? null : null }); },
      maybeSingle() {
        if (table === 'user_sessions') return Promise.resolve({ data: opts.sessionRow ?? null });
        return Promise.resolve({ data: opts.existingLead ?? null });
      },
      update(payload: any) { writes.push({ table, type: 'update', payload }); return { eq: () => Promise.resolve({ error: null }) }; },
    };
    return q;
  };
  const client: any = {
    from: (table: string) => make(table),
    rpc: (_fn: string, args: any) => {
      writes.push({ table: 'leads', type: 'rpc', payload: args.p_payload });
      return Promise.resolve({ error: opts.rpcError ?? null });
    },
  };
  return { client, writes };
}

// ── Branch 1: quote already has lead_id → update that lead, no insert ──
{
  const { client, writes } = mockClient({});
  const id = await findOrCreateQuoteLead(client, client, { ...QUOTE, lead_id: 'L-existing' }, {
    firstName: 'Pat', lastName: 'M', phone: '+13035551234', status: 'scheduled',
  });
  assert(id === 'L-existing', 'branch1: returns existing quote.lead_id');
  assert(!writes.some(w => w.type === 'rpc'), 'branch1: no fn_insert_lead called');
  const upd = writes.find(w => w.type === 'update');
  assert(upd?.payload.status === 'scheduled', 'branch1: status set to scheduled');
  assert(!('revenue_amount' in (upd?.payload || {})), 'branch1: revenue_amount NEVER written');
}

// ── Branch 2: no lead_id but a recent lead exists for the phone → update it ──
{
  const { client, writes } = mockClient({ existingLead: { id: 'L-phone' } });
  const id = await findOrCreateQuoteLead(client, client, QUOTE, {
    firstName: 'Pat', lastName: 'M', phone: '+13035551234', status: 'scheduled',
  });
  assert(id === 'L-phone', 'branch2: returns phone-matched lead id');
  assert(!writes.some(w => w.type === 'rpc'), 'branch2: no insert (reused existing)');
}

// ── Branch 2b: reused leads get blank attribution/session fields enriched ──
{
  const { client, writes } = mockClient({
    existingLead: {
      id: 'L-phone',
      notes: null,
      gclid: null,
      msclkid: null,
      ad_platform: null,
      utm_source: null,
      client_id: null,
      session_id: null,
      is_test: false,
    },
  });
  await findOrCreateQuoteLead(client, client, QUOTE, {
    firstName: 'Pat',
    lastName: 'M',
    phone: '+13037771234',
    clientId: 'visitor-1',
    sessionId: 'sess-1',
    attribution: {
      gclid: 'G123',
      msclkid: null,
      ad_platform: 'google',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'quote-test',
      utm_term: null,
      utm_content: null,
    },
  });
  const upd = writes.find(w => w.type === 'update');
  assert(upd?.payload.gclid === 'G123', 'branch2b: blank gclid is enriched');
  assert(upd?.payload.ad_platform === 'google', 'branch2b: blank ad_platform is enriched');
  assert(upd?.payload.utm_source === 'google', 'branch2b: blank UTM is enriched');
  assert(upd?.payload.client_id === 'visitor-1', 'branch2b: blank client_id is enriched');
  assert(upd?.payload.session_id === 'sess-1', 'branch2b: blank session_id is enriched');
}

// ── Branch 2c: test leads bypass phone dedupe so QA runs keep fresh attribution ──
{
  const { client, writes } = mockClient({ existingLead: { id: 'L-old-test' } });
  const id = await findOrCreateQuoteLead(client, client, QUOTE, {
    firstName: 'Codex',
    lastName: 'Test',
    phone: '+13035551234',
    isTest: true,
  });
  assert(id !== 'L-old-test', 'branch2c: test contact does not reuse old phone-matched lead');
  assert(writes.some(w => w.type === 'rpc'), 'branch2c: test contact inserts a fresh lead');
}

// ── Branch 3: no lead anywhere → fn_insert_lead, then update ──
{
  const { client, writes } = mockClient({ existingLead: null });
  const id = await findOrCreateQuoteLead(client, client, QUOTE, {
    firstName: 'Pat', lastName: 'M', phone: '+13035551234', status: 'scheduled', isTest: true,
  });
  assert(typeof id === 'string' && id.length > 0, 'branch3: returns a new lead id');
  const rpc = writes.find(w => w.type === 'rpc');
  assert(!!rpc, 'branch3: fn_insert_lead called');
  assert(rpc?.payload.first_contact_method === undefined, 'branch3: relies on form default (no method override)');
  assert(rpc?.payload.isTest === true, 'branch3: isTest override honored');
  assert(!('revenue_amount' in (rpc?.payload || {})), 'branch3: revenue_amount NEVER in insert payload');
}

// ── Branch 4: status omitted (the /contact path) → update does NOT set status ──
{
  const { client, writes } = mockClient({ existingLead: null });
  await findOrCreateQuoteLead(client, client, { ...QUOTE, lead_id: 'L-x' }, {
    firstName: 'Pat', lastName: 'M', phone: '+13035551234', // no status
  });
  const upd = writes.find(w => w.type === 'update');
  assert(upd && !('status' in upd.payload), 'branch4: status omitted → update leaves status untouched');
}

// ── buildAttributionFromSession ──
{
  const { client } = mockClient({ sessionRow: null });
  const a = await buildAttributionFromSession(client, null);
  assert(a !== null && typeof a === 'object', 'attr: null session → empty attribution object (direct)');
  const { client: c2 } = mockClient({ sessionRow: { gclid: 'G123', utm_source: 'google' } });
  const a2 = await buildAttributionFromSession(c2, 'sess-1', { bodyGclid: 'BODY', utmSource: 'bing' });
  assert(a2.gclid === 'G123', 'attr: session click ID wins over body fallback');
  assert(a2.utm_source === 'google', 'attr: session UTM wins over body fallback');
  const { client: c3 } = mockClient({ sessionRow: null });
  const a3 = await buildAttributionFromSession(c3, 'missing', { bodyGclid: 'BODY', utmSource: 'bing' });
  assert(a3.gclid === 'BODY' && a3.utm_source === 'bing', 'attr: missing session falls back to body values');
}

  console.log(failures === 0 ? '\nQUOTE LEAD SYNC: ALL CHECKS PASSED' : `\nQUOTE LEAD SYNC: ${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})();
