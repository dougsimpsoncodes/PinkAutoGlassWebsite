# Project-Specific Instructions for Claude Code

## 🔐 SECURITY RULE #1: NEVER HARDCODE SECRETS

**ABSOLUTE RULE - NO EXCEPTIONS:**

### ❌ NEVER Write Secrets to These Files:
- **Code files** (*.js, *.ts, *.tsx, *.jsx, *.py, etc.)
- **Documentation files** (*.md, *.txt, README, etc.)
- **Configuration files** (config.json, settings.yaml, etc.)
- **Scripts** (any executable file)
- **Any file that gets committed to git**

### ✅ ONLY Place Secrets Here:
- `.env.local` (gitignored - for local development)
- `.env.production` (gitignored - for production reference)
- Vercel/hosting provider environment variable settings (encrypted)
- Password managers / secret management systems

### Writing Documentation

When documenting environment variables in markdown files:

**❌ WRONG:**
```
RESEND_API_KEY=re_WpTtwkzV_CvvGd4WSYnuY5AhzfzDzXFjs
DATABASE_PASSWORD=mySecretPassword123
```

**✅ CORRECT:**
```
RESEND_API_KEY=[configured in Vercel]
DATABASE_PASSWORD=[set in .env.local]
API_KEY=***
SECRET_TOKEN=(stored securely in hosting dashboard)
```

### Writing Scripts

**❌ WRONG:**
```javascript
const API_KEY = 're_WpTtwkzV_CvvGd4WSYnuY5AhzfzDzXFjs';
const client = createClient('https://example.com', 'hardcoded_secret');
```

**✅ CORRECT:**
```javascript
const API_KEY = process.env.RESEND_API_KEY;
if (!API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}
const client = createClient(process.env.DATABASE_URL, process.env.SERVICE_KEY);
```

### Before Creating/Editing Any File:

**Ask yourself:**
1. Does this file contain API keys, passwords, tokens, or credentials?
2. Will this file be committed to git?
3. If YES to both → **STOP. Use environment variables instead.**

### Why This Matters:

**What happens when secrets are hardcoded:**
1. ✅ They get committed to git
2. ✅ They get pushed to GitHub (public repository)
3. ✅ Bots scrape GitHub for exposed secrets within minutes
4. ✅ GitGuardian/security scanners raise alerts
5. ✅ Secrets must be rotated (regenerated)
6. ✅ Git history must be rewritten (time-consuming)
7. ✅ All collaborators must force pull
8. ❌ Potential security breach / unauthorized access

**Cost of one hardcoded secret:**
- 2-4 hours to clean git history
- Risk of service compromise
- Loss of trust

**Cost of using .env from the start:**
- 30 seconds

### Enforcement Rule:

**Before writing to ANY file, check:**
```
Does this line contain a secret? (API key, password, token, credential)
  → YES: Use process.env.VARIABLE_NAME
  → NO: Safe to write directly
```

**If you catch yourself hardcoding a secret:**
1. STOP immediately
2. Replace with environment variable
3. Add variable to .env.local (gitignored)
4. Verify .gitignore includes .env* pattern
5. Test that code still works

### This Rule Saved Us From:
- Supabase service role key exposure (November 2025)
- Resend API key exposure (November 2025)
- Multiple hours of git history cleanup
- Potential unauthorized database access

**REMEMBER: If it's a secret, it belongs in .env - PERIOD.**

---

## 🚨 RingCentral JWT Authentication

**BEFORE working with RingCentral authentication, READ THIS FIRST:**

📖 **Comprehensive Reference:** `/docs/RINGCENTRAL_JWT_EXPERT_GUIDE.md`

This expert guide contains:
- Complete JWT authentication troubleshooting
- Solutions to "Unauthorized for this grant type" errors
- Token lifecycle and refresh patterns
- Emergency recovery procedures
- Checklist to prevent recurring issues

**This document was created after 5 debugging sessions to prevent future mistakes.**

---

## Authentication & API Integration Troubleshooting Protocol

### When You Encounter Authentication Errors:

#### Step 1: Read the Error Message Literally
- Error codes with specific values in brackets (e.g., `OAU-153: Invalid client application: [AmA1nMSmTqHdJT6phipyqC]`) mean THAT SPECIFIC VALUE is the problem
- The value in brackets is the root cause, not a symptom
- Don't assume the error is about something else

