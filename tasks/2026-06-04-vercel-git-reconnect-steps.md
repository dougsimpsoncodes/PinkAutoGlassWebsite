# Vercel Git Auto-Deploy — Reconnect Steps (9 satellite projects)

**Why this exists:** On 2026-06-04, 9 of 20 satellite Vercel projects were
discovered serving stale builds. Every `git push` to their GitHub `main`
branch succeeded, but Vercel never rebuilt — the GitHub→Vercel auto-deploy
integration was severed on these projects. They were fixed with manual
`vercel --prod` deploys, but **the integration is still broken**: the next
push to any of these 9 will NOT auto-build unless reconnected.

The other 11 satellite projects auto-deploy correctly and need no action.

---

## The 9 projects that need git reconnection

| Vercel project | Domain |
|---|---|
| windshield-replacement-fort-collins | windshieldreplacementfortcollins.com |
| windshield-chip-repair-phoenix | windshieldchiprepairphoenix.com |
| mobile-windshield-phoenix | mobilewindshieldphoenix.com |
| windshield-chip-repair-mesa | windshieldchiprepairmesa.com |
| windshield-chip-repair-tempe | windshieldchiprepairtempe.com |
| windshield-chip-repair-scottsdale | windshieldchiprepairscottsdale.com |
| new-windshield-cost | newwindshieldcost.com |
| windshield-cost-phoenix | windshieldcostphoenix.com |
| cheapest-windshield | cheapestwindshieldnearme.com |

---

## Reconnect steps (per project, in the Vercel dashboard)

For each project above:

1. Go to **vercel.com** → select the project
2. **Settings** → **Git**
3. If it shows "Connected to <repo>" but isn't deploying:
   - Click **Disconnect**, confirm
   - Click **Connect Git Repository**
   - Select the matching `dougsimpsoncodes/<repo>` repository
   - Confirm the **Production Branch** is set to `main`
4. If it shows no connection:
   - Click **Connect Git Repository** → pick `dougsimpsoncodes/<repo>` → set production branch `main`
5. After connecting, trigger one deploy to confirm: **Deployments** tab →
   **Redeploy** the latest, OR push any commit and confirm a build starts.

---

## How to verify it's fixed

After reconnecting, push a trivial commit (or use the empty-commit trick) and
confirm a new deployment appears within ~1 min:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/<project>
git commit --allow-empty -m "chore: verify auto-deploy"
git push origin main
# Then within ~60s:
vercel ls   # newest deploy should be seconds old, not days
```

---

## Quick audit script (check all 20 for stale builds anytime)

Run from `/Users/dougsimpson/clients/pink-auto-glass/sites`. Flags any live
domain whose JS bundle lacks the shared quoter — the signal that a deploy
is stale:

```bash
DOMAINS=(
  windshielddenver.com mobilewindshielddenver.com windshieldchiprepairdenver.com
  windshieldchiprepairboulder.com aurorawindshield.com coloradospringswindshield.com
  autoglasscoloradosprings.com mobilewindshieldcoloradosprings.com windshieldreplacementfortcollins.com
  windshieldchiprepairphoenix.com mobilewindshieldphoenix.com windshieldchiprepairmesa.com
  windshieldchiprepairtempe.com windshieldchiprepairscottsdale.com windshieldcostcalculator.com
  windshieldpricecompare.com newwindshieldcost.com windshieldcostphoenix.com
  newwindshieldnearme.com cheapestwindshieldnearme.com
)
for domain in "${DOMAINS[@]}"; do
  found=no
  for c in $(curl -sL --max-time 10 "https://$domain" 2>/dev/null | grep -o '/_next/static/chunks/[a-zA-Z0-9_-]*\.js[^"]*' | sort -u); do
    curl -sL --max-time 8 "https://$domain$c" 2>/dev/null | grep -q "satellite-quoter" && { found=yes; break; }
  done
  [ "$found" = yes ] && echo "OK   $domain" || echo "STALE $domain"
done
```

---

## Manual deploy fallback (if a project is stale and you need it live now)

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/sites/<project>
git checkout main && git pull
vercel --prod --yes
```

This is what was used on 2026-06-04 to fix all 9. It works regardless of
the git integration state, but it's a one-time push — it does not fix
auto-deploy for future commits. Reconnect the git integration for that.
