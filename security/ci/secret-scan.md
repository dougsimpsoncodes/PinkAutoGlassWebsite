# Secret Scanning and CI/CD Security
## Pink Auto Glass Security Baseline

### Overview
This document establishes comprehensive secret scanning procedures for Pink Auto Glass, including pre-commit hooks, CI/CD pipeline integration, and automated response procedures for secret detection and remediation.

### Pre-commit Hook Setup for Secret Detection

#### Gitleaks Configuration
**Installation and Setup:**
```bash
# Install gitleaks globally
brew install gitleaks

# Or download binary directly
curl -sSfL https://github.com/zricethezav/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_darwin_arm64.tar.gz | tar -xz
sudo mv gitleaks /usr/local/bin/
```

**Gitleaks Configuration File (.gitleaks.toml):**
```toml
# Pink Auto Glass - Gitleaks Configuration
title = "Pink Auto Glass Secret Scanning"

[extend]
# Use default rules as base
useDefault = true

[[rules]]
description = "Supabase Service Key"
id = "supabase-service-key"
regex = '''eyJ[A-Za-z0-9_/+-]*\.[A-Za-z0-9_/+-]*\.[A-Za-z0-9_/+-]*'''
keywords = ["eyJ"]

[[rules]]
description = "Twilio Account SID"
id = "twilio-account-sid" 
regex = '''AC[0-9a-fA-F]{32}'''
keywords = ["AC"]

[[rules]]
description = "Twilio Auth Token"
id = "twilio-auth-token"
regex = '''[0-9a-fA-F]{32}'''
keywords = ["auth_token", "authToken"]

[[rules]]
description = "Stripe Secret Key"
id = "stripe-secret-key"
regex = '''sk_(test|live)_[0-9a-zA-Z]{24,}'''
keywords = ["sk_test", "sk_live"]

[[rules]]
description = "Stripe Public Key"
id = "stripe-public-key"
regex = '''pk_(test|live)_[0-9a-zA-Z]{24,}'''
keywords = ["pk_test", "pk_live"]

[[rules]]  
description = "Next.js Secret"
id = "nextauth-secret"
regex = '''[0-9a-fA-F]{32,}'''
keywords = ["NEXTAUTH_SECRET", "nextauth_secret"]

[[rules]]
description = "Database Connection String"
id = "database-url"
regex = '''postgres://[^:]+:[^@]+@[^/]+/[^?]+'''
keywords = ["postgres://", "postgresql://"]

[[rules]]
description = "Vercel Token" 
id = "vercel-token"
regex = '''[0-9a-zA-Z]{24,}'''
keywords = ["VERCEL_TOKEN", "vercel_token"]

# Allowlist for test files and documentation
[allowlist]
paths = [
  '''.*_test\..*''',
  '''.*\.md$''',
  '''.*\.example$''',
  '''.*/docs/.*''',
  '''.*/examples/.*'''
]

commits = [
  "127d529" # Initial commit - allow setup examples
]

regexes = [
  '''placeholder_key_[0-9a-zA-Z]{8,}''',
  '''example_token_[0-9a-zA-Z]{8,}''',
  '''test_secret_[0-9a-zA-Z]{8,}'''
]
```

#### Pre-commit Hook Implementation
**Install Pre-commit Framework:**
```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  - repo: https://github.com/trufflesecurity/trufflehog
    rev: v3.63.2-rc0
    hooks:
      - id: trufflehog
        name: TruffleHog
        description: Detect secrets in your data.
        entry: bash -c 'trufflehog git file://. --since-commit HEAD --only-verified --fail'
        language: system
        stages: ["commit", "push"]

  - repo: local
    hooks:
      - id: env-file-check
        name: Check for .env files
        entry: bash -c 'if find . -name ".env*" -not -path "./.git/*" -not -name ".env.example" | grep -q .; then echo "Error: .env files found in repository"; exit 1; fi'
        language: system
        pass_filenames: false

      - id: secret-pattern-check
        name: Custom secret pattern check
        entry: scripts/check-secrets.sh
        language: system
        pass_filenames: true

EOF

# Install the hooks
pre-commit install
```

