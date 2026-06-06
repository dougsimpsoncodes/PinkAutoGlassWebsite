# RingCentral SMS

**Status: active. RingCentral is the permanent SMS path.**

## Decision

RingCentral is the production SMS provider for customer and team messages.
The previous Beetexting migration plan was closed on 2026-06-04 and should
not be revived without a new technical decision.

## What's In Place

| Message type | Channel | Status |
|---|---|---|
| Review request SMS | RingCentral | Working |
| Review reminder SMS | RingCentral | Working |
| Admin SMS alerts | RingCentral | Working |
| Customer quote and booking SMS | RingCentral | Working |
| Customer email auto-reply | Resend | Working |
| Admin email notifications | Resend | Working |

`ENABLE_CUSTOMER_SMS=true` in Vercel enables customer-facing SMS. Admin SMS
notifications are routed separately through `ADMIN_PHONE`.

## Outbound Routing

- Customer SMS uses `src/lib/notifications/ringcentral-customer.ts` when opt-out
  checks are required.
- Direct RingCentral sends use `src/lib/notifications/sms.ts`.
- Team/admin SMS uses `sendAdminSMS`, which reads comma-separated recipients
  from `ADMIN_PHONE`.
- `TEAM_RC_NUMBERS` is for inbound webhook filtering, not outbound fanout.

## Notification Modes

`NOTIFICATION_MODE` controls whether RingCentral sends externally:

- `live`: send real SMS.
- `capture`: record SMS in `notification_captures` without sending.
- `redirect`: send only to `NOTIFICATION_REDIRECT_PHONE` and capture metadata.

## Deprecated Provider

Beetexting env vars may still exist in Vercel from historical work, but the
application should not import or send through a Beetexting SMS module.
