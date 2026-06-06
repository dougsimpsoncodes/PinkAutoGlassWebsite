# Notification Test Modes

The site supports a safety switch for outbound email/SMS so local, staging, and preview QA can test notification logic without accidentally messaging customers or the operations team.

## Environment Variables

```bash
NOTIFICATION_MODE=live
NOTIFICATION_REDIRECT_EMAIL=qa@example.com
NOTIFICATION_REDIRECT_PHONE=+13105550123
```

## Modes

### `live`

Default behavior.

- Email sends through Resend.
- Auto-quoter contact and booking customer SMS sends through RingCentral.
- Team SMS sends through RingCentral.
- Beetexting is not approved for new notification work.

RingCentral sender requirement:

- `RINGCENTRAL_PHONE_NUMBER` must be an SMS-capable direct number assigned to the authenticated RingCentral JWT extension.
- Do not use the public main company number unless RingCentral shows `SmsSender` on that exact number for the JWT extension.
- Local redirect SMS QA failed once with `MSG-304 Phone number doesn't belong to extension` because the configured sender was the main company number, not the extension's SMS sender.
- Verify the sender before redirect/live SMS QA:

```bash
npm run check:ringcentral-sms-sender
```

## Beetexting Status

Do not use Beetexting for the auto-quoter or any new notification work.

The redirect-mode QA for the auto-quoter exposed why this matters:

- Beetexting was not configured in the local/staging notification path.
- The Beetexting helper fell back to RingCentral, which made provider behavior harder to reason about.
- The existing auto-quoter booking SMS system already uses RingCentral directly and is the trusted pattern.

Decision:

- New customer SMS must use `src/lib/notifications/sms.ts`.
- New team SMS must use `sendAdminSMS` from `src/lib/notifications/sms.ts`.
- Do not add new imports from `src/lib/notifications/beetexting.ts`.
- Existing legacy references should be treated as migration debt, not a pattern to copy.
- Real recipients receive messages.

Use only when intentionally testing or running production notifications.

### `capture`

No external email or SMS is sent.

The app records what it would have sent:

- logs a `[notification-capture]` line
- inserts into `notification_captures` when Supabase service-role env and the table are available

The app treats the notification as accepted so customer flows can continue normally.

Use for most local/preview QA.

### `redirect`

External messages are allowed, but only to QA recipients.

- All email recipients are replaced by `NOTIFICATION_REDIRECT_EMAIL`.
- All SMS recipients are replaced by `NOTIFICATION_REDIRECT_PHONE`.
- Email subjects are prefixed with `[Redirected]`.
- Email bodies include a banner showing the original recipient.
- SMS messages are prefixed with the original phone number.
- A capture record is also written/logged for audit.

If redirect mode is enabled but the matching redirect recipient is missing, the app falls back to capture for that message instead of sending live.

Use when QA needs to see real rendered messages in one safe inbox/phone.

## Capture Table

Migration:

```text
supabase/migrations/20260606_notification_captures.sql
```

Table:

```text
notification_captures
```

Important columns:

- `mode`
- `channel`
- `original_to`
- `redirected_to`
- `subject`
- `body`
- `provider`
- `metadata`
- `created_at`

The table is service-role only. Browser users cannot read or write it directly.

## Local QA Examples

Capture all notification attempts:

```bash
NOTIFICATION_MODE=capture npm run dev -- -p 3002
```

Redirect all messages to QA recipients:

```bash
NOTIFICATION_MODE=redirect \
NOTIFICATION_REDIRECT_EMAIL=goblue12@aol.com \
NOTIFICATION_REDIRECT_PHONE=+13107348934 \
npm run dev -- -p 3002
```

Run the safety guard:

```bash
npm run ci:guard:notification-mode
```

## Post-Test Capture Inspection

After running the notification flows, inspect captured notification content from the database.

Preferred SQL:

```sql
select
  created_at,
  mode,
  channel,
  original_to,
  redirected_to,
  subject,
  body,
  provider,
  metadata
from notification_captures
where created_at > now() - interval '60 minutes'
order by created_at asc;
```

If the run used a unique `RUN_ID`, also search bodies, subjects, and metadata for:

