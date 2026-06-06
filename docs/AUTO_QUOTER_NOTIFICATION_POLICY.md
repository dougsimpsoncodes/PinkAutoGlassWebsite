# Auto-Quoter Notification Policy

Status: Phase 1 implementation on `feat/auto-quoter-notification-policy`

This document describes the notification behavior for the contact-gated Pink Auto Glass auto-quoter. The policy was split into two phases so the immediate customer/team messages can ship independently from the delayed hot-lead follow-up job.

## Flow Terms

- Contact submitted: the customer has entered name, phone, and optional email after VIN/plate decode.
- Quote ready: the quoter has an installed price and can show the booking CTA.
- Manual review: the quoter found the vehicle but needs human confirmation before showing an accurate installed price.
- Booking submitted: the customer completed the appointment form.
- Hot quote not booked: the customer received an installed price but did not book within the follow-up window.

## Phase 1 Behavior

All outbound email/SMS in this policy is subject to the global notification safety mode documented in `docs/NOTIFICATION_TEST_MODES.md`.

- `NOTIFICATION_MODE=live`: send to real recipients.
- `NOTIFICATION_MODE=redirect`: send only to configured QA recipients.
- `NOTIFICATION_MODE=capture`: do not send externally; log/store what would have been sent.

Auto-quoter customer SMS in this policy uses the same RingCentral `sendSMS` path as auto-quoter booking confirmations. Legacy lead/drip SMS paths are outside this policy.

### Quote Ready

Trigger:
- `/api/quote/contact` receives contact information for a quote with an installed price.

Team notification:
- None.

Customer notification:
- Email when an email address is present.
- SMS only when customer SMS is enabled and the customer consented.

Message requirements:
- Say the installed price is ready.
- Include the actual installed price.
- Include `(720) 918-7465`.
- Include the quote reference.
- Explain that mobile service is included.
- Explain that sales tax may be collected at installation.

Reasoning:
- The site can still complete the sale by itself, so team alerts here create noise.
- The customer should still receive a lightweight confirmation that Pink received the request and is ready to help.

### Manual Review

Trigger:
- `/api/quote/contact` receives contact information for a quote that is in `manual_review`, `needs_confirmation`, or has no persisted total.

Team notification:
- Immediate email.
- Immediate SMS.

Customer notification:
- Email when an email address is present.
- SMS only when customer SMS is enabled and the customer consented.

Message requirements:
- Do not frame this as a system failure.
- Say Pink received the quote request.
- Say the vehicle was found, but some glass options require confirmation before an accurate installed price can be provided.
- Ask the customer to call `(720) 918-7465`.
- Include the quote reference.

Reasoning:
- Manual review means the customer cannot self-complete. This is an immediate human follow-up moment.

### Booking Submitted

Trigger:
- `/api/quote/book` successfully creates an auto-quoter booking.

Team notification:
- Existing team email and SMS behavior stays in place.

Customer notification:
- Existing booking confirmation email behavior stays in place.
- Existing customer SMS behavior stays in place when enabled and consented.

Reasoning:
- Booking is operationally real work and should notify the team immediately.
- The customer needs a confirmation that the appointment request was received.

### Test/Internal Contacts

Trigger:
- Any contact or booking marked `is_test=true`, including 555 test phone numbers, test names, team emails, or configured test/internal phones.

Team notification:
- Suppressed.

Customer notification:
- Suppressed.

Data behavior:
- Rows are still written for QA and attribution verification.

## Duplicate-Send Guard

Phase 1 uses a simple server-side guard in `/api/quote/contact`: if the quote already had a `lead_id` before the current contact request, contact notifications are skipped.

This prevents common duplicate sends from browser retries, refreshes, or repeated submit calls without requiring a schema change.

## Phase 2 Behavior

### Hot Quote Not Booked

Trigger:
- A customer received an installed price.
- Five minutes have passed.
- No booking exists for that quote.
- The quote is not test/internal.
- The hot quote alert has not already been sent.

Team notification:
- Email.
- SMS.

Customer notification:
- None. The customer already received the quote-ready message in Phase 1.

Required implementation guard:
- Must be DB-backed and idempotent before enabling.
- Recommended fields on `automated_quotes`:
  - `hot_quote_followup_sent_at`
  - `hot_quote_followup_status`
  - `hot_quote_followup_error`

Alternative:
- A generic notification events table keyed by quote id and notification type.

Reasoning:
- These are high-intent leads, so five minutes is the right follow-up window.
- The implementation must avoid duplicate alerts and must re-check booking status at send time.

## Rollback Notes

The Phase 1 code is isolated behind:
- `src/lib/quote/contact-notifications.ts`
- the `/api/quote/contact` call to `sendQuoteContactNotifications`

To rollback the notification policy while keeping the rest of the auto-quoter work:
- revert the branch/commit containing this policy, or
- restore the old `/api/quote/contact` behavior that called the prior generic admin alert on every real contact submission.

No production deployment should happen from this branch without approval.

If notification behavior needs to be paused without a deploy, set `NOTIFICATION_MODE=capture`.
