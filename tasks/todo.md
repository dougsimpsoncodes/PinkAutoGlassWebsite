# Temporarily Disable Customer SMS + Beetexting Migration Roadmap

## Problem
RingCentral programmatic SMS doesn't appear in Beetexting (Dan's SMS management tool). This causes:
- **Ghost messages**: Customer gets auto-reply SMS that Dan can't see in Beetexting
- **Orphaned conversations**: Customer replies land in Beetexting with no thread context
- **Follow-up collisions**: Drip sends "time slots available today" even if Dan already texted manually
- **Eroded trust**: Dan looks unprepared, may re-quote at different price

## Solution: Two-Phase Approach

### Phase 1: Disable Customer-Facing SMS (immediate)
Add `ENABLE_CUSTOMER_SMS=false` env flag. Keep email autoresponders + admin notifications.

### Phase 2: Beetexting Integration (when Dan provides credentials)
Route SMS through Beetexting API so messages appear in Dan's conversation threads.

---

## Phase 1 — Disable Customer SMS

### What Gets Disabled
| Message | File | Line(s) |
|---------|------|---------|
| Instant SMS auto-reply (quote form) | `src/app/api/lead/route.ts` | ~266-271 |
| Drip follow-up SMS (15h later) | `src/lib/drip/processor.ts` | ~135-136 |
| Inbound SMS auto-reply (webhook) | `src/app/api/webhook/ringcentral/sms/route.ts` | ~199-229 |
| Review request SMS (2h + 72h) | `src/lib/drip/scheduler.ts` | ~42-44 (REVIEW_REQUEST_STEPS) |

### What Stays ON
| Message | Why |
|---------|-----|
| Instant email auto-reply (quote form) | No conflict with Beetexting |
| Review request email | No conflict with Beetexting |
| Admin SMS notifications (to Dan) | Dan needs lead alerts — these go TO him, not customers |
| Admin email notifications | Same |
| Lead creation in database | CRM tracking unchanged |
| Drip scheduling logic | Rows still created (marked skipped at send time) for auditability |

### Implementation Steps

- [x] 1. Add `ENABLE_CUSTOMER_SMS` to `src/lib/constants.ts` — single boolean getter
- [x] 2. Gate instant SMS in `src/app/api/lead/route.ts` — wrap sendSMS call with flag check
- [x] 3. Gate drip SMS in `src/lib/drip/processor.ts` — skip SMS channel when flag is false, mark as `skipped` with reason `customer_sms_disabled`
- [x] 4. Gate inbound auto-reply in `src/app/api/webhook/ringcentral/sms/route.ts` — skip sendSMS, keep lead creation + admin forward
- [x] 5. Gate review request SMS scheduling in `src/lib/drip/scheduler.ts` — skip inserting SMS rows when flag is false, still insert email rows
- [x] 6. Set `ENABLE_CUSTOMER_SMS=false` in `.env.local`
- [ ] 7. Set `ENABLE_CUSTOMER_SMS=false` in Vercel env vars (Production + Preview) — **MANUAL: do this before deploy**
- [x] 8. Write `docs/BEETEXTING_MIGRATION.md` with full re-enablement instructions
- [ ] 9. Deploy and verify admin notifications still work

### How to Re-Enable SMS Later
1. Set `ENABLE_CUSTOMER_SMS=true` in Vercel env vars
2. Redeploy (or wait for next deploy)
3. That's it — no code changes needed

---

## Phase 2 — Beetexting Integration Roadmap

### What We Need From Dan

1. **Beetexting native login credentials** (username + password)
   - Dan currently uses RingCentral SSO to access Beetexting
   - He needs a Beetexting-native password to complete the OAuth flow
   - Contact Beetexting support or use "Forgot Password" to create one