**Custom Secret Detection Script (scripts/check-secrets.sh):**
```bash
#!/bin/bash
# Custom secret detection for Pink Auto Glass

set -e

echo "Running custom secret pattern checks..."

# Define patterns specific to Pink Auto Glass
declare -A PATTERNS=(
    ["supabase_url"]="https://[a-zA-Z0-9-]+\.supabase\.co"
    ["api_key"]="[Aa]pi[_-]?[Kk]ey['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_-]{20,}"
    ["secret_key"]="[Ss]ecret[_-]?[Kk]ey['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_-]{20,}"
    ["auth_token"]="[Aa]uth[_-]?[Tt]oken['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_-]{20,}"
    ["password"]="[Pp]assword['\"]?\s*[:=]\s*['\"]?[A-Za-z0-9_@#$%^&*-]{8,}"
)

FOUND_SECRETS=false
ALLOWED_FILES=(
    "*.md"
    "*.example" 
    "*.template"
    "**/docs/**"
    "**/test/**"
    "**/__tests__/**"
)

# Function to check if file should be skipped
should_skip_file() {
    local file="$1"
    for pattern in "${ALLOWED_FILES[@]}"; do
        if [[ $file == $pattern ]]; then
            return 0
        fi
    done
    return 1
}

# Check each file passed to the hook
for file in "$@"; do
    # Skip if file doesn't exist or is in allowlist
    if [[ ! -f "$file" ]] || should_skip_file "$file"; then
        continue
    fi
    
    echo "Checking file: $file"
    
    # Check each pattern
    for pattern_name in "${!PATTERNS[@]}"; do
        pattern="${PATTERNS[$pattern_name]}"
        
        if grep -qE "$pattern" "$file"; then
            echo "❌ Potential secret detected in $file:"
            echo "   Pattern: $pattern_name"
            echo "   Context:"
            grep -nE "$pattern" "$file" | head -3 | sed 's/^/   /'
            echo ""
            FOUND_SECRETS=true
        fi
    done
done

if [ "$FOUND_SECRETS" = true ]; then
    echo ""
    echo "🚨 Secret scanning failed!"
    echo "Potential secrets were detected in your commit."
    echo ""
    echo "Next steps:"
    echo "1. Remove or replace the detected secrets"
    echo "2. Use environment variables instead"
    echo "3. Add false positives to .gitleaks.toml allowlist"
    echo "4. Run 'git add' and 'git commit' again"
    echo ""
    exit 1
fi

echo "✅ No secrets detected in staged files"
exit 0
```

#### TruffleHog Integration
**TruffleHog Configuration:**
```bash
# Create trufflehog configuration
cat > .trufflehog.yaml << 'EOF'
# Pink Auto Glass TruffleHog Configuration
detectors:
  - name: all

verify: true
concurrency: 10

# Skip paths
filters:
  - type: file
    path: ".*\\.md$"
  - type: file  
    path: ".*\\.example$"
  - type: file
    path: ".*/docs/.*"
  - type: file
    path: ".*/test/.*"

# Custom detectors for Pink Auto Glass services
custom_detectors:
  - name: supabase-service-key
    keywords:
      - eyJ
    regex:
      adjective: supabase
      noun: service key
    pattern: 'eyJ[A-Za-z0-9_/+-]*\.[A-Za-z0-9_/+-]*\.[A-Za-z0-9_/+-]*'
    verify:
      - endpoint: https://{{.Host}}/rest/v1/
        headers:
          Authorization: Bearer {{.Raw}}
        success_indicators:
          - HTTP/200
    
  - name: twilio-auth-token
    keywords:
      - twilio
      - auth_token
    regex:
      adjective: twilio
      noun: auth token  
    pattern: '[0-9a-fA-F]{32}'
    verify:
      - endpoint: https://{{.AccountSid}}:{{.Raw}}@api.twilio.com/2010-04-01/Accounts/{{.AccountSid}}.json
        success_indicators:
          - HTTP/200
EOF
```

