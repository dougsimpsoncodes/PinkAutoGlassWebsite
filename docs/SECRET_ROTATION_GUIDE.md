# Secret Rotation Guide

**Priority**: CRITICAL
**Timeline**: Complete within 24 hours
**Reason**: Post-audit best practice; keys have been in production environment

## Status Check

✅ **Git Repository**: Clean - no secrets in history (verified)
✅ **Gitignore**: Properly configured (`.env*` ignored)
⚠️ **Live Environment**: Keys need rotation in Vercel production

## Step 1: Rotate Supabase Keys

### 1.1 Generate New Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Under "Project API keys":
   - Click "Reset" next to the anon/public key
   - **Warning**: This will invalidate the old key immediately
   - Copy the new `anon key`

### 1.2 Generate New Service Role Key

1. In the same API settings page
2. Click "Reset" next to the service role key
3. **Warning**: This is highly privileged - handle with care
4. Copy the new `service role key`

### 1.3 Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `pinkautoglasswebsite` project
3. Navigate to **Settings** → **Environment Variables**
4. Update the following variables:

   | Variable | Scope | Action |
   |----------|-------|--------|
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Edit → Paste new anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Production only | Edit → Paste new service role key |

5. **Save** each variable

### 1.4 Redeploy Production

After updating environment variables:

```bash
# Trigger a new production deployment to use new keys
git commit --allow-empty -m "Trigger redeploy after secret rotation"
git push origin main
```

Or use Vercel CLI:

```bash
vercel --prod
```

### 1.5 Verify New Keys Work

1. Visit production site: https://pinkautoglass.com/book
2. Submit a test booking
3. Check Supabase dashboard for the new lead
4. Verify no authentication errors in browser console

**Expected Result**: Booking succeeds, data appears in Supabase `leads` table

## Step 2: Rotate Form Security Secrets

### 2.1 Generate New Secrets

```bash
# Generate new secrets (run locally)
echo "FORM_INTEGRITY_SECRET=$(openssl rand -hex 32)"
echo "FINGERPRINT_SALT=$(openssl rand -hex 32)"
echo "FORM_SESSION_SECRET=$(openssl rand -hex 32)"
echo "FILE_UPLOAD_SECRET=$(openssl rand -hex 32)"
```

### 2.2 Update Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Scope | New Value |
|----------|-------|-----------|
| `FORM_INTEGRITY_SECRET` | Production | Generated hex (64 chars) |
| `FINGERPRINT_SALT` | Production | Generated hex (64 chars) |
| `FORM_SESSION_SECRET` | Production | Generated hex (64 chars) |
| `FILE_UPLOAD_SECRET` | Production | Generated hex (64 chars) |

### 2.3 Important Notes

- **SALT_VERSION**: Increment to `v2` after rotating FINGERPRINT_SALT
- **Graceful Transition**: Old form tokens will fail, but this is acceptable (users can reload page)
- **Monitor**: Check error logs for 24 hours after rotation

## Step 3: Optional - Rotate Communication Service Keys

If you've configured these services:

### 3.1 Twilio (SMS)
1. Twilio Console → Settings → API Credentials
2. Create new API Key & Secret
3. Update `TWILIO_AUTH_TOKEN` in Vercel

### 3.2 SendGrid/Resend (Email)
1. Service dashboard → API Keys
2. Create new key with same permissions
3. Update in Vercel
4. Delete old key after verification

## Step 4: Update Local Development Environment

**After rotating keys:**

1. Copy new anon key from Supabase dashboard
2. Update your local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...NEW_ANON_KEY
```

3. **DO NOT** copy service role key to local environment (not needed for development)
4. Test locally: `npm run dev` and submit a test booking

## Verification Checklist

- [ ] New Supabase anon key generated and deployed
- [ ] New Supabase service role key generated and deployed (production only)
- [ ] Production deployment succeeded with new keys
- [ ] Test booking submitted successfully on production
- [ ] Form security secrets rotated (FORM_INTEGRITY_SECRET, FINGERPRINT_SALT, etc.)
- [ ] SALT_VERSION incremented to v2
- [ ] Local development environment updated with new anon key
- [ ] No authentication errors in production logs
- [ ] Old keys documented in password manager (for audit trail)

## Rollback Plan

If issues occur after rotation:

1. Supabase keys cannot be rolled back (rotation is permanent)
2. Instead, generate NEW keys again and redeploy
3. Check Supabase dashboard for any RLS policy issues
4. Verify CORS settings in Supabase allow your domain

## Security Best Practices Going Forward

1. **Regular Rotation**: Rotate secrets every 90 days
2. **Audit Access**: Review Vercel team access quarterly
3. **Monitor Usage**: Check Supabase dashboard for anomalies
4. **Least Privilege**: Only use service role key where absolutely necessary
5. **Separate Environments**: Use different keys for dev/staging/prod

## Timeline

- **Hour 0-1**: Generate and deploy new Supabase keys
- **Hour 1-2**: Verify production functionality
- **Hour 2-3**: Rotate form security secrets
- **Hour 3-24**: Monitor for issues
- **Day 2**: Update documentation, mark rotation complete

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/help
- **Project Owner**: [Your contact info]

---

**Last Updated**: 2025-10-18
**Next Rotation Due**: 2025-01-18 (90 days)
