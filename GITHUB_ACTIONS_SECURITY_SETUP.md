# GitHub Actions Security Workflow Setup
**Pink Auto Glass**

This document provides the GitHub Actions workflow configuration for automated security checks.

---

## Quick Setup (5 minutes)

### Step 1: Create Workflow Directory
```bash
mkdir -p .github/workflows
```

### Step 2: Create Security Workflow File
Create `.github/workflows/security.yml` with the content below.

### Step 3: Commit and Push
```bash
git add .github/workflows/security.yml
git commit -m "ci: add security scanning workflow"
git push
```

The workflow will automatically run on:
- Every push to `main` or `develop`
- Every pull request to `main` or `develop`
- Weekly on Mondays at 9am UTC

---

## Workflow File Content

Save this as `.github/workflows/security.yml`:

```yaml
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    # Run weekly on Mondays at 9am UTC
    - cron: '0 9 * * 1'

jobs:
  secret-scanning:
    name: Secret Scanning with Gitleaks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for gitleaks

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_CONFIG: .gitleaks.toml

      - name: Upload Gitleaks report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: gitleaks-report
          path: gitleaks-report.json

  dependency-audit:
    name: Dependency Vulnerability Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: false

      - name: Check for high/critical vulnerabilities
        run: |
          if npm audit --audit-level=high --json | grep -q '"vulnerabilities"'; then
            echo "❌ High or critical vulnerabilities found!"
            npm audit --audit-level=high
            exit 1
          fi
          echo "✅ No high or critical vulnerabilities found"

  forbidden-files:
    name: Check for Forbidden Files
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Check for .env files
        run: |
          if [ -f .env.local ] || [ -f .env.production ] || [ -f .env.development ]; then
            echo "❌ Forbidden .env file found!"
            ls -la .env* || true
            exit 1
          fi
          echo "✅ No forbidden .env files found"

      - name: Check for service role key in client code
        run: |
          if grep -r "SUPABASE_SERVICE_ROLE_KEY\|supabaseAdmin" src/app src/components 2>/dev/null; then
            echo "❌ Service role key usage detected in client-side code!"
            exit 1
          fi
          echo "✅ No service role key in client code"

      - name: Check for hardcoded credentials
        run: |
          # Check for common secret patterns
          if grep -rE "(sk_live_|pk_live_|rk_live_|API_KEY.*=.*['\"][a-zA-Z0-9]{20,})" src/ 2>/dev/null; then
            echo "⚠️ Warning: Possible hardcoded credentials detected"
            exit 1
          fi
          echo "✅ No hardcoded credentials found"

  typescript-build:
    name: TypeScript Compilation
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js
        run: npm run build
        env:
          # Use placeholder values for required env vars
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key

      - name: Check bundle for secrets
        run: |
          if grep -rE "(service_role|sk_live|pk_live|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)" .next/static/ 2>/dev/null; then
            echo "❌ Possible secrets found in client bundle!"
            exit 1
          fi
          echo "✅ No secrets found in client bundle"

  lint:
    name: ESLint Security Rules
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

  playwright-tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npm test
        env:
          # Use test credentials (not production!)
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  summary:
    name: Security Check Summary
    runs-on: ubuntu-latest
    needs: [secret-scanning, dependency-audit, forbidden-files, typescript-build, lint]
    if: always()
    steps:
      - name: Check job results
        run: |
          echo "## Security Check Results" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          if [ "${{ needs.secret-scanning.result }}" = "success" ]; then
            echo "✅ Secret Scanning: PASSED" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ Secret Scanning: FAILED" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.dependency-audit.result }}" = "success" ]; then
            echo "✅ Dependency Audit: PASSED" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ Dependency Audit: FAILED" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.forbidden-files.result }}" = "success" ]; then
            echo "✅ Forbidden Files Check: PASSED" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ Forbidden Files Check: FAILED" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.typescript-build.result }}" = "success" ]; then
            echo "✅ TypeScript Build: PASSED" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ TypeScript Build: FAILED" >> $GITHUB_STEP_SUMMARY
          fi

          if [ "${{ needs.lint.result }}" = "success" ]; then
            echo "✅ ESLint: PASSED" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ ESLint: FAILED" >> $GITHUB_STEP_SUMMARY
          fi

          # Overall result
          if [ "${{ needs.secret-scanning.result }}" = "failure" ] || \
             [ "${{ needs.dependency-audit.result }}" = "failure" ] || \
             [ "${{ needs.forbidden-files.result }}" = "failure" ] || \
             [ "${{ needs.typescript-build.result }}" = "failure" ] || \
             [ "${{ needs.lint.result }}" = "failure" ]; then
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "❌ **Overall: SECURITY CHECKS FAILED**" >> $GITHUB_STEP_SUMMARY
            exit 1
          else
            echo "" >> $GITHUB_STEP_SUMMARY
            echo "✅ **Overall: ALL SECURITY CHECKS PASSED**" >> $GITHUB_STEP_SUMMARY
          fi
```

