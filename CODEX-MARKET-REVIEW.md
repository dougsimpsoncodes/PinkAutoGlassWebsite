# Codex Market Filter Review

## Findings

1. `market_type` is not a per-market fallback, so the plan overstates what that column can do.
   `MARKET-FILTER-PLAN.md:35` suggests falling back to `market_type`, but `market_type` is only `in_market | out_of_market`, not `colorado | arizona`. Existing code confirms that both write paths collapse Denver and Phoenix into the same bucket: [src/app/api/lead/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/lead/route.ts#L16) and [src/app/api/admin/external-leads/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/external-leads/route.ts#L7). If Phase 1 relies on `market_type` for filtering, Arizona and Colorado leads will bleed together.

2. The plan introduces a second source of truth for satellite-market mapping.
   `MARKET-FILTER-PLAN.md:74` defines hard-coded `DENVER_SATELLITE_SOURCES` and `PHOENIX_SATELLITE_SOURCES`, while the existing canonical mapping already lives in [src/app/api/admin/satellite-domains/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/satellite-domains/route.ts#L10). Those two lists will drift unless they are generated from one shared module. The drift risk is already visible because the route distinguishes Phoenix, National, and Colorado Springs/Fort Collins, while the proposed helper collapses those Colorado outliers into “Denver/CO”.

3. Campaign-name filtering is too brittle to support spend and ROI without an explicit “unknown/shared” policy.
   The plan says to classify spend from campaign names with substring matches and notes “or split 50/50 — TBD” at `MARKET-FILTER-PLAN.md:47`. That is not just an enhancement; it changes totals. Current metrics code only selects `cost`, not `campaign_name`, in [src/lib/metricsBuilder.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/lib/metricsBuilder.ts#L224), so Phase 1 must change the query shape and define what happens to campaigns like brand, national, mixed-city, or abbreviation-heavy names. Without that, filtered spend will be silently incomplete and ROI comparisons will be misleading.

4. Gross revenue by market will undercount unless unmatched installs are handled explicitly.
   The plan assumes `omega_installs -> matched_lead_id -> leads.state` is sufficient at `MARKET-FILTER-PLAN.md:49`, but current revenue logic is a straight sum over invoices in [src/lib/metricsBuilder.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/lib/metricsBuilder.ts#L439). Some installs can still be unmatched or matched late. Once the dashboard filters to a market, those unmatched invoices will disappear from both Colorado and Arizona while still appearing in “All”, so totals will stop reconciling unless the API exposes an unattributed revenue bucket or documents that filtered gross revenue is only matched revenue.

5. Traffic and click-event market assignment is currently underspecified and will bias Colorado upward.
   The plan’s rule at `MARKET-FILTER-PLAN.md:55` is effectively “Phoenix path/source => Arizona, otherwise Colorado”. Current metrics code counts all sessions, page views, and conversion events with no market awareness in [src/lib/metricsBuilder.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/lib/metricsBuilder.ts#L456) and [src/lib/metricsBuilder.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/lib/metricsBuilder.ts#L479). Defaulting every non-Phoenix visit to Colorado will misclassify national pages, direct traffic, and any future markets. A null or `unknown` market bucket is needed if the market toggle is supposed to reconcile cleanly.

6. Exact string matching on phone numbers is fragile.
   The plan treats `to_number === '+17209187465'` and `to_number === '+14807127465'` as definitive at `MARKET-FILTER-PLAN.md:39`. RingCentral sync currently stores whatever `record.to?.phoneNumber` returns in [src/app/api/admin/sync/ringcentral/route.ts](/Users/dougsimpson/clients/pink-auto-glass/website/src/app/api/admin/sync/ringcentral/route.ts#L166). If formatting varies between E.164, raw 10-digit, or punctuated strings, market filters on calls will silently miss rows. The classifier should normalize numbers before comparison.

## Recommendation

Phase 1 is reasonable if it stays conservative: classify leads by `state/zip/utm_source`, classify calls by normalized `to_number`, classify spend by campaign name but leave unmatched campaigns out of market-specific totals, and document that traffic/click-events plus unmatched invoice revenue are still all-market until dedicated classifiers exist.