- `notify_exact_capture_<RUN_ID>`
- `notify_manual_capture_<RUN_ID>`
- `notify_booking_capture_<RUN_ID>`
- `goblue12@aol.com`
- `+13107348934`
- `Go Blue QA`

If the table does not exist or no rows are returned:

1. Check local dev server stdout for `[notification-capture]` lines.
2. Report that full body capture could not be verified because `notification_captures` was unavailable or empty.
3. Include the available log summaries instead.

### Report Format

Paste a full report back into the Codex chat using this structure:

```text
Pink Auto Glass notification capture-content QA report

Run ID:
- ...

Server mode:
- NOTIFICATION_MODE=capture confirmed: yes/no/how

Capture query:
- Query ran successfully: yes/no
- Rows returned: ...
- Table available: yes/no

Exact-price quote captures:
- Customer email captured: yes/no
- Customer email original_to: ...
- Customer email subject: ...
- Customer email body confirmed includes:
  - installed price $317.30: yes/no
  - (720) 918-7465: yes/no
  - mobile service included: yes/no
  - sales tax may be collected at installation: yes/no
  - quote reference: yes/no
- Customer SMS captured: yes/no/skipped
- Customer SMS body confirmed includes:
  - installed price $317.30: yes/no
  - (720) 918-7465: yes/no
  - Reply STOP to opt out: yes/no
- Team/admin capture absent for exact-price contact-only flow: yes/no

Manual-review captures:
- Customer email captured: yes/no
- Customer email original_to: ...
- Customer email subject: ...
- Customer email body confirmed includes:
  - received your quote request: yes/no
  - found your vehicle: yes/no
  - glass options require confirmation: yes/no
  - (720) 918-7465: yes/no
  - quote reference: yes/no
- Customer SMS captured: yes/no/skipped
- Customer SMS body confirmed includes:
  - received your quote request: yes/no
  - call (720) 918-7465: yes/no
  - Reply STOP to opt out: yes/no
- Team email captured: yes/no
- Team email original_to: ...
- Team email subject includes Manual Review Needed: yes/no
- Team email body includes customer name/phone/vehicle/ref or lead id: yes/no
- Team SMS captured: yes/no
- Team SMS body includes Manual review, customer name, phone, vehicle: yes/no

Booking captures:
- Customer booking email captured: yes/no
- Customer booking email subject: ...
- Customer booking email body includes booking reference/date-window/vehicle/price: yes/no
- Customer booking SMS captured: yes/no/skipped
- Customer booking SMS body includes booking reference and Reply STOP: yes/no
- Team booking email captured: yes/no
- Team booking email subject includes New Booking: yes/no
- Team booking email body includes customer/vehicle/date-window/price/glass info where available: yes/no
- Team booking SMS captured: yes/no
- Team booking SMS body includes booking ref/customer/vehicle/price/phone: yes/no

Test/internal suppression captures:
- Test/internal flow created notification captures: yes/no
- Expected: no captures
- DB is_test tagging confirmed: yes/no

External comms check:
- Real email received at goblue12@aol.com: yes/no
- Real SMS received at (310) 734-8934: yes/no
- Internal team real alerts received: yes/no/unknown
- Expected for capture mode: no real external comms

Errors:
- Browser/page errors: ...
- Failed HTTP responses: ...
- Next overlay: yes/no
- Dev server notification errors: ...

Overall verdict:
- Pass/fail
- Gaps not inspected
- Recommended fixes before redirect/live testing
```

## Production Guidance

Production should normally use:

```bash
NOTIFICATION_MODE=live
```

Do not set production to `redirect` or `capture` unless intentionally pausing outbound notifications.

## Rollback Notes

The mode layer is isolated behind:

- `src/lib/notifications/mode.ts`
- `src/lib/notifications/email.ts`
- `src/lib/notifications/sms.ts`
- `src/lib/notifications/beetexting.ts`

To rollback safely, revert the commit that introduced this mode layer. If urgent mitigation is needed without a deploy, set:

```bash
NOTIFICATION_MODE=capture
```

That stops external messages while preserving app flow and capture logs.