#### Step 2: Research FIRST, Don't Guess
When you see an unfamiliar error code or API behavior:
1. **IMMEDIATELY** do a web search for the exact error code
2. Search the official documentation for that service
3. Look for GitHub examples and community forums
4. Only AFTER research should you propose solutions

**DO NOT:**
- Try random fixes hoping one works
- Update one credential at a time
- Assume existing credentials are valid

#### Step 3: Request Complete Credential Sets
For any authentication system, ALWAYS ask for ALL credentials together:

**Example for RingCentral:**
- CLIENT_ID
- CLIENT_SECRET
- JWT_TOKEN
- SERVER_URL (production vs sandbox)

**Example for OAuth:**
- CLIENT_ID
- CLIENT_SECRET
- REDIRECT_URI
- All required scopes/permissions

**Never update just one credential and test.** They must match the same app/account.

#### Step 4: Verify Assumptions Checklist
Before proposing a fix, verify:
- [ ] All credentials are from the SAME app/account
- [ ] All credentials are for the correct environment (dev/staging/production)
- [ ] The app/account still exists and hasn't been deleted
- [ ] All required permissions/scopes are enabled
- [ ] Credentials haven't expired

#### Step 5: Pattern Recognition for Common Auth Errors

**"Invalid client" errors mean:**
- CLIENT_ID doesn't exist
- CLIENT_ID is from a different environment
- App was deleted
- **Action:** Get fresh credentials from the console

**"Invalid token" errors mean:**
- Token expired
- Token is for a different CLIENT_ID
- Token doesn't have required scopes
- **Action:** Generate new token with correct scopes

**"Unauthorized" errors mean:**
- Missing required permissions
- Wrong authentication method
- **Action:** Check permission settings in console

## The Correct Troubleshooting Flow

```
Error Occurs
    ↓
Read error message literally (what is in brackets?)
    ↓
Research error code + API name (RingCentral OAU-153)
    ↓
Identify root cause from research
    ↓
Request ALL related credentials from user
    ↓
Update ALL credentials together
    ↓
Test
    ↓
Success or iterate with new information
```

## What NOT to Do

❌ Don't guess at solutions without research
❌ Don't update one credential at a time
❌ Don't assume .env file values are still valid
❌ Don't try multiple random fixes hoping one works
❌ Don't ignore the specific value mentioned in error messages

## Real Example: RingCentral Recording Playback

**Error:** `OAU-153: Invalid client application: [AmA1nMSmTqHdJT6phipyqC]`

**Wrong approach (what I did initially):**
1. Added permissions to existing app
2. Generated new JWT only
3. Updated just the JWT in .env
4. Same error persisted
5. User had to tell me to stop guessing

**Right approach (what I should have done):**
1. See error: CLIENT_ID `AmA1nMSmTqHdJT6phipyqC` is invalid
2. Research OAU-153 error code
3. Recognize: CLIENT_ID doesn't exist
4. Ask user for ALL THREE credentials: CLIENT_ID, CLIENT_SECRET, JWT
5. Update all three in .env together
6. Test → Success

**Time saved:** Would have solved in 1 iteration instead of 3-4

## Apply This to All Third-Party Integrations

- Google Ads API
- Supabase connections
- Email services
- Payment processors
- Any OAuth/API authentication

---

## Next.js Environment Variable Caching Issue

### The Problem

**Next.js loads environment variables at startup and caches them.** If you update `.env.local` while the dev server is running, the changes will NOT be picked up until you restart the server.

### Symptoms

- Authentication errors (e.g., OAU-156 "Basic authentication header missing") even though credentials are in .env.local
- API calls fail with "missing credentials" errors
- Environment variables show as undefined in the code
- The health check endpoint (`/api/health/env`) shows variables as "MISSING"

### Root Cause

When the dev server starts:
1. Next.js reads all `.env*` files
2. Injects variables into `process.env`
3. **Caches the .next build directory**
4. Does NOT watch for .env file changes

