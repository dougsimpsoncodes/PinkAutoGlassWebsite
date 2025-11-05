# Project-Specific Instructions for Claude Code

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

**Remember:** When in doubt, research first. The official documentation is always more reliable than guessing.
