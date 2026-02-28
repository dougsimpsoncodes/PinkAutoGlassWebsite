# /setup-satellite — Satellite Domain Setup Automation

Fully automated setup for a new national satellite domain. Takes a domain name and sets up DNS, Vercel hosting, GitHub repo, GSC verification, and main site config.

## Arguments

$ARGUMENTS = the domain name (e.g., `carglassprices.com`)

## Instructions

You are setting up a new **national** satellite site for Pink Auto Glass. Follow every step below in order. Do NOT skip steps. If any step fails, STOP and report the error — do not continue.

### 0. Parse Arguments

Extract from `$ARGUMENTS`:
- `DOMAIN` — the full domain (e.g., `carglassprices.com`)
- `SLD` — second-level domain (e.g., `carglassprices`)
- `TLD` — top-level domain (e.g., `com`)
- `UTM_SOURCE` — same as SLD with no dots (e.g., `carglassprices`)
- `SITE_DIR` — `/Users/dougsimpson/.openclaw/workspace/${SLD}`
- `REPO_NAME` — kebab-case version of SLD (replace dots with hyphens if any, e.g., `car-glass-prices`)

Derive a human-readable label from the domain:
- `LABEL` — title-case the SLD split on hyphens/camelCase (e.g., `carglassprices` → `Car Glass Prices`)
- `DASHBOARD_LABEL` — short version for sidebar (e.g., `Car Glass Prices` → keep it under 20 chars)

Print all derived values and ask the user to confirm before proceeding.

### 1. Point DNS to Vercel (Namecheap API)

```bash
# Set A record for @ and CNAME for www
# Requires: export NAMECHEAP_API_KEY="your-key" (read from .env.local)
curl -s "https://api.namecheap.com/xml.response?ApiUser=dougiefreshcodes&ApiKey=${NAMECHEAP_API_KEY}&UserName=dougiefreshcodes&Command=namecheap.domains.dns.setHosts&ClientIp=68.231.21.72&SLD=${SLD}&TLD=${TLD}&HostName1=@&RecordType1=A&Address1=76.76.21.21&TTL1=300&HostName2=www&RecordType2=CNAME&Address2=cname.vercel-dns.com.&TTL2=300"
```

Verify the response XML contains `<ApiResponse Status="OK">`. If not, stop and report the error.

### 2. Add Domain to Vercel

```bash
vercel domains add ${DOMAIN} --scope dougsimpsoncodes-projects
```

If the domain is already added, that's fine — continue.

### 3. Clone Template Repo

The template is the `car-windshield-prices` repo. Clone it as the new site:

```bash
# Copy the template directory (exclude node_modules and .next)
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' \
  /Users/dougsimpson/.openclaw/workspace/car-windshield-prices/ \
  ${SITE_DIR}/
```

### 4. Initialize Git and Create GitHub Repo

```bash
cd ${SITE_DIR}
git init
git add -A
git commit -m "Initial satellite site from car-windshield-prices template"

# Create GitHub repo and push
gh repo create dougsimpsoncodes/${REPO_NAME} --private --source=. --push
```

### 5. Find-and-Replace Domain References

In the new site directory, replace all references to the template domain with the new domain. Use sed or the Edit tool:

**Exact replacements (order matters — do longer strings first):**

1. `carwindshieldprices.com` → `${DOMAIN}` (all files in src/)
2. `carwindshieldprices` → `${UTM_SOURCE}` (all files in src/ — this is the UTM source slug)

**Do NOT do a blind replace on "Car Windshield Prices" display names yet** — those are content-specific and need the user to decide the site's display name. Print what the current display name is and ask what it should be changed to, then replace:
3. `Car Windshield Prices` → `${DISPLAY_NAME}` (Header, Footer, layout.tsx)
4. `Car Windshield Prices` → `${DISPLAY_NAME}` (in blog pages — only if user wants uniform branding)