### CI/CD Integration for Secret Scanning

#### GitHub Actions Workflow
**Secret Scanning Workflow (.github/workflows/security-scan.yml):**
```yaml
name: Security Scanning
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  secret-detection:
    name: Secret Detection
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for better scanning
          
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
        with:
          config-path: .gitleaks.toml
          
      - name: Run TruffleHog
        uses: trufflesecurity/trufflehog@v3.63.2-rc0
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified --fail
          
      - name: Custom Secret Patterns
        run: |
          chmod +x scripts/check-secrets.sh
          ./scripts/check-secrets.sh $(find . -type f -name "*.ts" -o -name "*.js" -o -name "*.json" -o -name "*.env*" | grep -v node_modules | grep -v .git)
          
      - name: Check for Hardcoded URLs
        run: |
          echo "Checking for hardcoded production URLs..."
          if grep -r "pinkautoglass\.com" --include="*.ts" --include="*.js" --exclude-dir=node_modules . ; then
            echo "❌ Hardcoded production URLs detected"
            exit 1
          fi
          echo "✅ No hardcoded production URLs found"
          
      - name: Verify Environment Variables
        run: |
          echo "Checking environment variable usage..."
          required_vars=("SUPABASE_URL" "SUPABASE_ANON_KEY" "TWILIO_ACCOUNT_SID" "STRIPE_PUBLIC_KEY")
          
          for var in "${required_vars[@]}"; do
            if ! grep -r "process\.env\.$var" --include="*.ts" --include="*.js" --exclude-dir=node_modules . > /dev/null; then
              echo "⚠️  Warning: $var not found in codebase"
            else
              echo "✅ $var properly referenced as environment variable"
            fi
          done

  dependency-security:
    name: Dependency Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run npm audit
        run: |
          echo "Running npm security audit..."
          npm audit --audit-level=high
          
      - name: Run Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=upgradable
          
  dockerfile-security:
    name: Dockerfile Security
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.modified, 'Dockerfile')
    
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        
      - name: Run Hadolint
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile
          failure-threshold: error
          
      - name: Run Docker Scout
        uses: docker/scout-action@v1
        with:
          command: cves
          image: local://pink-auto-glass:latest
          only-severities: critical,high
          exit-code: true

  notify-security-team:
    name: Notify Security Team
    runs-on: ubuntu-latest
    needs: [secret-detection, dependency-security]
    if: failure()
    
    steps:
      - name: Send Slack Alert
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#security-alerts'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow
```

#### Continuous Monitoring Workflow
**Daily Security Scan (.github/workflows/daily-security.yml):**
```yaml
name: Daily Security Monitoring
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  full-repository-scan:
    name: Full Repository Security Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Full History
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Historical Secret Scan
        run: |
          echo "Running historical secret scan..."
          gitleaks detect --source . --verbose --config .gitleaks.toml --report-format json --report-path gitleaks-report.json
          
      - name: TruffleHog Full History Scan
        run: |
          echo "Running TruffleHog on full repository history..."
          trufflehog git file://. --only-verified --json > trufflehog-report.json
          
      - name: Process Scan Results
        run: |
          python scripts/process-security-results.py
          
      - name: Upload Security Reports
        uses: actions/upload-artifact@v4
        with:
          name: security-reports-${{ github.run_number }}
          path: |
            gitleaks-report.json
            trufflehog-report.json
            security-summary.json
          retention-days: 30
          
      - name: Create Security Issue
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Security Scan Alert - ' + new Date().toISOString().split('T')[0],
              body: 'Daily security scan detected potential issues. Check the workflow run for details.',
              labels: ['security', 'urgent']
            })
```

### Block Policies for Medium/High Findings

