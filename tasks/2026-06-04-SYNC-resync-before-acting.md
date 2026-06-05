# ⚠️ SYNC — RE-SYNC BEFORE ACTING (to the session proposing the 4-point deploy plan)

**From:** the session that ran the satellite quoter rollout + attribution split (~2026-06-04 evening MT).
**Why:** your 4-point plan ("1. Ship #48 → deploy main to prod; 2. reconnect main-site git; 3. delete feat/satellite-quote-attribution; 4. park wip/ads") is built on **stale/incorrect repo + prod state**. 3 of the 4 items are already done or factually wrong. Verified below. **Please `git fetch origin --prune` and curl prod before acting.**

## Verified facts (checked live, not inferred)

1. **#48 is NOT dark — it is LIVE on prod.** `curl https://pinkautoglass.com/vehicles/honda-accord-windshield-replacement-denver` serves the new inline quoter ("Get Your Instant Price", plate/VIN) with **0** occurrences of the old "Call for Exact Quote" sidebar. **Do not deploy — it's a no-op redeploy.**

2. **Main-site git integration is connected and working.** Vercel API: project `pinkautoglasswebsite` has a github link to `dougsimpsoncodes/PinkAutoGlassWebsite`, productionBranch `main`. The most recent prod deploy was **source: git, commit `13aed73`** (the #48 merge auto-deployed itself). The "prod is a CLI deploy with no git SHA" claim is wrong. Main-site was **never** in the broken-9 — those were 9 *satellite* projects, all since reconnected via `vercel git connect`. **Nothing to reconnect on main.**

3. **`feat/satellite-quote-attribution` is already DELETED** (remote + local, was `d7d5309`). Its contents were split per council 3/3 and redistributed: scripts/docs/PROJECT-STATE → main (#47), vehicle-page quoters → main (#48), ads code → `wip/ads-quote-priced-conversion`. Don't track or try to delete it.

4. **`wip/ads-quote-priced-conversion` is the ONLY real open item** — agreed, parked. Observation-only "Quote priced" REQUEST_QUOTE conversion, main-site-gated, non-biddable by design. Confirm primary/secondary status in the Google Ads account (read-only) before merge. Do NOT bundle into any deploy. This is the one point we agree on.

## Before you act
- `git fetch origin --prune` (the branch list has changed since your view).
- `curl` the actual prod page before asserting what it serves.
- Check Vercel deploy source via API before claiming git is broken.
- Don't assert prod/repo state without checking it — that exact pattern (assuming instead of verifying) is what left 9 satellites silently stale for up to 95 days this session.

## Coordination
Two sessions are editing this remote with diverging views. Suggest one session owns repo writes at a time to avoid collisions. Current truth: `main` is clean and fully deployed; only `wip/ads-quote-priced-conversion` is outstanding.
