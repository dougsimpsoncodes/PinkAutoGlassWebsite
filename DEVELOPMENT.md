# Development Guide

## Environment Variables

### ⚠️ IMPORTANT: Environment Variable Caching

**Next.js caches environment variables at startup.** Changes to `.env.local` require a server restart.

### Quick Start

```bash
# Option 1: Auto-restart on .env changes (RECOMMENDED)
npm run dev:watch

# Option 2: Standard dev server (manual restart needed)
npm run dev
```

### When to Use Each Command

**Use `npm run dev:watch` when:**
- Setting up third-party API integrations (RingCentral, Google Ads, etc.)
- Actively updating credentials or API keys
- Debugging authentication issues
- Adding new environment variables

**Use `npm run dev` when:**
- Normal feature development
- Environment variables are stable
- You want faster startup (no cache clearing)

### Verify Environment Variables Loaded

Check that all credentials are loaded correctly:

```bash
curl http://localhost:3000/api/health/env
```

Or visit in browser: [http://localhost:3000/api/health/env](http://localhost:3000/api/health/env)

Expected response when healthy:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-02T16:56:45.653Z",
  "environment": "development",
  "envFile": ".env.local detected",
  "variables": [...]
}
```

### Manual Restart After .env Changes

If you updated `.env.local` and need to restart manually:

```bash
# Kill the dev server (Ctrl+C or Cmd+C)
rm -rf .next
npm run dev
```

### Common Issues

#### "Authentication failed" but credentials are correct in .env.local

**Cause:** Dev server was running when you added/updated credentials.

**Fix:**
```bash
rm -rf .next && npm run dev
```

Or use `npm run dev:watch` to prevent this.

#### Environment variables show as `undefined` in logs

**Cause:** Server hasn't picked up the latest .env.local changes.

**Fix:** Restart the dev server (see above).

#### How do I know if I need to restart?

**Check the health endpoint:**
```bash
curl http://localhost:3000/api/health/env | grep status
```

If it shows `"status":"unhealthy"` or any variables as `"loaded":false`, restart the server.

## Testing Third-Party APIs

When integrating services like RingCentral, Google Ads, or Supabase:

1. **Always use `npm run dev:watch`** during initial setup
2. Add credentials to `.env.local`
3. **Wait for auto-restart** (you'll see "🔄 Environment files changed - restarting server...")
4. Verify with `/api/health/env`
5. Test your integration

## Development Workflow

```bash
# 1. Start development server with auto-restart
npm run dev:watch

# 2. Make changes to code or .env.local
#    (Server will auto-restart on .env changes)

# 3. Verify environment (optional)
curl http://localhost:3000/api/health/env

# 4. Test your changes
```

## Additional Commands

```bash
# Run tests
npm test

# Run tests with UI
npm run test:headed

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Need Help?

- Check `/api/health/env` for environment status
- Review `.claude/CLAUDE.md` for troubleshooting guides
- Ensure all credentials match the same API app/account
