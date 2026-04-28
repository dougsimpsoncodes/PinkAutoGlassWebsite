# Pink Auto Glass — Project Rules

Workflow, debugging, and universal preferences are in `~/.claude/CLAUDE.md` (loads automatically).

---

## Model Switching Protocol (Cost Control)

Default model is **opusplan** (Opus for planning, Sonnet for coding — automatic).

**Subagent model selection:** When spawning Task subagents, use the cheapest model that fits:
- `model: "haiku"` — research, file exploration, web searches, simple reads
- `model: "sonnet"` — coding, test running, feature implementation
- `model: "opus"` — only for complex multi-step reasoning subagents

**Prompt the user to switch only when:**
- A full session on Opus is needed: `> Run /model opus — this entire task needs deep reasoning`
- Trivial session: `> Run /model haiku — this is all simple stuff`
- Done with special mode: `> Run /model opusplan to switch back`

---

## NEVER ADD `\n` TO .env FILES — ROOT CAUSE & PREVENTION

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

### Rule 3 — After any manual .env.local edit, verify with

```bash
python3 -c "
content = open('.env.local').read()
bad = [l for l in content.splitlines() if r'\n' in l]
print('BAD LINES:', bad) if bad else print('CLEAN')
"
```

### Rule 4 — ALWAYS scan and fix on sight

If you pull, read, or encounter any `.env` file during a session, **immediately check for `\n` corruption**:

```bash
python3 -c "
content = open('.env.local').read()
bad = [l for l in content.splitlines() if r'\n' in l]
print('BAD LINES:', bad) if bad else print('CLEAN')
"
```

If any corrupted vars are found, **fix them immediately** — do not defer. Use `printf` to re-add the clean value to Vercel, then re-pull. This is a standing rule, not optional.

### What a corrupted line looks like

```
# WRONG — literal backslash-n before closing quote
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...odAE\n"

# CORRECT — clean close
SUPABASE_SERVICE_ROLE_KEY="eyJhbG...odAE"
```

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

## Authentication Troubleshooting

1. **Read error literally** — value in brackets (e.g., `[AmA1nMSmTqHdJT6phipyqC]`) IS the problem
2. **Research FIRST** — web search the exact error code before proposing fixes
3. **Request ALL credentials together** — never update one at a time
4. **Verify assumptions** — same app/account? Correct environment? Not expired?

**Pattern recognition:**
- "Invalid client" → CLIENT_ID doesn't exist or wrong environment
- "Invalid token" → token expired or wrong CLIENT_ID
- "Unauthorized" → missing permissions

**RingCentral JWT:** See `/docs/RINGCENTRAL_JWT_EXPERT_GUIDE.md` for JWT troubleshooting, token lifecycle, and emergency recovery.

---

## DON'T OVER-ENGINEER

Start simple with SDKs. Don't create custom fetch wrappers unless absolutely necessary.

```typescript
// START HERE
const client = createClient(url, key);

// NOT HERE — custom wrappers break auth
const client = createClient(url, key, { global: { fetch: myCustomFetch } });
```

Test order: default config → add one option → test with curl → only customize if all three fail.

Supabase client MUST use lazy init in API routes (not top-level) to avoid build failures.

---

## Database Migrations

Before applying any migration touching functions, triggers, or RLS:

1. Test the critical path BEFORE the migration (e.g., curl the lead form)
2. Apply the migration
3. Test IMMEDIATELY after
4. If it fails, ROLLBACK

**Supabase search_path** — always include `extensions`:
```sql
-- WRONG
SET search_path = public;
-- CORRECT
SET search_path = public, extensions;
```

**`fn_insert_lead` is critical** — this powers Quote and Booking forms. A broken migration here means lost leads and lost revenue.

Run migrations with: `node scripts/run-migration.js supabase/migrations/<file>.sql`
Do NOT use `supabase db push` — it fails with IPv6.

---

## Monitoring — Business Metrics

| Metric | Alert threshold |
|--------|----------------|
| Daily leads | < 1 in 24 hours |
| /api/lead errors | > 5% |

---

## Session Documentation

### Where things go

| Content | Location |
|---------|----------|
| Reusable patterns, credentials, architectural decisions, "don't do X" rules | `~/.claude/projects/.../memory/MEMORY.md` |
| Session work log (what changed, decisions made, verification results) | `tasks/todo.md` — append a dated review section at the bottom |
| Large session logs (100+ lines of content) | `tasks/YYYY-MM-DD-topic.md` — separate file, linked from MEMORY.md |

