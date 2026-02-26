# Project-Specific Instructions for Claude Code

## WORKFLOW: Plan First, Execute Simply

**MANDATORY FOR ALL TASKS:**
1. **Plan** - Think through problem, read codebase, write plan to `tasks/todo.md`
2. **Get Approval** - Check in with user before beginning work
3. **Execute** - Work through items one at a time, mark complete as you go
4. **Document** - Add review section to `tasks/todo.md` with summary

---

## SIMPLICITY IS EVERYTHING

**ABSOLUTE RULES:**
- Every change should be minimal and focused
- Find ROOT CAUSE, no temporary fixes or workarounds
- Changes should ONLY impact code relevant to the task
- If touching unrelated code, STOP and reconsider
- Ask: Is this the simplest solution? Am I changing more than necessary?

---

## SECURITY: NEVER HARDCODE SECRETS

**NEVER write secrets to:** Code files, docs, configs, scripts, or any git-tracked file.
**ONLY place secrets in:** `.env.local`, `.env.production` (gitignored), Vercel env vars.

```javascript
// WRONG
const API_KEY = 're_WpTtwkzV_...';

// CORRECT
const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) throw new Error('RESEND_API_KEY required');
```

**In documentation:** Use `[configured in Vercel]` or `***` instead of actual values.

---

## NEVER ADD `\n` TO .env FILES — ROOT CAUSE & PREVENTION

### Why it happens

Three things combine to create this bug every time:

1. **`echo` adds a trailing newline** — `echo "value"` outputs `value\n`. When piped to `vercel env add`, Vercel stores the newline as part of the value.
2. **`vercel env pull` faithfully reproduces it** — whatever is stored in Vercel (including the `\n`) comes back into `.env.local` verbatim.
3. **dotenv expands `\n` inside double-quoted values** — Next.js uses dotenv, which turns `\n` inside `"..."` into an actual newline character, silently corrupting the key at runtime.

Result: auth calls fail with cryptic errors, and the root cause is invisible.

### Rule 1 — ALWAYS use `printf`, never `echo`, when piping to Vercel CLI

```bash
# WRONG — echo adds a trailing newline, corrupts the stored value
echo "my-secret-value" | vercel env add MY_KEY development

# CORRECT — printf does not add a trailing newline
printf 'my-secret-value' | vercel env add MY_KEY development
```

### Rule 2 — ALWAYS pull env vars with the npm script, never raw `vercel env pull`

```bash
# WRONG — no sanitization, \n survives into .env.local
vercel env pull .env.local

# CORRECT — pulls then auto-strips any \n with sed
npm run env:pull
```

The `env:pull` script runs `vercel env pull` then immediately runs:
```bash
sed -i '' 's/\\n"/"/g' .env.local
```
which removes any trailing `\n` from quoted values.

### Rule 3 — After any manual .env.local edit, verify with

```bash
python3 -c "
content = open('.env.local').read()
bad = [l for l in content.splitlines() if r'\n' in l]
print('BAD LINES:', bad) if bad else print('CLEAN')
"
```

### What a corrupted line looks like

```
# WRONG — literal backslash-n before closing quote
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...odAE\n"

# CORRECT — clean close
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...odAE"
```

---

## RingCentral JWT Authentication

**Reference:** `/docs/RINGCENTRAL_JWT_EXPERT_GUIDE.md`

Contains JWT troubleshooting, "Unauthorized for this grant type" fixes, token lifecycle, emergency recovery.

---

## Authentication Troubleshooting Protocol

### When Encountering Auth Errors:

1. **Read error literally** - Value in brackets (e.g., `[AmA1nMSmTqHdJT6phipyqC]`) IS the problem
2. **Research FIRST** - Web search exact error code before proposing fixes
3. **Request ALL credentials together** - Never update one at a time
4. **Verify assumptions** - Same app/account? Correct environment? Not expired?

**Pattern Recognition:**
- "Invalid client" → CLIENT_ID doesn't exist or wrong environment
- "Invalid token" → Token expired or wrong CLIENT_ID
- "Unauthorized" → Missing permissions

**DO NOT:** Guess at solutions, update one credential at a time, assume .env values are valid.

---

## Next.js Environment Variable Caching

**Problem:** Next.js caches env vars at startup. Updates to `.env.local` won't be picked up.

**Solution:** After updating .env.local:
```bash
rm -rf .next && npm run dev
```

Or use `npm run dev:watch` for auto-restart on .env changes.

**Health check:** `/api/health/env` shows loaded variables.

---

## NEVER ASSUME - ALWAYS VERIFY

Never assume which database/environment is production based on names.

**Always verify:**
- Check project IDs in code
- Ask user to confirm
- Check activity levels in dashboard

---

## DON'T OVER-ENGINEER

**Start simple with SDKs.** Don't create custom fetch wrappers unless absolutely necessary.

```typescript
// START HERE
const client = createClient(url, key);

// NOT HERE (custom wrappers break auth)
const client = createClient(url, key, { global: { fetch: myCustomFetch } });
```

**Test order:**
1. Default SDK config
2. Add ONE option at a time
3. Test with curl to isolate issues
4. Only customize if steps 1-3 prove necessary

---

## TRY BEFORE SAYING "I CAN'T"

Never tell user "You'll need to do this manually" without trying the command first.

If you've used a CLI (vercel, supabase, gh) earlier in the session, assume you still have access.

---

## NEVER USE FALLBACKS WITHOUT USER CONSENT

Never implement silent fallbacks that mask failures. Always ask:

> "If the API fails, should I: A) Show error, B) Fall back to estimates, C) Show stale data indicator?"

**Fallbacks are BUSINESS decisions, not technical ones.**

---

## DATABASE MIGRATIONS: Test Critical Paths

**Before applying migrations touching functions/triggers/RLS:**

1. Test critical path BEFORE migration (e.g., curl the lead form)
2. Apply migration
3. Test IMMEDIATELY after
4. If fails, ROLLBACK

**Supabase search_path:** Always include `extensions` schema:
```sql
-- WRONG: SET search_path = public;
-- CORRECT: SET search_path = public, extensions;
```

**Critical functions:** `fn_insert_lead` (Quote/Booking forms - lost leads = lost revenue)

---

## MONITORING: Critical Business Metrics

| Metric | Alert If |
|--------|----------|
| Daily leads | < 1 in 24 hours |
| /api/lead errors | > 5% |

---

## THE TWO-ATTEMPT RULE

**If first fix fails, STOP and research before trying again.**

```
Attempt #1 fails → STOP → Research exact error → Understand WHY → Attempt #2
If still failing → Ask user / consult external sources
```

**Workarounds are red flags.** If you're hiding symptoms, stop and find root cause.

---

## DIRECT OBSERVATION OVER INDIRECT INFERENCE

**Use the simplest direct test.** Don't query database to verify frontend events fire.

| To Verify | Direct Test |
|-----------|-------------|
| Frontend events | Browser extension, DevTools |
| API response | Call the API |
| Tracking pixels | Browser tracking extension |
| UI rendering | Look at the screen |

**Use the same tool that diagnosed the problem to verify the fix.**

---

**Remember:** Research first. Official documentation is more reliable than guessing.
