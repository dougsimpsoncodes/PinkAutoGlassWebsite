# Pink Auto Glass Website

Professional auto glass repair and replacement website for Denver Metro area. Built with Next.js, TypeScript, and Tailwind CSS.

## 🔒 Security

This project follows security best practices including:
- Pre-commit secret scanning with gitleaks
- Row-Level Security (RLS) on database
- Input validation and sanitization
- Security headers and CSP
- Regular security audits

See [SECURITY.md](SECURITY.md) for comprehensive security documentation and [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) for daily developer guidelines.

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

### Environment File Structure

This project uses a **simplified two-file approach** for environment management:

1. **`.env.example`** - Template with all available variables (committed to git)
2. **`.env.local`** - Your local development values (NEVER commit)

**For production:** All environment variables are configured in the Vercel dashboard. No `.env.production` files should exist in the repository.

### Setup

```bash
# Copy the template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

### Required Variables (Production)

These **must** be set in production or the app will fail to start:

**Authentication:**
- `ADMIN_USERNAME` - Admin dashboard username (fails with 500 if missing)
- `ADMIN_PASSWORD` - Admin dashboard password (fails with 500 if missing)
- `NEXT_PUBLIC_API_KEY` - Public API key for booking forms
- `API_KEY_ADMIN` - Admin API key (server-side only)
- `API_KEY_INTERNAL` - Internal API key for webhooks

**Database:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (SECRET, server-only)

**Integrations:**
- `RESEND_API_KEY` - Email service
- `RINGCENTRAL_CLIENT_ID` - Phone/SMS service
- `RINGCENTRAL_CLIENT_SECRET` - RingCentral auth
- `RINGCENTRAL_JWT_TOKEN` - RingCentral JWT

See `.env.example` for complete list of optional variables for enhanced features.

### Security Rules

- ✅ Use `NEXT_PUBLIC_` prefix for client-safe variables only
- ✅ Required production variables fail loudly if missing (fail-closed security)
- ✅ Store production secrets in Vercel environment variables ONLY
- ❌ NEVER commit `.env.local`, `.env.production`, or any file with real credentials
- ❌ NEVER hardcode secrets in code - always use `process.env.VARIABLE_NAME`
- ❌ NEVER use service role key in client-side code
- ❌ NEVER create multiple `.env.*` variant files - leads to configuration drift

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

## Documentation Structure

### Quick Start
- **[START_HERE.md](START_HERE.md)** - New to the project? Start here
- **[AGENT_SETUP_GUIDE.md](AGENT_SETUP_GUIDE.md)** - Comprehensive developer setup guide
- **[agents.md](agents.md)** - AI agent roles and coordination

### Security
- **[SECURITY.md](SECURITY.md)** - Main security documentation
- **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)** - Daily developer security checklist
- **[SECURITY_POLICIES.md](SECURITY_POLICIES.md)** - Official security policies and procedures

### Deployment
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Comprehensive deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Security-focused deployment checklist

### Organized Documentation
- **spec/** - Specifications (booking flow, SEO, components, layouts)
- **qa/** - QA and testing documentation (performance, accessibility, reviews)
- **design/** - Design guidelines (brand, copy, design tokens)
- **security/** - Security policies (baseline, CI/CD, incident response)
- **content/** - Content planning and drafts

### Historical Documentation
- **archive/** - Historical reports, completed phase documents, and resolved issues
  - See [archive/README.md](archive/README.md) for details

## Support

### Contact
- Security Issues: security@pinkautoglass.com
- General Support: service@pinkautoglass.com
- Phone: (720) 918-7465

## License

Private - Pink Auto Glass

## Project Status

**Current Version:** Production v1.0
**Build Status:** ✅ Clean build (0 errors)
**Security Status:** ✅ Security measures implemented
**Documentation:** Organized and current (see Documentation Structure below)

---

## Quick Start for New Developers

1. **Read the overview:** [START_HERE.md](START_HERE.md) (10 min)
2. **Install dependencies:** `npm install` (5 min)
3. **Set up git hooks:** `chmod +x .git-hooks/pre-commit && git config core.hooksPath .git-hooks` (1 min)
4. **Copy environment template:** `cp .env.example .env.local` (1 min)
5. **Get credentials from tech lead:** Ask for development Supabase credentials
6. **Start development:** `npm run dev`
7. **Review security checklist:** [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)

**Total setup time:** ~20 minutes

For comprehensive setup instructions, see [AGENT_SETUP_GUIDE.md](AGENT_SETUP_GUIDE.md).

---

**Ready to deploy?** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) and [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md).