#### Severity Classification
**Finding Severity Levels:**
```yaml
severity_levels:
  critical:
    description: "Immediate security threat requiring emergency response"
    examples:
      - "Live production API keys in public repository"
      - "Database credentials in plain text"
      - "Private keys or certificates"
    action: "BLOCK_IMMEDIATELY"
    escalation: "EMERGENCY_RESPONSE"
    
  high:
    description: "Significant security risk requiring prompt action"
    examples:
      - "Test API keys that could be used maliciously"
      - "Hardcoded URLs to production services"
      - "Sensitive configuration values"
    action: "BLOCK_DEPLOYMENT"
    escalation: "SECURITY_TEAM_REVIEW"
    
  medium:
    description: "Potential security issue requiring investigation"
    examples:
      - "Suspicious patterns that may be secrets"
      - "Weak encryption or hashing methods"
      - "Overly permissive access controls"
    action: "WARN_AND_REVIEW"
    escalation: "DEVELOPER_REVIEW"
    
  low:
    description: "Minor security concern or false positive"
    examples:
      - "Example code with placeholder secrets"
      - "Documentation containing API examples"
      - "Test fixtures with mock data"
    action: "LOG_ONLY" 
    escalation: "NONE"
```

#### Automated Blocking Logic
**GitHub Actions Block Policy Implementation:**
```yaml
# Block policy configuration in workflow
- name: Evaluate Security Findings
  id: security-evaluation
  run: |
    echo "Evaluating security scan results..."
    
    # Process gitleaks results
    CRITICAL_COUNT=$(jq '[.[] | select(.Rule | test("critical"))] | length' gitleaks-report.json)
    HIGH_COUNT=$(jq '[.[] | select(.Rule | test("high"))] | length' gitleaks-report.json)
    MEDIUM_COUNT=$(jq '[.[] | select(.Rule | test("medium"))] | length' gitleaks-report.json)
    
    echo "critical_findings=$CRITICAL_COUNT" >> $GITHUB_OUTPUT
    echo "high_findings=$HIGH_COUNT" >> $GITHUB_OUTPUT
    echo "medium_findings=$MEDIUM_COUNT" >> $GITHUB_OUTPUT
    
    # Determine action
    if [ $CRITICAL_COUNT -gt 0 ]; then
      echo "action=BLOCK_CRITICAL" >> $GITHUB_OUTPUT
      echo "severity=critical" >> $GITHUB_OUTPUT
    elif [ $HIGH_COUNT -gt 0 ]; then
      echo "action=BLOCK_HIGH" >> $GITHUB_OUTPUT
      echo "severity=high" >> $GITHUB_OUTPUT
    elif [ $MEDIUM_COUNT -gt 2 ]; then
      echo "action=BLOCK_MEDIUM_THRESHOLD" >> $GITHUB_OUTPUT
      echo "severity=medium" >> $GITHUB_OUTPUT
    else
      echo "action=ALLOW" >> $GITHUB_OUTPUT
      echo "severity=low" >> $GITHUB_OUTPUT
    fi

- name: Block Deployment on Critical/High Findings
  if: steps.security-evaluation.outputs.action != 'ALLOW'
  run: |
    echo "🚨 DEPLOYMENT BLOCKED: Security findings detected"
    echo "Severity: ${{ steps.security-evaluation.outputs.severity }}"
    echo "Critical: ${{ steps.security-evaluation.outputs.critical_findings }}"
    echo "High: ${{ steps.security-evaluation.outputs.high_findings }}"
    echo "Medium: ${{ steps.security-evaluation.outputs.medium_findings }}"
    echo ""
    echo "Resolution required before deployment can proceed."
    exit 1
```

