# RingCentral JWT Authentication - Expert Guide

**Created:** November 5, 2025
**Purpose:** Permanent reference for RingCentral JWT authentication to prevent recurring issues

---

## Table of Contents

1. [Critical Concepts](#critical-concepts)
2. [Common Errors and Solutions](#common-errors-and-solutions)
3. [JWT Token Lifecycle](#jwt-token-lifecycle)
4. [Proper Implementation](#proper-implementation)
5. [Troubleshooting Checklist](#troubleshooting-checklist)
6. [Emergency Recovery](#emergency-recovery)

---

## Critical Concepts

### What is a JWT in RingCentral?

**JWT (JSON Web Token)** is a user credential presented in Ring Central's OAuth flow to obtain an access token.

**IMPORTANT DISTINCTION:**
- **JWT Token** = Persistent credential (doesn't expire unless configured to)
- **Access Token** = Short-lived token obtained using JWT (expires in 1 hour)
- **Refresh Token** = Used to get new access tokens (expires in 1 week)

The RingCentral SDK **automatically handles** access token refresh using refresh tokens.

### Two Types of JWT

1. **App JWT** - For app-level operations (NOT what we use)
2. **User JWT** - For user-specific operations (THIS is what we use)

**Using the wrong type causes "Unauthorized for this grant type" errors!**

---

## Common Errors and Solutions

### Error: "Unauthorized for this grant type"

**This error has FIVE main causes:**

#### 1. App Not Configured for JWT in RingCentral Console

**Problem:** The RingCentral app in the Developer Portal is not enabled for JWT authentication.

**Solution:**
1. Go to https://developers.ringcentral.com
2. Select your app
3. Navigate to "Auth" settings
4. **Ensure "JWT auth flow" is selected/enabled**
5. Save changes
6. **Regenerate JWT token** after enabling

#### 2. Using App JWT Instead of User JWT

**Problem:** Generated the wrong type of JWT token.

**Solution:**
- When creating JWT credentials, ensure you're creating a **User JWT**
- The JWT should be created from RingCentral Console → Credentials → Create JWT (User)
- NOT from app settings (that's App JWT)

#### 3. Server Environment Mismatch

**Problem:** Using a sandbox JWT token with production server URL or vice versa.

**Solution:**
- **Sandbox:** `https://platform.devtest.ringcentral.com`
- **Production:** `https://platform.ringcentral.com`
- JWT token must match the server environment
- Check `RINGCENTRAL_SERVER_URL` environment variable

#### 4. Outdated RingCentral SDK

**Problem:** Using an old version of `@ringcentral/sdk` that doesn't support JWT.

**Solution:**
```bash
npm update @ringcentral/sdk
```

Current working version: Check `package.json`

#### 5. JWT Token Expired (User-Configured Expiration)

**Problem:** JWT was created with an expiration date that has passed.

**Solution:**
- Decode JWT to check expiration: `exp` claim
- Go to RingCentral Console and generate new JWT
- Update `RINGCENTRAL_JWT_TOKEN` in environment variables

---

## JWT Token Lifecycle

### Token Hierarchy

```
JWT Token (Persistent, ~100 years default)
    ↓ platform.login({ jwt })
Access Token (1 hour / 3600 seconds)
    ↓ When access token expires
Refresh Token (1 week / 604800 seconds)
    ↓ SDK automatically refreshes
New Access Token + New Refresh Token
```

### Automatic Token Management

The `@ringcentral/sdk` handles token refresh **automatically**:

```javascript
const platform = rcsdk.platform();
await platform.login({ jwt: JWT_TOKEN });

// Access tokens are automatically refreshed
// You don't need to manually refresh!
```

### Token Expiration Times

| Token Type | Expiration | Renewable |
|------------|------------|-----------|
| JWT Token | ~100 years (default) | No (regenerate if needed) |
| Access Token | 1 hour (3600s) | Yes (via refresh token) |
| Refresh Token | 1 week (604800s) | Yes (single-use, get new on refresh) |

### Session Limits

- **Max 5 concurrent tokens per user**
- 6th login revokes the oldest token
- Applies across all apps for the same user

---

## Proper Implementation

### 1. Environment Variables

**Required Variables:**
```bash
RINGCENTRAL_CLIENT_ID=<your_client_id>
RINGCENTRAL_CLIENT_SECRET=<your_client_secret>
RINGCENTRAL_JWT_TOKEN=<your_jwt_token>
RINGCENTRAL_SERVER_URL=https://platform.ringcentral.com  # or devtest
```

### 2. SDK Initialization (Correct Pattern)

```typescript
import { SDK } from '@ringcentral/sdk';

const rcsdk = new SDK({
  server: process.env.RINGCENTRAL_SERVER_URL!,
  clientId: process.env.RINGCENTRAL_CLIENT_ID!,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET!,
});

const platform = rcsdk.platform();
```

### 3. Authentication

```typescript
// Login with JWT
await platform.login({
  jwt: process.env.RINGCENTRAL_JWT_TOKEN!
});

// Get access token for raw API calls
const authData = await platform.auth().data();
const accessToken = authData.access_token;
```

### 4. Making API Calls

**Option A: Using SDK (Recommended)**
```typescript
const response = await platform.get('/restapi/v1.0/account/~/call-log');
const data = await response.json();
```

**Option B: Using Raw Fetch**
```typescript
const response = await fetch(
  `${RC_SERVER_URL}/restapi/v1.0/account/~/call-log`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

### 5. Required App Permissions

Ensure your app has these permissions enabled:
- ✅ **ReadAccounts** - Read account information
- ✅ **ReadCallLog** - Read call history
- ✅ Any other permissions your app needs

**Missing permissions = API call failures!**

---

## Troubleshooting Checklist

When you encounter JWT authentication errors, check these in order:

### Phase 1: Environment Check
- [ ] Is `RINGCENTRAL_JWT_TOKEN` set in environment variables?
- [ ] Is `RINGCENTRAL_CLIENT_ID` set?
- [ ] Is `RINGCENTRAL_CLIENT_SECRET` set?
- [ ] Is `RINGCENTRAL_SERVER_URL` correct for your environment?

### Phase 2: Token Validation
- [ ] Decode JWT token - is `exp` claim in the future?
- [ ] Does JWT `iss` claim match `RINGCENTRAL_SERVER_URL`?
- [ ] Is this a **User JWT** (not App JWT)?

### Phase 3: App Configuration
- [ ] Log into RingCentral Developer Portal
- [ ] Select your app
- [ ] Check "Auth" settings - is "JWT auth flow" enabled?
- [ ] Check "Permissions" - are required scopes enabled?

### Phase 4: SDK Version
- [ ] Run `npm list @ringcentral/sdk`
- [ ] Is version >= 5.0.0?
- [ ] If outdated: `npm update @ringcentral/sdk`

### Phase 5: Production Deployment
- [ ] Did you update Vercel environment variables?
- [ ] Did you redeploy after updating environment variables?
- [ ] Check `/api/health/env` to verify variables loaded

---

## Emergency Recovery

### Symptom: "Unauthorized for this grant type" in Production

**Do This NOW:**

1. **Verify App Configuration**
   ```bash
   # Check current environment
   curl https://pinkautoglass.com/api/health/env | jq '.variables[] | select(.key | contains("RINGCENTRAL"))'
   ```

2. **Check RingCentral Developer Console**
   - Go to: https://developers.ringcentral.com
   - Login → My Apps → Select "Pink Auto Glass"
   - **Auth Settings:**
     - ✅ Confirm "JWT auth flow" is checked
     - ✅ Confirm "OAuth 2.0" is checked
   - **Permissions:**
     - ✅ ReadAccounts
     - ✅ ReadCallLog

3. **Regenerate JWT Token IF:**
   - App was recently reconfigured
   - Auth flow was changed
   - Token is expired (check `exp` claim)

   **How to Regenerate:**
   - RingCentral Console → Credentials → JWT Credentials
   - Click "Create JWT" (User type)
   - Copy new JWT token
   - Update `.env.local` and Vercel environment
   - Redeploy

4. **Update Environment Variables**
   ```bash
   # Local
   # Update .env.local with new JWT

   # Production
   vercel env rm RINGCENTRAL_JWT_TOKEN production
   printf "<new_jwt>" | vercel env add RINGCENTRAL_JWT_TOKEN production
   vercel --prod
   ```

5. **Test**
   ```bash
   curl -X POST https://pinkautoglass.com/api/admin/sync/ringcentral \
     -H "Authorization: Basic $(printf 'admin:Pink!' | base64)"
   ```

---

## Reference Links

- **JWT Documentation:** https://developers.ringcentral.com/guide/authentication/jwt-flow
- **JWT Quick Start:** https://developers.ringcentral.com/guide/authentication/jwt/quick-start
- **Troubleshooting:** https://developers.ringcentral.com/guide/authentication/jwt/troubleshooting
- **Community Forum:** https://community.ringcentral.com/developer-platform-apis-integrations-5
- **GitHub Example:** https://github.com/suyashjoshi/ringcentral-node-auth-jwt

---

## Implementation Notes for Pink Auto Glass

### Current Configuration
- **Server:** Production (`https://platform.ringcentral.com`)
- **Phone:** +17209187465
- **SDK:** `@ringcentral/sdk` v5.x
- **File:** `src/app/api/admin/sync/ringcentral/route.ts`

### Environment Variables (Vercel)
```bash
RINGCENTRAL_CLIENT_ID
RINGCENTRAL_CLIENT_SECRET
RINGCENTRAL_JWT_TOKEN
RINGCENTRAL_SERVER_URL
RINGCENTRAL_PHONE_NUMBER
```

### Key Features
- ✅ Automatic token refresh (SDK handles it)
- ✅ Fetches last 30 days of call logs
- ✅ Stores in Supabase `ringcentral_calls` table
- ✅ Deduplicates by session_id
- ✅ Tracks inbound/outbound, answered/missed

### Testing Endpoints
- **Health Check:** `/api/health/env` - Verify environment variables
- **Sync Status:** `GET /api/admin/sync/ringcentral` - Check last sync
- **Manual Sync:** `POST /api/admin/sync/ringcentral` - Trigger sync
- **Call List:** `GET /api/admin/calls` - Fetch stored calls

---

## Final Checklist: Never Make These Mistakes Again

❌ **DON'T:**
- Use `echo` to pipe passwords (adds newlines)
- Assume JWT token never expires (check `exp` claim)
- Use App JWT for user operations
- Mix sandbox and production credentials
- Forget to redeploy after environment variable changes

✅ **DO:**
- Use `printf` for passwords (no newlines)
- Check app configuration in RingCentral Console first
- Verify environment match (sandbox vs production)
- Let SDK handle token refresh automatically
- Test locally before deploying to production

---

**Last Updated:** November 5, 2025
**Maintainer:** Pink Auto Glass Development Team
**Status:** ✅ Active Reference Document