2. **Complete the OAuth authorization flow**
   - Log into Beetexting in a browser (with native credentials)
   - Visit this URL in the same browser session:
     ```
     https://auth.beetexting.com/oauth2/authorize/?client_id=7bbakgbke16u46sof434h6a8ev&response_type=code&redirect_uri=https://pinkautoglass.com/api/beetexting/callback&scope=https://com.beetexting.scopes/SendMessage
     ```
   - Click "Authorize" when prompted
   - Page will show the refresh token — copy it

3. **Give us the refresh token**
   - We'll store it as `BEETEXTING_REFRESH_TOKEN` in Vercel env vars

### What We Build After Getting the Refresh Token

1. **`src/lib/notifications/beetexting.ts`** — Beetexting SMS client
   - Token refresh logic (access tokens expire, refresh token is long-lived)
   - `sendSMS()` function matching current interface
   - API base: `prodapi.beetexting.com`

2. **Swap SMS provider** — Replace RingCentral sendSMS calls with Beetexting sendSMS
   - Or: make `sendSMS` in `sms.ts` route through Beetexting when configured

3. **Set `ENABLE_CUSTOMER_SMS=true`** — Re-enable all SMS autoresponders

4. **Delete `/api/beetexting/callback` route** — One-time use, no longer needed

5. **Test end-to-end** — Submit test lead, verify SMS appears in Beetexting thread

### Already Done (Beetexting prep)
- [x] OAuth callback route deployed (`/api/beetexting/callback`)
- [x] Env vars configured: `BEETEXTING_CLIENT_ID`, `BEETEXTING_CLIENT_SECRET`, `BEETEXTING_API_KEY`, `BEETEXTING_TOKEN_URL`, `BEETEXTING_REDIRECT_URI`
- [x] API research complete: endpoint, auth flow, send scope documented

### Env Vars Needed (after OAuth)
| Var | Source | When |
|-----|--------|------|
| `BEETEXTING_REFRESH_TOKEN` | From OAuth callback page | After Dan authorizes |
| `ENABLE_CUSTOMER_SMS` | Set to `true` | After Beetexting sendSMS is built + tested |

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Leads don't get any immediate acknowledgment | Email auto-reply still fires. Dan gets admin SMS alert instantly. |
| No automated follow-up SMS | Dan manually follows up via Beetexting. Admin alert prompts him. |
| Customers texting in hear silence | Admin SMS forward still works — Dan sees it and responds via Beetexting. |
| Forget to re-enable SMS | This doc + `BEETEXTING_MIGRATION.md` serve as reminders. |
| Dan doesn't update lead status in dashboard | Drip would fire anyway (but now gated). No worse than before. |

---

## Review (Feb 10 2026)

### Changes Made
- `src/lib/constants.ts`: Added `isCustomerSmsEnabled()` — reads `ENABLE_CUSTOMER_SMS` env var
- `src/app/api/lead/route.ts`: Gated instant SMS with flag check + log message when skipped
- `src/lib/drip/processor.ts`: SMS channel skipped at send time, marked `customer_sms_disabled`
- `src/lib/drip/scheduler.ts`: SMS rows not inserted in both `scheduleDripSequence()` and `scheduleReviewRequest()` when flag is false
- `src/app/api/webhook/ringcentral/sms/route.ts`: Inbound auto-reply skipped when flag is false
- `.env.local`: Added `ENABLE_CUSTOMER_SMS=false`
- `docs/BEETEXTING_MIGRATION.md`: Full documentation for re-enablement + Beetexting integration roadmap

### Things Not Touched
- `src/lib/notifications/sms.ts`: `sendSMS()` and `sendAdminSMS()` unchanged — admin notifications unaffected
- `src/lib/notifications/email.ts`: Email autoresponders unchanged
- `src/app/api/booking/submit/route.ts`: Booking form unchanged (never had customer SMS auto-reply)
- `src/app/api/admin/leads/route.ts`: Review request trigger unchanged (scheduler handles the gating)
- Database schema: No migrations needed

### Still TODO
- Set `ENABLE_CUSTOMER_SMS=false` in Vercel env vars before deploying
- Deploy to production
- Verify admin SMS notifications still work post-deploy