#### Exception Management
**Security Exception Process:**
```python
# scripts/process-security-results.py
import json
import os
import sys
from datetime import datetime

class SecurityResultsProcessor:
    def __init__(self):
        self.exceptions_file = "security/exceptions.json"
        self.load_exceptions()
        
    def load_exceptions(self):
        """Load approved security exceptions"""
        try:
            with open(self.exceptions_file, 'r') as f:
                self.exceptions = json.load(f)
        except FileNotFoundError:
            self.exceptions = {"approved": [], "pending": []}
            
    def process_gitleaks_report(self, report_file):
        """Process gitleaks scan results"""
        with open(report_file, 'r') as f:
            findings = json.load(f)
            
        filtered_findings = []
        
        for finding in findings:
            # Check if finding is in approved exceptions
            if not self.is_excepted(finding):
                filtered_findings.append(finding)
                
        return filtered_findings
        
    def is_excepted(self, finding):
        """Check if finding is in approved exceptions"""
        for exception in self.exceptions["approved"]:
            if (exception["rule"] == finding["Rule"] and 
                exception["file"] == finding["File"] and
                exception["line"] == finding["StartLine"]):
                
                # Check if exception is still valid
                if datetime.now() < datetime.fromisoformat(exception["expires"]):
                    return True
                    
        return False
        
    def create_summary_report(self, findings):
        """Create summary report for security team"""
        summary = {
            "scan_date": datetime.now().isoformat(),
            "total_findings": len(findings),
            "by_severity": {
                "critical": len([f for f in findings if "critical" in f["Rule"].lower()]),
                "high": len([f for f in findings if "high" in f["Rule"].lower()]),
                "medium": len([f for f in findings if "medium" in f["Rule"].lower()]),
                "low": len([f for f in findings if "low" in f["Rule"].lower()])
            },
            "by_type": {},
            "action_required": len(findings) > 0
        }
        
        # Count by rule type
        for finding in findings:
            rule = finding["Rule"]
            summary["by_type"][rule] = summary["by_type"].get(rule, 0) + 1
            
        return summary

if __name__ == "__main__":
    processor = SecurityResultsProcessor()
    
    # Process gitleaks report
    gitleaks_findings = processor.process_gitleaks_report("gitleaks-report.json")
    
    # Create summary
    summary = processor.create_summary_report(gitleaks_findings)
    
    # Write summary report
    with open("security-summary.json", "w") as f:
        json.dump(summary, f, indent=2)
        
    # Exit with error code if critical/high findings
    if summary["by_severity"]["critical"] > 0 or summary["by_severity"]["high"] > 0:
        print(f"❌ Security scan failed: {summary['by_severity']['critical']} critical, {summary['by_severity']['high']} high findings")
        sys.exit(1)
    elif summary["by_severity"]["medium"] > 2:
        print(f"⚠️  Security scan warning: {summary['by_severity']['medium']} medium findings exceed threshold")
        sys.exit(1)
    else:
        print("✅ Security scan passed")
        sys.exit(0)
```

#### Security Exception Configuration
**Exception Management (security/exceptions.json):**
```json
{
  "approved": [
    {
      "id": "EX-001",
      "rule": "stripe-public-key",
      "file": "src/components/payment/stripe-config.ts",
      "line": 12,
      "reason": "Public key - safe to expose",
      "approved_by": "security-team@pinkautoglass.com",
      "approved_date": "2024-08-01T00:00:00Z",
      "expires": "2024-12-31T23:59:59Z",
      "review_required": false
    }
  ],
  "pending": [
    {
      "id": "EX-002", 
      "rule": "custom-api-pattern",
      "file": "docs/api-examples.md",
      "line": 45,
      "reason": "Documentation example - not real key",
      "requested_by": "developer@pinkautoglass.com",
      "requested_date": "2024-08-15T00:00:00Z",
      "status": "pending_review"
    }
  ],
  "auto_approve_rules": [
    {
      "rule": "*",
      "path_patterns": ["docs/**", "*.example", "*.template"],
      "reason": "Documentation and example files"
    },
    {
      "rule": "stripe-public-key",
      "path_patterns": ["**"],
      "reason": "Public keys are safe to expose"
    }
  ]
}
```

This comprehensive secret scanning framework ensures that Pink Auto Glass maintains strong security practices throughout the development lifecycle while providing appropriate flexibility for legitimate use cases through a managed exception process.