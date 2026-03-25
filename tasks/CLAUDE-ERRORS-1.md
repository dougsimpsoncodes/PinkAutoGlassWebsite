# Claude Code Review — GEO Satellite Site Changes (Round 1)
**Date:** 2026-03-20
**Scope:** All 23 satellite sites — schema fixes (sameAs, brand entity name) + content passage improvements

## Findings

### Error 1 (P2): sameAs links use a generic Google Maps URL, not the actual GBP place ID
- **File:** All 23 `layout.tsx` files
- **Issue:** The sameAs link `https://www.google.com/maps/place/Pink+Auto+Glass/@39.7392,-104.9903,12z` is a search-style URL, not a direct Place ID URL. Google's Knowledge Graph works better with the canonical `maps.google.com/?cid=XXXXX` format or the exact place URL from the GBP dashboard.
- **Impact:** AI engines may not reliably resolve this to the correct business entity
- **Fix:** Replace with the actual GBP place URL from Google Business Profile dashboard

### Error 2 (P2): BBB sameAs link may be incorrect — URL not verified
- **File:** All 23 `layout.tsx` files
- **Issue:** The BBB URL `https://www.bbb.org/us/co/denver/profile/auto-glass/pink-auto-glass-1296-90592451` was hardcoded but the brand mention audit showed BBB returned a `mentionFound: true` based on profile link detection, not a verified URL. If this URL is wrong (e.g., different business ID), all 23 sites point to a dead link.
- **Fix:** Verify the BBB URL resolves to the correct Pink Auto Glass profile before deploying

### Error 3 (P1): Content passages may contain HTML entities that render incorrectly
- **File:** Multiple `page.tsx` files
- **Issue:** Some replacement passages include characters like `'` (apostrophes) and `—` (em dashes) that were written as plain UTF-8 into JSX string literals. If any site's JSX was using `&apos;` or `&#39;` for apostrophes, the new content may not match the encoding convention and could cause build warnings or rendering differences.
- **Fix:** Verify rendering on a few deployed pages, check for encoding mismatches

### Error 4 (P2): Phoenix satellite sites' sameAs links point to Denver GBP
- **File:** All Phoenix `layout.tsx` files (chip-repair-mesa, chip-repair-phoenix, chip-repair-scottsdale, chip-repair-tempe, cost-phoenix, mobile-phoenix)
- **Issue:** The sameAs Google Maps URL includes `@39.7392,-104.9903` which are Denver coordinates. Phoenix sites should either use a Phoenix GBP URL or omit the coordinates.
- **Fix:** Use market-specific GBP URLs, or use a coordinate-less URL

## Verdict
**NOT YET APPROVED** — Errors 1 and 4 should be addressed before deploy (incorrect sameAs links could confuse AI entity recognition). Errors 2 and 3 need verification.
