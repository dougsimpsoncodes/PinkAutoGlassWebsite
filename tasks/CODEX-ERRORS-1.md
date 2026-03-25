# Codex Review — GEO Satellite Site Changes (Round 1)
**Date:** 2026-03-20
**Scope:** windshield-chip-repair-denver (representative), car-windshield-prices (representative)

## Findings

### Error 1 (P2): Duplicate AutoRepair nodes with contradictory priceRange
- **File:** layout.tsx (17 sites)
- **Issue:** sameAs injection regex replaced `"priceRange": "$$"` with `"priceRange": "$"` due to `$` being a regex special character in the replacement string. This created contradictory priceRange values between the two AutoRepair schema blocks.
- **Status:** FIXED — restored `$$` across all 17 affected sites

### Error 2 (P2): Contradictory repairability guidance on homepage
- **File:** page.tsx (Denver chip repair)
- **Issue:** New passage said "damage smaller than a quarter" but FAQ said "cracks shorter than 6 inches." Both are true for different damage types but the wording appeared contradictory.
- **Status:** FIXED — updated to "chips smaller than a quarter and cracks shorter than 6 inches"

### Car Windshield Prices: No issues found
- Codex verdict: "I did not find a clear functional or schema-validity regression."
