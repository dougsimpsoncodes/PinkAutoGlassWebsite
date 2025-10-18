# Pink Auto Glass Website

Professional auto glass repair and replacement website for Denver Metro area. Built with Next.js, TypeScript, and Tailwind CSS.

## ⚠️ Security Notice

**Before deploying to production**, review the comprehensive security audit:
- **Start here:** [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) - Quick overview
- **Action items:** [IMMEDIATE_ACTIONS.md](IMMEDIATE_ACTIONS.md) - Step-by-step fixes
- **Full audit:** [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) - Complete findings
- **Policies:** [SECURITY_POLICIES.md](SECURITY_POLICIES.md) - Ongoing procedures
- **Daily checklist:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) - Developer reference

**Current Status:** ⛔ Deployment blocked pending critical security fixes (~8-10 hours work)

---

## Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized for speed and SEO
- **Testing**: Comprehensive Playwright test suite
- **Security**: Pre-commit hooks, secret scanning, input sanitization
- **CI/CD**: Automated testing and deployment pipeline

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Gitleaks (for secret scanning): `brew install gitleaks`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pinkautoglasswebsite
```

2. Install dependencies:
```bash
npm install
```

3. Set up git hooks for security:
```bash
chmod +x .git-hooks/pre-commit
git config core.hooksPath .git-hooks
```

4. Copy environment variables:
```bash
cp .env.example .env.local
```

5. Fill in your environment variables in `.env.local` (NEVER commit this file):
```bash
# Required variables:
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

6. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run Playwright tests
- `npm run generate-brand` - Generate brand assets

## Security

### Pre-Commit Checks

Every commit automatically runs:
- ✅ Secret scanning (gitleaks)
- ✅ TypeScript compilation
- ✅ ESLint
- ✅ Forbidden file checks

To bypass (NOT RECOMMENDED):
```bash
git commit --no-verify
```

### Before Committing

Always run:
```bash
# Check for secrets
gitleaks protect --staged --verbose

# Run tests
npm test

# Build verification
npm run build
```

### Before Deploying

See [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for complete pre-deployment checklist.

## Testing

Run the complete test suite:
```bash
npm run test
```

Run tests in headed mode for debugging:
```bash
npx playwright test --headed
```

## Deployment

### Vercel (Recommended)

**IMPORTANT:** Complete security fixes before deploying (see [IMMEDIATE_ACTIONS.md](IMMEDIATE_ACTIONS.md))

1. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (production only, server-side)
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - `RECAPTCHA_SECRET_KEY`
   - All other secrets from `.env.example`

2. Connect repository to Vercel

3. Deploy automatically on push to main branch

4. Run post-deployment verification (see [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md))

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `.next` folder to your hosting provider

## Environment Variables

See `.env.example` for all available environment variables.

**Required for basic functionality:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (SECRET, server-only)

**Optional for enhanced features:**
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA for spam prevention
- `UPSTASH_REDIS_REST_URL` - Redis for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication
- `TWILIO_AUTH_TOKEN` - SMS notifications (future)
- `STRIPE_SECRET_KEY` - Payment processing (future)

**SECURITY RULES:**
- ✅ Use `NEXT_PUBLIC_` prefix for client-safe variables only
- ❌ NEVER commit `.env.local` or `.env.production` to git
- ❌ NEVER use service role key in client-side code
- ✅ Store production secrets in Vercel environment variables ONLY

## Architecture

```
src/
├── app/              # Next.js app router pages
│   ├── api/          # API routes (server-side)
│   ├── book/         # Booking flow pages
│   └── ...
├── components/       # Reusable UI components
│   ├── book/         # Booking form components
│   └── ...
└── lib/              # Utility functions
    ├── supabase.ts   # Database client
    ├── sanitize.ts   # Input sanitization
    └── ...

public/               # Static assets
tests/                # Playwright test files
.git-hooks/           # Git hooks (pre-commit security)
supabase/             # Database schema and migrations
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run security checks: `npm run build && npm test`
4. Pre-commit hook will automatically run on commit
5. Create pull request

### Code Review Checklist

- [ ] No secrets committed (gitleaks passed)
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] No console.log statements with PII
- [ ] Input sanitization applied to user inputs
- [ ] Rate limiting on new API routes
- [ ] RLS policies verified if database schema changed

## Security Policies

All team members must follow security policies outlined in [SECURITY_POLICIES.md](SECURITY_POLICIES.md):

- **Secrets Management:** No secrets in code, rotation schedule, emergency procedures
- **Access Control:** Principle of least privilege, 2FA required
- **Data Protection:** PII handling, retention policies, user rights
- **Incident Response:** Security event procedures, breach notification
- **Deployment Security:** Environment separation, CI/CD security

## Support

### Documentation
- [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) - Security overview
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) - Daily developer checklist
- [SECURITY_POLICIES.md](SECURITY_POLICIES.md) - Official policies

### Contact
- Security Issues: security@pinkautoglass.com
- General Support: service@pinkautoglass.com
- Phone: (720) 918-7465

## License

Private - Pink Auto Glass

## Deployment Status

**Last Security Audit:** October 17, 2025
**Deployment Status:** ⛔ BLOCKED - Pending security fixes
**Target Deployment:** After critical and high-priority security issues resolved (~1-2 business days)
**Security Approval:** Required from Security Officer

---

## Quick Start for New Developers

1. **Read security overview:** [SECURITY_SUMMARY.md](SECURITY_SUMMARY.md) (10 min)
2. **Install dependencies:** `npm install` (5 min)
3. **Set up git hooks:** `chmod +x .git-hooks/pre-commit && git config core.hooksPath .git-hooks` (1 min)
4. **Copy environment template:** `cp .env.example .env.local` (1 min)
5. **Get credentials from tech lead:** Ask for development Supabase credentials
6. **Start development:** `npm run dev`
7. **Review checklist before commits:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

**Total setup time:** ~20 minutes

---

**Ready to deploy?** Start with [IMMEDIATE_ACTIONS.md](IMMEDIATE_ACTIONS.md) for the complete security fix checklist.
