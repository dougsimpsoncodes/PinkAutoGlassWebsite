# Pink Auto Glass — Google Ads Campaign Review
## April 9, 2026 | Period: March 10 – April 9, 2026

---

## Campaign Snapshot

| Metric | Value |
|--------|-------|
| **Total Spend** | $6,421.87 |
| **Clicks** | 449 |
| **Impressions** | 10,498 |
| **CTR** | 4.28% |
| **Conversions** | 96 |
| **CPA** | $66.89 |
| **CPC** | $14.30 |

### Campaign Breakdown

| Campaign | Status | Impressions | Clicks | CTR | Conversions |
|----------|--------|-------------|--------|-----|-------------|
| Keywords (Search) | Active | majority | majority | 4.4% | majority |
| Performance Max | Paused | — | — | 2.8% | — |

---

## CRITICAL: Conversion Value Tracking Is Broken

Every conversion is recorded as **$1.00**, causing the reported ROI of **-98.51%**. This makes ROAS calculations meaningless and prevents Google's bidding AI from optimizing toward high-value conversions.

**Fix:**
1. Go to Google Ads > Goals > Conversions > Settings
2. Set the conversion value to the **average job ticket** (~$300-400 for mobile windshield replacement)
3. Or better: implement dynamic conversion values by passing actual invoice amounts via Enhanced Conversions for Leads

**Impact:** Without accurate conversion values, Google's Smart Bidding optimizes for volume of conversions, not value. A $150 chip repair and a $600 windshield replacement look identical.

---

## Performance vs Previous Review (Nov 2025)

| Metric | Nov 2025 | Apr 2026 | Trend |
|--------|----------|----------|-------|
| CTR | 2.78% | 4.28% | +54% improved |
| Conversion Rate | 15.18% | 21.4% | +41% improved |
| CPA | $59.01 | $66.89 | +13% worse |
| CPC | $9.04 | $14.30 | +58% worse |
| Monthly Spend | ~$1,000 | ~$6,422 | 6.4x increase |

**Analysis:** CTR and conversion rate both improved significantly — the negative keyword work from Nov 2025 likely helped here. However, CPC has jumped 58% ($9.04 → $14.30), which is driving up CPA despite better conversion rates. The budget increase from ~$1K to ~$6.4K/month coincides with higher CPCs, suggesting the account may be bidding more aggressively or competing on more expensive keywords.

---

## Top Converting Search Terms

| Term | Conversions | CPA | Verdict |
|------|-------------|-----|---------|
| windshield replacement castle rock | 4 | $9.86 | Excellent — protect |
| safe windshield replacement | 2 | $4.90 | Excellent — protect |
| auto glass repair aurora co | 1 | $8.33 | Good — in area |
| windshield replacement colorado | 1 | $6.00 | Good — broad but converting |
| front windshield replacement | 1 | $18.44 | Acceptable |

---

## Nov 2025 Negative Keyword Recommendations — Status Check

The Nov 2025 review recommended 297 negative keywords. **Status of implementation is unknown.** Key items that were recommended:

- [ ] Competitor brands blocked (Safelite, Tavos, Auto Glass Now, etc.)
- [ ] Out-of-area locations blocked (Cheyenne, Fort Collins, Greeley, etc.)
- [ ] Informational queries blocked ("how much", "how to", "estimate")
- [ ] Wrong service types blocked (mobile mechanics, semi truck)
- [ ] Job seekers blocked (jobs, careers, hiring)

**Action needed:** Export current negative keyword list from Google Ads and compare against the Nov 2025 recommendations to identify gaps.

---

## Performance Max Campaign

PMax is currently **paused** (status 3). Per the Google Ads strategist playbook:

- PMax requires **30+ conversions/month** and **$2K+/month budget** to function well
- The Keywords campaign currently gets 96 conversions/30 days, so the conversion threshold is met
- Budget is ~$6.4K/month, which exceeds the $2K threshold

**If restarting PMax, required safeguards:**
1. Enable "Content made for kids" exclusion
2. Apply Lunio 40K junk placement exclusion list
3. Set geo to "People IN locations" only
4. Exclude own brand terms
5. Upload customer match lists
6. Set daily budget to minimum 3x Target CPA
7. Import offline conversion data

**Recommendation:** PMax can be reconsidered after conversion value tracking is fixed and 30 days of clean data is collected. Do not restart with broken conversion values.

---

## Bidding Strategy Assessment

Current state: 96 conversions/month puts the account in **Phase 3** of the bidding progression (30+ conversions = Target CPA eligible).

| Phase | Threshold | Strategy | Status |
|-------|-----------|----------|--------|
| 1 | 0-15 conv/mo | Maximize Conversions | ✅ Passed |
| 2 | 15-30 conv/mo | Max Conv + guardrail | ✅ Passed |
| 3 | 30+ conv/mo | Target CPA | ← Current eligibility |

**Recommendation:** If not already on Target CPA, switch to it. Set Target CPA at $67 (current actual CPA), then tighten by 10% every 2 weeks if performance holds.

---

## CPC Increase Investigation

CPC increased 58% ($9.04 → $14.30). Possible causes:

1. **Market competition increased** — more auto glass advertisers in Denver metro
2. **Bidding strategy became more aggressive** — if switched to Maximize Conversions without a CPA cap
3. **Higher-value keywords added** — more competitive terms naturally cost more
4. **Budget increase triggered broader matching** — Google spends more aggressively with larger budgets

**Action:** Review the keyword-level CPC report to identify which specific keywords are driving up costs. Consider bid adjustments on keywords with CPA > $80.

---

## Action Plan

### P0 — Fix This Week
1. **Fix conversion value tracking** — set to actual average job value ($300-400) or implement dynamic values
2. **Verify Nov 2025 negatives were implemented** — export current list and compare

### P1 — This Week
3. **Review bidding strategy** — confirm Target CPA is set appropriately at ~$67
4. **Investigate CPC increase** — keyword-level CPC report, check for expensive non-converters

### P2 — After 30 Days Clean Data
5. **Evaluate PMax restart** with full safeguards
6. **Import offline conversion data** (closed deals) for better bidding optimization
7. **Set up Enhanced Conversions for Leads** for accurate ROAS

---

## Budget Efficiency: Google vs Microsoft

| Platform | Spend | Conversions* | CPA* | CTR |
|----------|-------|-------------|------|-----|
| Google Ads | $6,422 | 96 | $66.89 | 4.28% |
| Microsoft Ads | $3,577 | Unknown (tracking broken) | Unknown | 0.49% |

*Microsoft conversion data is unreliable — see Microsoft review for details.

**Google is clearly the stronger platform.** After Microsoft tracking is fixed and 30 days of clean data is collected, compare true CPAs. If Microsoft CPA > 1.5x Google CPA, reallocate budget to Google.

---

*Review by Claude + Codex | April 9, 2026*