If you update credentials in `.env.local` after the server starts, the running server still has the OLD values (or undefined if they didn't exist before).

### Solutions Implemented

#### Solution 1: Use `npm run dev:watch` (Recommended)

```bash
npm run dev:watch
```

This command uses `nodemon` to:
- Watch `.env.local` and `.env` files for changes
- Automatically clear the `.next` cache
- Restart the dev server when changes are detected

**Use this during active development when you're frequently updating environment variables.**

#### Solution 2: Manual Restart (When Needed)

If you update `.env.local`:
```bash
# Kill the dev server (Ctrl+C)
rm -rf .next          # Clear the cache
npm run dev           # Restart
```

#### Solution 3: Health Check Endpoint

Visit `/api/health/env` to verify environment variables are loaded:

```bash
curl http://localhost:3000/api/health/env
```

Response shows:
- `status: "healthy"` or `status: "unhealthy"`
- List of all required variables and whether they're loaded
- Preview of first 10 characters (for debugging without exposing secrets)
- Warning if variables are missing

**Use this when debugging authentication issues to confirm the server has the latest credentials.**

### Troubleshooting Workflow Update

When you encounter authentication errors, add this step FIRST:

```
Error Occurs
    ↓
**CHECK: Did I recently update .env.local?**
    ↓ YES
    Restart dev server (rm -rf .next && npm run dev)
    ↓ NO
    Read error message literally (what is in brackets?)
    ↓
    Research error code + API name
    [continue with existing workflow]
```

### Prevention Checklist

- [ ] Use `npm run dev:watch` when actively developing with third-party APIs
- [ ] After updating ANY .env file, restart the dev server
- [ ] Use `/api/health/env` to verify credentials loaded correctly
- [ ] Document in onboarding: "Always restart after .env changes"

### Real Example: OAU-156 Error Resolution

**Initial Error:** `OAU-156: Basic authentication header is missing or malformed`

**Investigation showed:**
1. ✅ Credentials were correct in `.env.local`
2. ✅ Test script with same credentials worked perfectly
3. ❌ API route still had OAU-156 error

**Root Cause:** Dev server was started BEFORE credentials were added to `.env.local`

**Fix:**
```bash
rm -rf .next
# Restart dev server
```

**Result:** Authentication immediately worked - same credentials, fresh server process.

---

## 🚫 NEVER ASSUME - ALWAYS VERIFY

**Critical Rule:** Never make assumptions about production systems, database instances, environment configurations, or any technical infrastructure.

### The Problem with Assumptions

**Real Example - Database Migration Mistake (November 2025):**

**What Happened:**
- User has two Supabase projects: "Auto Glass Staging" and "Pink Auto Glass Website"
- I assumed "Pink Auto Glass Website" was production based on the NAME
- I told user to run migrations on the wrong database
- User caught the mistake by checking activity levels

**Why This Was Dangerous:**
- Could have run migrations on wrong database (wasted time)
- Could have missed updating actual production database (broken features)
- Violated user trust by making lazy assumption

**What I Should Have Done:**
1. ✅ Check the project ID in the code (`fypzafbsfrrlrrufzkol`)
2. ✅ Ask user which project that ID belongs to
3. ✅ Verify by checking activity/data in Supabase dashboard
4. ✅ Confirm with user before proceeding

**What I Actually Did:**
❌ Assumed based on project name sounding "more official"

### When to Verify (Not Assume)

**ALWAYS VERIFY in these situations:**

#### Database & Infrastructure
- [ ] Which database instance is production vs staging
- [ ] Which project ID matches which environment
- [ ] Which API keys belong to which service account
- [ ] Which branch is deployed to production
- [ ] Which domain points to which deployment

#### Configuration & Credentials
- [ ] Which `.env` file is being used
- [ ] Which credentials are for which environment
- [ ] Which API version is configured
- [ ] Which service account has which permissions

#### Code & Deployments
- [ ] Which Git branch is active
- [ ] Which version is deployed
- [ ] Which build is running in production
- [ ] Which feature flags are enabled

### How to Verify (Don't Guess)

**Instead of assuming, do this:**

1. **Check the Code:**
   - Look at project IDs in environment variables
   - Check connection strings
   - Review configuration files

2. **Check the Dashboard:**
   - Verify activity levels (production has traffic)
   - Check data volume
   - Review recent requests

3. **Ask the User:**
   - "Which Supabase project is using ID `xyz`?"
   - "Is this the production database or staging?"
   - "Can you confirm which environment this is?"

4. **Cross-Reference:**
   - Match project IDs to `.env` values
   - Match domains to deployment URLs
   - Match API keys to service accounts

### Assumptions That Broke Things (Learn from These)

| Assumption | Reality | Consequence |
|------------|---------|-------------|
| "Pink Auto Glass Website sounds like production" | Name was misleading | Almost ran migrations on wrong DB |
| "Existing .env credentials are valid" | App was deleted | 3-4 wasted debugging iterations |
| "This CLIENT_ID should work" | CLIENT_ID was from different app | Authentication kept failing |

### The Verification Mantra

**When in doubt:**
1. ❌ **Don't assume** based on names, conventions, or "what makes sense"
2. ✅ **Verify** by checking IDs, activity, data, or asking the user
3. ✅ **Confirm** before making changes to production systems
4. ✅ **Document** what you verified and how you verified it

**Remember:** Assumptions in production can cause:
- Data loss
- Broken features
- Wasted time
- Lost trust

**Verification takes 30 seconds. Fixing a wrong assumption can take hours.**

---

## 🚨 DON'T OVER-ENGINEER: Start Simple, Add Complexity Only When Needed

**Critical Rule:** When working with SDKs, API clients, and third-party libraries, DO NOT create custom wrappers or "optimizations" unless absolutely necessary. Simple solutions work better than clever ones.

### The Problem with Over-Engineering

**Real Example - Custom Fetch Wrapper Broke Supabase Auth (November 2025):**

**What Happened:**
- Admin dashboard showed stale data (stuck on Nov 7)
- I assumed the issue was caching and created a custom fetch wrapper to add cache-busting headers
- The custom wrapper broke Supabase authentication by dropping critical headers
- API returned: `"No API key found in request"`
- User saw: Dashboard stuck on "Loading calls..."

**Why This Was Wrong:**
```typescript
// ❌ BROKEN: Custom fetch wrapper (40 lines)
const customFetch = async (input: RequestInfo, init?: RequestInit) => {
  let reqUrl = typeof input === 'string' ? input : input.url;
  reqUrl = `${reqUrl}?__ts=${Date.now()}`;

  return fetch(reqUrl, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.headers || {}),  // ⚠️ Spread doesn't work on Headers objects!
      'Cache-Control': 'no-cache',
      'X-Request-Ts': Date.now(),
    },
  });
};

const supabase = createClient(url, key, {
  global: { fetch: customFetch }  // ⚠️ Breaks authentication!
});
```

**What I Should Have Done:**
```typescript
// ✅ WORKING: Simple solution (10 lines)
const supabase = createClient(url, key, {
  auth: {
    persistSession: false,  // This alone prevents caching
    autoRefreshToken: false,
  }
});
```

### Why Custom Wrappers Break Things

1. **Headers objects aren't plain objects** - `...init?.headers` silently fails to spread `apikey` and `Authorization` headers
2. **SDKs expect specific fetch behavior** - Custom wrappers can break retry logic, timeouts, error handling
3. **Authentication relies on precise headers** - Any modification risks dropping critical auth headers
4. **You're fighting the library** - If the SDK doesn't work with default fetch, the problem is elsewhere

### The "Start Simple" Protocol

When debugging API/SDK issues, follow this order:

#### 1. Try the Simplest Config First
```typescript
// Start here
const client = createClient(url, apiKey);

// NOT here
const client = createClient(url, apiKey, {
  global: {
    fetch: myCustomFetch,
    headers: { 'X-Custom': 'value' },
  },
  auth: { persistSession: false },
  db: { schema: 'public' },
});
```

#### 2. Add ONE Config Option at a Time
```typescript
// Step 1: Test basic client
const client = createClient(url, apiKey);

// Step 2: If caching is an issue, add ONLY this:
const client = createClient(url, apiKey, {
  auth: { persistSession: false }
});

// Step 3: If still broken, add ONLY the next minimal option
```

#### 3. Test After Each Change
- Don't add multiple config options without testing
- Use curl to verify each change independently
- Check browser DevTools Network tab for actual headers sent

#### 4. If Simple Doesn't Work, Debug WHY
- Is the API key correct?
- Are environment variables loaded?
- Is the endpoint accessible?
- What error does curl show?

**Don't jump to "I need a custom wrapper" until you've verified the basics.**

### When Custom Wrappers Are Actually Needed

✅ **Valid reasons:**
- SDK doesn't support a critical use case (after confirming with documentation)
- Need to add authentication that the SDK doesn't handle (e.g., AWS Signature v4)
- Need to integrate with a monitoring/logging system
- Official SDK recommendation says to customize fetch

❌ **Invalid reasons:**
- "I think this will be faster"
- "I want to add caching" (use SDK config options instead)
- "I want to log requests" (use SDK hooks/interceptors if available)
- "The SDK might be caching" (test first, don't assume)

### Testing Strategy: Direct Before Wrapped

**Always test the API directly before wrapping it:**

```bash
# 1. Test with curl (bypasses all code)
curl -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "https://api.supabase.io/rest/v1/table?select=*"

# 2. If curl works, test with basic SDK
const client = createClient(url, key);
const { data } = await client.from('table').select('*');

# 3. If basic SDK works, you don't need a custom wrapper
# 4. If basic SDK fails but curl works, check SDK config, not fetch
```

### Red Flags That You're Over-Engineering

🚩 **You've written more wrapper code than SDK usage code**
🚩 **You're spreading Headers objects** - `...init?.headers`
🚩 **You're reimplementing retry logic, timeout handling, or error parsing**
🚩 **You haven't tested the simple solution first**
🚩 **You're "optimizing" before measuring actual performance**
🚩 **You're adding features the SDK already has (check docs first)**

### The Cost of Over-Engineering

**This custom fetch wrapper cost:**
- 3 hours of debugging
- Multiple failed deployments
- User frustration ("admin site hasn't updated")
- Wasted Playwright tests
- False belief that RingCentral integration was broken

**The simple solution took:**
- 5 minutes to write
- Worked immediately
- No broken authentication
- No header manipulation complexity

### The Rule: KISS (Keep It Simple, Stupid)

**When working with SDKs and API clients:**

1. ✅ **Use default configuration first**
2. ✅ **Add config options from SDK documentation**
3. ✅ **Test with curl to isolate issues**
4. ✅ **Check SDK changelog/issues for known problems**
5. ❌ **Don't create custom fetch wrappers**
6. ❌ **Don't spread Headers objects**
7. ❌ **Don't "optimize" without measuring**
8. ❌ **Don't assume the SDK needs customization**

### Lessons from November 2025 Debugging Session

| What I Did | What I Should Have Done | Time Wasted |
|------------|-------------------------|-------------|
| Created custom fetch wrapper to "fix caching" | Used `persistSession: false` | 3 hours |
| Spread `init?.headers` (broke auth) | Let SDK manage headers | Multiple deployments |
| Assumed caching was the issue | Used curl to test API first | User frustration |
| Added cache-busting to fetch | Trusted SDK's built-in cache control | Playwright test failures |

**Total time wasted: 3+ hours**
**Working solution: 5 minutes**
**Complexity ratio: 60:1 (worse is bad)**

### Enforcement Rule

**Before creating ANY custom wrapper or fetch function:**

```
STOP and ask:
1. Have I tested the SDK with default config? → If NO, do that first
2. Have I tested with curl to verify the API works? → If NO, do that first
3. Have I checked SDK docs for config options? → If NO, do that first
4. Do I have concrete evidence that a wrapper is needed? → If NO, don't create it
5. Am I trying to be clever instead of simple? → If YES, stop and use simple approach
```

**If you catch yourself writing a custom fetch wrapper:**
1. STOP immediately
2. Test with default SDK config
3. Test with curl
4. Check SDK documentation for config options
5. Only create wrapper if steps 2-4 prove it's absolutely necessary

### This Rule Will Prevent

- Broken authentication from dropped headers
- Hours of debugging over-engineered solutions
- False assumptions about caching/performance
- Fighting against well-designed SDKs
- Creating maintenance burden with custom code

**REMEMBER: The best code is code you don't write. Use the SDK as designed first.**

---

**Remember:** When in doubt, research first. The official documentation is always more reliable than guessing.