Also update:
- `src/app/api/lead/route.ts` line 10: `utmSource: '${UTM_SOURCE}'`
- `src/app/robots.ts`: sitemap URL
- `src/app/sitemap.ts`: baseUrl
- `src/app/layout.tsx`: metadataBase, all Open Graph URLs, schema.org URLs
- `.vercel/project.json`: DELETE this file — Vercel will create a new one on first deploy

### 6. Create Vercel Project and Deploy

```bash
cd ${SITE_DIR}

# Remove old Vercel project config
rm -f .vercel/project.json

# Link to new Vercel project
vercel link --yes

# Add the domain to the Vercel project
vercel domains add ${DOMAIN}

# Deploy
vercel --prod
```

If `vercel link` doesn't work non-interactively, create `.vercel/project.json` manually — check the Vercel dashboard or use `vercel projects ls` to find the project ID after creation.

### 7. Install Dependencies and Verify Build

```bash
cd ${SITE_DIR}
npm install
npm run build
```

Fix any build errors before deploying.

### 8. Update Main Site Config (3 files)

In the **main Pink Auto Glass site** (`/Users/dougsimpson/.openclaw/workspace/PinkAutoGlassWebsite/`):

**File 1: `src/app/api/admin/satellite-domains/route.ts`**
Add to the `SATELLITE_DOMAINS` array in the `// ── National ──` section:
```typescript
{ domain: '${DOMAIN}', utmSource: '${UTM_SOURCE}', label: '${DASHBOARD_LABEL}', color: '<pick a unique hex color>' },
```
Pick a color that doesn't conflict with existing entries. Use a shade of blue/teal/cyan for national sites.

**File 2: `src/app/api/lead/route.ts`**
Add `'${UTM_SOURCE}'` to the `NATIONAL_SOURCES` array (around line 247):
```typescript
const NATIONAL_SOURCES = ['carwindshieldprices', 'windshieldrepairprices', '${UTM_SOURCE}'];
```

**File 3: `src/app/api/admin/external-leads/route.ts`**
Add `'${UTM_SOURCE}'` to the `.in('utm_source', [...])` array (around line 30):
```typescript
.in('utm_source', ['carwindshieldprices', 'windshieldrepairprices', '${UTM_SOURCE}'])
```

### 9. GSC Verification

Verify the new domain using the OAuth2 refresh token (has `webmasters` + `siteverification` scopes).

Use this Python script to get the verification token, add it to DNS, and verify:

```python
python3 << 'PYEOF'
import json, urllib.request, urllib.parse, time

DOMAIN = "${DOMAIN}"
SLD = "${SLD}"
TLD = "${TLD}"

# OAuth2 credentials (read from .env.local)
import os
client_id = os.environ.get('GOOGLE_CLIENT_ID') or "[REDACTED]"
client_secret = os.environ.get('GOOGLE_CLIENT_SECRET') or "[REDACTED]"
refresh_token = os.environ.get('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN') or "[REDACTED]"

# Step 1: Get access token
data = urllib.parse.urlencode({
    'client_id': client_id, 'client_secret': client_secret,
    'refresh_token': refresh_token, 'grant_type': 'refresh_token'
}).encode()
resp = json.loads(urllib.request.urlopen(urllib.request.Request('https://oauth2.googleapis.com/token', data=data)).read())
access_token = resp['access_token']

# Step 2: Get verification token
body = json.dumps({
    "site": {"type": "INET_DOMAIN", "identifier": DOMAIN},
    "verificationMethod": "DNS_TXT"
}).encode()
req = urllib.request.Request('https://www.googleapis.com/siteVerification/v1/token',
    data=body, headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'})
token_resp = json.loads(urllib.request.urlopen(req).read())
txt_token = token_resp['token']
print(f"Verification token: {txt_token}")

# Step 3: Add TXT record to Namecheap (URL-encode the token value)
encoded_token = urllib.parse.quote(txt_token, safe='')
namecheap_api_key = os.environ.get('NAMECHEAP_API_KEY') or "[REDACTED]"
nc_url = f"https://api.namecheap.com/xml.response?ApiUser=dougiefreshcodes&ApiKey={namecheap_api_key}&UserName=dougiefreshcodes&Command=namecheap.domains.dns.setHosts&ClientIp=68.231.21.72&SLD={SLD}&TLD={TLD}&HostName1=@&RecordType1=A&Address1=76.76.21.21&TTL1=300&HostName2=www&RecordType2=CNAME&Address2=cname.vercel-dns.com.&TTL2=300&HostName3=@&RecordType3=TXT&Address3={encoded_token}&TTL3=300"
nc_resp = urllib.request.urlopen(nc_url).read().decode()
assert 'IsSuccess="true"' in nc_resp, f"Namecheap failed: {nc_resp}"
print("DNS TXT record added")

# Step 4: Wait for propagation then verify
print("Waiting 30s for DNS propagation...")
time.sleep(30)
body = json.dumps({"site": {"type": "INET_DOMAIN", "identifier": DOMAIN}}).encode()
req = urllib.request.Request(
    'https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=DNS_TXT',
    data=body, headers={'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'})
try:
    verify_resp = json.loads(urllib.request.urlopen(req).read())
    print(f"VERIFIED: {json.dumps(verify_resp, indent=2)}")
except urllib.error.HTTPError as e:
    print(f"Verification failed ({e.code}), waiting 60s and retrying...")
    time.sleep(60)
    try:
        verify_resp = json.loads(urllib.request.urlopen(req).read())
        print(f"VERIFIED: {json.dumps(verify_resp, indent=2)}")
    except urllib.error.HTTPError as e2:
        print(f"FAILED: {e2.code} {e2.read().decode()}")
PYEOF
```

