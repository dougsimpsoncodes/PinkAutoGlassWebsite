# Beetexting SMS Migration — CLOSED

**Status: CLOSED (2026-06-04). RingCentral is the permanent SMS path.**

---

## Decision

Beetexting Phase 2 was never completed. RingCentral review request SMS is
working well: **483 messages sent** through June 2026, 99%+ delivery rate.
The operational cost of completing the Beetexting OAuth and maintaining a
second SMS provider outweighs the benefit.

**RingCentral is the production SMS path. No changes needed.**

---

## What's In Place (permanent)

| Message type | Channel | Status |
|---|---|---|
| Review request SMS | RingCentral | ✅ Working — 328 sent |
| Review reminder SMS | RingCentral | ✅ Working — 155 sent |
| Admin SMS alerts (lead notifications) | RingCentral | ✅ Working |
| Customer email auto-reply | Resend | ✅ Working |
| Admin email notifications | Resend | ✅ Working |

`ENABLE_CUSTOMER_SMS=true` in Vercel. Leave it.

---

## Drip alert fix (2026-06-04)

The cron alert in `/api/cron/process-drip/route.ts` was firing on every
retry attempt (up to 6 alerts per failing message). Fixed to only alert
on permanent failures (`result.errors.length > 0`), not transient retries.

The rare failed messages (3 review_request + 2 review_reminder all-time)
are carrier-level delivery failures on specific numbers — not a system bug.

---

## Beetexting env vars in Vercel

The following vars remain in Vercel but are unused. They can be removed
in a future cleanup — they don't affect any live functionality:

- `BEETEXTING_CLIENT_ID`
- `BEETEXTING_CLIENT_SECRET`
- `BEETEXTING_API_KEY`
- `BEETEXTING_TOKEN_URL`
- `BEETEXTING_REDIRECT_URI`

`BEETEXTING_AGENT_EMAIL` and `BEETEXTING_FROM_NUMBER` were added and
immediately removed on 2026-06-04 during diagnosis.

---

## Original context (archived)

RingCentral programmatic SMS doesn't appear in Dan's Beetexting inbox,
causing ghost-message confusion. The plan was to route customer SMS through
Beetexting so all threads are visible in one place. Dan never completed the
OAuth authorization (required a native Beetexting login, not RingCentral SSO).

Given the review request system is working well through RingCentral, and
the SMS volume is low enough to manage without unified inbox threading,
the migration is closed.