### MEMORY.md rules
- **Keep it lean** — only facts that need to survive across unrelated sessions
- No session narratives, no lists of files changed
- If adding more than ~10 lines for one session, use a dated task file instead and add a one-line pointer in MEMORY.md

### tasks/todo.md pattern
After completing any non-trivial session, append a review section:
```markdown
## YYYY-MM-DD — Topic
- What changed and why (decisions, not just actions)
- Anything deliberately NOT done and why
- Verification: what was checked and passed
```

### When to create a dated task file
- Session log would exceed ~100 lines in todo.md
- Work spans many files across multiple repos (e.g. 19 satellite sites)
- Log file: `tasks/YYYY-MM-DD-topic.md`, pointer in MEMORY.md

### Neville Handoff (Required)
After updating `tasks/todo.md`, also follow the workspace handoff protocol in `~/.openclaw/workspace/CLAUDE.md` — update `PROJECT-STATE.md` and append to `handoff-log.md` so Neville stays in sync.

---

## Direct Observation Over Indirect Inference

Use the simplest direct test — don't query the database to verify a frontend event fired.

| To verify | Direct test |
|-----------|-------------|
| Frontend events | Browser DevTools or tracking extension |
| API response | Call the API directly (curl) |
| Tracking pixels | Browser tracking extension |
| UI rendering | Look at the screen |

Use the same tool that diagnosed the problem to verify the fix.

---

## Mygrant API Integration — User-Agent Rule

Every outbound HTTP request to Mygrant Glass MUST set this exact `User-Agent` header value:

```
PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)
```

**Why:** Mygrant uses this string to filter our traffic in their logs and troubleshoot issues on our behalf. Per Leon Staub's 2026-04-14 email (api-support@mygrantglass.com), they are not IP-allowlisting — User-Agent is how they identify us. If the header is missing or genericized, support becomes "we can't find your traffic."

### This is an enforced invariant, not a memory aid

CLAUDE.md is memory, not a control. The rule only holds if the code enforces it. When any Mygrant client code lands (first PR touching `src/lib/mygrant/` or equivalent), ALL of the following must be true in the same PR:

1. **Central client module** — `src/lib/mygrant/client.ts` (or the agreed location) is the ONLY place in the repo that imports `fetch`/Axios for Mygrant calls. All Mygrant endpoints go through it.
2. **Single source constant** — `export const MYGRANT_USER_AGENT = 'PinkAutoGlass-OMS/1.0 (+https://pinkautoglass.com; doug@pinkautoglass.com)';` lives in that module. No other file defines or hardcodes the string.
3. **Unit test** — asserts the *exact* header value is sent on every request through the client (mock the transport, intercept the request, compare `User-Agent` value). Enforce the value; do NOT enforce casing of the header *name* — HTTP header names are case-insensitive and some runtimes normalize them.
4. **Repo guard** — a test, lint rule, or CI grep that fails the build if any file outside `src/lib/mygrant/` references `mygrantglass.com` in a `fetch`/Axios call, OR if any file outside the client module redefines `MYGRANT_USER_AGENT`.
5. **No Edge Runtime** — keep Mygrant calls in Node.js / Vercel Functions runtime. Vercel's Edge Runtime and Middleware do not participate in Vercel's static-networking features (relevant if we ever move to Static IPs / Secure Compute), and they have a different fetch stack.

Until that client PR lands, this section IS the rule. After it lands, shrink this section to "see `src/lib/mygrant/client.ts` — the constant, the test, and the guard are the rule."

### Ops rules

- Do NOT strip, rename, lowercase the header value, or genericize it in a refactor.
- Do NOT let a generic `fetch`/Axios default overwrite it — always set explicitly via the central client.
- Do NOT bump the `1.0` version on every app release. The version in the UA is the *integration identity version*, not the deploy version — changing it frequently makes Mygrant's log filters worse. Only bump on a deliberate contract change (new auth, new base URL, new identity).
- If the string ever needs to change (new contact, new integration version), coordinate with `api-support@mygrantglass.com` first, then update the constant, the test, this file, and every call site in the same PR.

**Vendor context:** Integration setup form submitted 2026-04-15. Vendor contact: api-support@mygrantglass.com (Leon Staub, Mark Wright, Tim Veilleux). Mygrant is NOT IP-allowlisting today. Vercel Static IPs / Secure Compute remain an option if that ever changes.