### 10. Submit Sitemap to GSC

After verification succeeds, submit the sitemap using the same OAuth2 token:

```python
python3 << 'PYEOF'
import json, urllib.request, urllib.parse

DOMAIN = "${DOMAIN}"
import os
client_id = os.environ.get('GOOGLE_CLIENT_ID') or "[REDACTED]"
client_secret = os.environ.get('GOOGLE_CLIENT_SECRET') or "[REDACTED]"
refresh_token = os.environ.get('GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN') or "[REDACTED]"

data = urllib.parse.urlencode({
    'client_id': client_id, 'client_secret': client_secret,
    'refresh_token': refresh_token, 'grant_type': 'refresh_token'
}).encode()
resp = json.loads(urllib.request.urlopen(urllib.request.Request('https://oauth2.googleapis.com/token', data=data)).read())
access_token = resp['access_token']

site_url = urllib.parse.quote(f'sc-domain:{DOMAIN}', safe='')
sitemap_url = urllib.parse.quote(f'https://{DOMAIN}/sitemap.xml', safe='')
url = f'https://www.googleapis.com/webmasters/v3/sites/{site_url}/sitemaps/{sitemap_url}'
req = urllib.request.Request(url, method='PUT', headers={
    'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'
}, data=b'')
resp = urllib.request.urlopen(req)
print(f'Sitemap submitted (HTTP {resp.status})')
PYEOF
```

### 11. Commit Main Site Changes

In the main Pink Auto Glass site, commit the config changes:

```bash
cd /Users/dougsimpson/.openclaw/workspace/PinkAutoGlassWebsite
git add src/app/api/admin/satellite-domains/route.ts \
        src/app/api/lead/route.ts \
        src/app/api/admin/external-leads/route.ts
git commit -m "Add ${DOMAIN} satellite site to tracking config"
```

Do NOT push unless the user asks.

### 12. Summary Report

Print a summary:
```
Satellite Site Setup Complete
==============================
Domain:      ${DOMAIN}
UTM Source:  ${UTM_SOURCE}
GitHub Repo: github.com/dougsimpsoncodes/${REPO_NAME}
Site Dir:    ${SITE_DIR}
GSC:         Verified ✓ / Failed ✗
Sitemap:     Submitted ✓ / Failed ✗

Main site config updated:
- satellite-domains/route.ts ✓
- lead/route.ts (NATIONAL_SOURCES) ✓
- external-leads/route.ts ✓

Next steps:
- Customize content/blog posts for the new domain's keyword focus
- Verify site loads at https://${DOMAIN}
- Push main site changes when ready
```
