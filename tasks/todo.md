# FAQ / AEO Rollout — All Satellite Sites + Main Site

## Goal
Add thorough, AI-crawlable FAQ sections to every satellite site and pinkautoglass.com.
Target: ChatGPT, Perplexity, Google AI Overviews all cite Pink Auto Glass for auto glass questions.

## The Plan

### Phase 1: Create reusable FAQ component + content bank
- [x] 1. Create `FAQSection.tsx` component — renders visible Q&A with `<h2>`/`<h3>`/`<p>` + inline FAQPage JSON-LD schema
- [x] 2. Build FAQ content bank (28 Q&As) organized by tier (universal / state-specific / city-specific)
- [x] 3. Create FAQ sets mapped to each satellite type

### Phase 2: Roll out to satellite sites (batch by type)
- [x] 4. National sites (3): carwindshieldprices, windshieldrepairprices, carglassprices
- [x] 5. Phoenix chip repair (4): phoenix, scottsdale, mesa, tempe
- [x] 6. Phoenix other (2): windshieldcostphoenix, mobilewindshieldphoenix
- [x] 7. Denver sites (6): windshield-denver, chip-repair-denver, chip-repair-boulder, aurora, mobile-denver
- [x] 8. Remaining national/cost (5): windshield-cost-calculator, cheapest-windshield, new-windshield-cost, get-windshield-quote, new-windshield-near-me, windshield-price-compare

### Phase 3: Main site
- [x] 9. Add FAQ to pinkautoglass.com emergency-windshield-repair (only service page missing FAQ)
- [x] 10. Phoenix landing page already had FAQ — no change needed

### Phase 4: Validate
- [ ] 11. Deploy all satellites and run Google Rich Results Test
- [ ] 12. Test with ChatGPT/Perplexity to verify citation

## Review (Feb 28, 2026)

### What changed
- Created `FAQSection.tsx` reusable component (renders visible FAQ + FAQPage JSON-LD)
- Deployed to all 20 satellite site repos
- Added 8-9 localized FAQ items per site using 3-tier content system:
  - Tier 1 (universal): repair vs replace, ADAS, OEM vs aftermarket, warranty
  - Tier 2 (state-specific): CO law CRS 10-4-613, AZ zero-deductible, hail/heat/monsoon
  - Tier 3 (city/neighborhood): Scottsdale (Old Town, DC Ranch), Mesa (Superstition Springs), Tempe (ASU, Kyrene), Boulder (Pearl Street), Aurora (Southlands, I-225), etc.
- Removed stale schema-only FAQPage from layout.tsx on sites that had it (phoenix, scottsdale, mesa, tempe chip repair sites + windshield-repair-prices)
- Added 8-question FAQ + JSON-LD to pinkautoglass.com/services/emergency-windshield-repair (was the only service page missing FAQ)

### Sites modified (14 new FAQ sections added)
windshield-chip-repair-phoenix, windshield-chip-repair-scottsdale, windshield-chip-repair-mesa, windshield-chip-repair-tempe, mobile-windshield-phoenix, windshield-denver, windshield-chip-repair-denver, windshield-chip-repair-boulder, aurora-windshield, mobile-windshield-denver, windshield-repair-prices, cheapest-windshield, new-windshield-near-me, windshield-price-compare

### Sites with component added (FAQ already existed)
car-windshield-prices, car-glass-prices, windshield-cost-phoenix, windshield-cost-calculator, new-windshield-cost, get-windshield-quote

### Build verification
- pinkautoglass.com: clean build ✓
- windshield-chip-repair-phoenix: clean build ✓
- windshield-denver: clean build ✓
- cheapest-windshield: clean build ✓

### Remaining
- Deploy all 20 satellites + main site to Vercel
- Validate FAQPage schema with Google Rich Results Test
- Monitor AI citation in ChatGPT/Perplexity over next 2-4 weeks