---

## Branch Protection Rules

### Required Settings in GitHub Repository

1. **Go to:** Repository → Settings → Branches → Branch protection rules → Add rule

2. **Branch name pattern:** `main`

3. **Enable:**
   - ☑ Require a pull request before merging
     - Required number of approvals: 1
   - ☑ Require status checks to pass before merging
     - Required checks:
       - `Secret Scanning with Gitleaks`
       - `Dependency Vulnerability Audit`
       - `Check for Forbidden Files`
       - `TypeScript Compilation`
       - `ESLint Security Rules`
   - ☑ Require branches to be up to date before merging
   - ☑ Do not allow bypassing the above settings

4. **Click:** Create

---

## GitHub Secrets Setup

### Add Test Credentials for CI/CD

Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

**Add these secrets:**

```
Name: TEST_SUPABASE_URL
Value: https://your-test-project.supabase.co
Description: Development Supabase project URL (NOT production)

Name: TEST_SUPABASE_ANON_KEY
Value: eyJ... (development anon key)
Description: Development Supabase anon key (NOT production)
```

**IMPORTANT:** Use separate Supabase project for testing. NEVER use production credentials in GitHub Actions.

---

## Testing the Workflow

### Trigger Manually
```bash
# Go to: Repository → Actions → Security Checks → Run workflow
```

### Test with a Pull Request
```bash
git checkout -b test-security-workflow
git commit --allow-empty -m "test: trigger security workflow"
git push origin test-security-workflow

# Create PR on GitHub
# Workflow will run automatically
```

### Test Secret Detection
```bash
# This should FAIL (good!)
echo "SUPABASE_SERVICE_ROLE_KEY=abc123" > test-secret.txt
git add test-secret.txt
git commit -m "test: secret detection"
git push

# Gitleaks should detect and fail the workflow
# Then clean up:
git reset HEAD~1
git push --force
```

---

## Monitoring & Alerts

### Email Notifications

**Go to:** GitHub → Settings (Your profile) → Notifications

**Enable:**
- ☑ Email notifications for: Failed workflows

### Slack Notifications (Optional)

**Install GitHub app in Slack:**
```
/github subscribe owner/repo workflows:{event:"push" branch:"main"}
```

---

## Maintenance

### Weekly Tasks
- [ ] Review security workflow results (automated Monday runs)
- [ ] Update dependencies if vulnerabilities found
- [ ] Review and clear any workflow failures

### Monthly Tasks
- [ ] Review and update secret scanning patterns (.gitleaks.toml)
- [ ] Update GitHub Actions versions (dependabot)
- [ ] Test emergency procedures (simulate secret leak)

### Quarterly Tasks
- [ ] Review branch protection rules
- [ ] Audit GitHub repository access (remove inactive members)
- [ ] Update security workflow based on new threats

---

## Troubleshooting

### Workflow Fails on Gitleaks

**Check:**
1. Is `.gitleaks.toml` in repository root?
2. Are there false positives? (Add to allowlist)
3. Is a real secret committed? (Follow incident response)

### Workflow Fails on Dependency Audit

**Fix:**
```bash
# Locally
npm audit fix

# Or manually update
npm install package-name@latest

# Test
npm test

# Commit
git add package.json package-lock.json
git commit -m "fix: update dependencies to address vulnerabilities"
git push
```

### Workflow Fails on TypeScript Build

**Check:**
```bash
# Locally
npm run build

# Fix errors
# Commit fixes
# Push
```

### Workflow Takes Too Long (>10 minutes)

**Optimize:**
- Cache node_modules (already done with `cache: 'npm'`)
- Reduce Playwright test suite (if applicable)
- Use matrix builds for parallel execution

---

## Advanced Configuration

### Add Slack Notifications

Add to `.github/workflows/security.yml` (at end of `summary` job):

```yaml
      - name: Notify Slack on Failure
        if: failure()
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "❌ Security checks failed on ${{ github.repository }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Security Checks Failed*\n\nRepository: ${{ github.repository }}\nBranch: ${{ github.ref }}\nRun: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

Then add secret: `SLACK_WEBHOOK_URL` in repository settings.

### Add Code Coverage

```yaml
  coverage:
    name: Code Coverage
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

---

## Cost

GitHub Actions includes:
- **2,000 minutes/month** (free for public repos)
- **Unlimited minutes** for public repositories

This workflow uses approximately:
- **10 minutes per run** (push/PR)
- **1 run per week** (scheduled)
- **~40 minutes/month** for scheduled runs
- **Variable** for push/PR runs (depends on activity)

**Estimated monthly cost:** $0 (well within free tier)

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Gitleaks Action](https://github.com/gitleaks/gitleaks-action)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

---

**Last Updated:** October 29, 2025
**Version:** 1.0
**Owner:** Security & Compliance Officer
