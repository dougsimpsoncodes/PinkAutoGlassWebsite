# Lead Auto-Responder & Drip Sequence System

## Task
Build an in-house auto-responder using existing Resend (email) + RingCentral (SMS) with instant auto-reply and timed drip sequences.

## Completed Items

- [x] Database migration: `scheduled_messages` table with indexes, RLS, and auto-cancel trigger
- [x] Time utilities: `isBusinessHours()`, `isTCPAQuietHours()`, `getNextSafeTime()` — all Mountain Time
- [x] Drip scheduler: `scheduleDripSequence()`, `cancelDripForPhone()` for dedup
- [x] Message templates: SMS templates for all quick-quote steps, SMS+email for booking steps
- [x] Message processor: `processScheduledMessages()` with batch processing, retry logic, status checks
- [x] Cron endpoint: `/api/cron/process-drip` with CRON_SECRET auth, runs every 5 minutes
- [x] Modified `/api/lead` route: instant customer SMS + drip scheduling after lead insert
- [x] Modified `/api/booking/submit` route: drip scheduling + phone dedup (cancels prior quote drip)
- [x] Updated `vercel.json`: added process-drip cron schedule
- [x] Build verified: zero type errors in new/modified files, full build succeeds

## Review

### Files Created
- `supabase/migrations/20260131_create_scheduled_messages.sql`
- `src/lib/drip/scheduler.ts`
- `src/lib/drip/templates.ts`
- `src/lib/drip/processor.ts`
- `src/app/api/cron/process-drip/route.ts`

### Files Modified
- `src/app/api/lead/route.ts` — added imports, instant SMS, drip scheduling (~35 lines)
- `src/app/api/booking/submit/route.ts` — added import, drip scheduling + dedup (~20 lines)
- `vercel.json` — added cron entry

### Key Decisions
- `sms_consent` is NOT persisted in the leads table. It's passed into `scheduleDripSequence()` and stored in `context` JSONB on each scheduled_message row.
- The auto-cancel trigger fires on ANY status change from 'new' (DB-level, works regardless of how status changes).
- TCPA compliance is "shift-left": SMS scheduled_for times are pre-adjusted at scheduling time; the cron just processes whatever is due.
- `lead_activities` logging is fire-and-forget since the table may not exist in production.
