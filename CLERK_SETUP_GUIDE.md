# Clerk Authentication Setup Guide

This guide will help you configure Clerk authentication for the Pink Auto Glass admin dashboard.

## Prerequisites

- Existing Clerk account (you mentioned you already use Clerk for other apps)
- Access to Clerk dashboard: https://dashboard.clerk.com

---

## Step 1: Create a New Clerk Application (or Use Existing)

1. Go to https://dashboard.clerk.com
2. Either create a new application or select an existing one you want to use
3. Name it "Pink Auto Glass" (or similar)

---

## Step 2: Get Your API Keys

1. In the Clerk dashboard, go to **API Keys** in the left sidebar
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Copy these keys** - you'll need them in the next step.

---

## Step 3: Add Environment Variables

### Local Development (`.env.local`)

Add these variables to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Clerk URLs (optional - defaults are usually fine)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
```

### Production (Vercel)

Add the same variables to Vercel:

```bash
# Using Vercel CLI
echo "pk_live_YOUR_KEY_HERE" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
echo "sk_live_YOUR_SECRET_KEY_HERE" | vercel env add CLERK_SECRET_KEY production

# Or via Vercel Dashboard:
# https://vercel.com/dougsimpsoncodes-projects/pinkautoglasswebsite/settings/environment-variables
```

**IMPORTANT:** Use `pk_live_` and `sk_live_` keys for production, not `pk_test_` keys!

---

## Step 4: Configure Allowed Redirect URLs in Clerk

1. Go to your Clerk dashboard
2. Navigate to **User & Authentication** → **Email, Phone, Username**
3. Scroll to **Redirect URLs**
4. Add these URLs:

**Development:**
```
http://localhost:3000/admin/dashboard
http://localhost:3000/admin/login
```

**Production:**
```
https://pinkautoglass.com/admin/dashboard
https://pinkautoglass.com/admin/login
```

---

## Step 5: Create Your First Admin User

### Option A: Via Clerk Dashboard (Recommended)

1. Go to **Users** in Clerk dashboard
2. Click **Create User**
3. Add your email (e.g., `doug@pinkautoglass.com`)
4. Set a password
5. Click **Create**

### Option B: Via Sign-Up (First User Only)

1. Start your dev server: `npm run dev`
2. Go to: http://localhost:3000/admin/login
3. Click "Sign up"
4. Create your account
5. **IMPORTANT:** After creating the first user, disable public sign-ups (see Step 6)

---

## Step 6: Restrict Access to Admin Only

To prevent random people from signing up:

1. In Clerk dashboard, go to **User & Authentication** → **Email, Phone, Username**
2. Set **Sign-up modes** to:
   - ✅ **Restricted** (recommended)
   - or ✅ **Allow list** (whitelist specific emails)
3. If using "Allow list", add:
   - doug@pinkautoglass.com
   - kody@pinkautoglass.com
   - dan@pinkautoglass.com

---

## Step 7: Test Authentication

### Local Development

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000/admin/login
```

**Test Flow:**
1. Try accessing http://localhost:3000/admin/dashboard directly
   - ✅ Should redirect to `/admin/login` (not logged in)
2. Log in with your Clerk credentials
   - ✅ Should redirect to `/admin/dashboard`
3. Dashboard should load with analytics data
   - ✅ You should see your analytics dashboard

---

## Step 8: Deploy to Production

Once local testing works:

```bash
# Deploy to production
vercel --prod --yes
```

**Verify Production:**
1. Go to https://pinkautoglass.com/admin/dashboard
2. Should redirect to https://pinkautoglass.com/admin/login
3. Log in with Clerk credentials
4. Dashboard should load

---

## Troubleshooting

### "Clerk: Missing publishable key"

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Check .env.local exists and has correct keys
cat .env.local | grep CLERK

# Restart dev server
npm run dev
```

### "Redirect URL not allowed"

**Problem:** URL not configured in Clerk dashboard

**Solution:**
1. Go to Clerk dashboard → **Redirect URLs**
2. Add the URL that's being blocked
3. Wait 1-2 minutes for changes to propagate

### "Invalid signature" or auth errors

**Problem:** Using test keys in production or vice versa

**Solution:**
- Local: Use `pk_test_` and `sk_test_` keys
- Production: Use `pk_live_` and `sk_live_` keys

### Can't access dashboard after deploying

**Problem:** Production environment variables not set

**Solution:**
```bash
# Check Vercel environment variables
vercel env ls

# Should see NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
# If missing, add them:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# Redeploy
vercel --prod --yes
```

---

## Security Best Practices

✅ **DO:**
- Use separate Clerk applications for dev and production
- Use `pk_test_` / `sk_test_` keys in development
- Use `pk_live_` / `sk_live_` keys in production
- Set sign-up to "Restricted" or "Allow list"
- Enable MFA/2FA for admin users

❌ **DON'T:**
- Commit API keys to Git (they're in `.env.local` which is gitignored)
- Share secret keys publicly
- Use test keys in production
- Allow public sign-ups for admin dashboard

---

## Need Help?

- Clerk Documentation: https://clerk.com/docs
- Clerk Support: https://clerk.com/support
- Dashboard: https://dashboard.clerk.com

---

## What Changed from Old Auth System

### Before (Custom Auth):
- Custom login API at `/api/admin/login`
- Password hashing with bcrypt
- Session tokens stored in cookies
- User management in Supabase `admin_users` table

### After (Clerk):
- ✅ Clerk handles all auth logic
- ✅ Built-in security features (2FA, SSO, etc.)
- ✅ User management via Clerk dashboard
- ✅ No password storage in your database
- ✅ Automatic session management
- ✅ Protected routes via middleware

You can safely **delete these files** (no longer needed):
- `/src/app/api/admin/login/route.ts`
- `/src/lib/auth.ts` (if it exists)
- `/scripts/create-admin-user.js`
- `/scripts/create-admin-user.sql`

---

## Next Steps

Once Clerk is working:

1. ✅ Add all team members to Clerk (doug@, kody@, dan@)
2. ✅ Enable 2FA for extra security
3. ✅ Set up email notifications for failed login attempts
4. ✅ Review Clerk's analytics and security logs

---

**Status:** Ready to configure! Follow the steps above to complete Clerk setup.
