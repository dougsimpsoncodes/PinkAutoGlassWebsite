# Arizona Launch Page Fix Spec

Date: 2026-04-28

Goal
- Make the two Arizona paid-traffic landing pages launch-clean for the paused Phoenix search campaign.
- Fix only:
  - `src/app/arizona/services/windshield-replacement/page.tsx`
  - `src/app/arizona/services/insurance-claims/arizona/page.tsx`

Why this is needed
- `windshield-replacement` still has heavy Denver/Colorado bleed.
- `insurance-claims/arizona` is Arizona-themed but has broken copy, missing statute labels, and awkward/probably corrupted phrasing.

Verified issues
1. Windshield replacement page
- Metadata still says `CO & AZ`
- FAQ and body mention Denver/Colorado/Front Range repeatedly
- Hero says `Professional Windshield Replacement in Denver`
- Service schema areaServed is Denver/Colorado cities
- Sidebar/service-area links are Colorado links
- Messaging overweights ADAS and repair context vs paid-launch replacement intent

2. Arizona insurance page
- Copy corruption like `Under,`, `is Arizona's`, `under?`, `| |`, empty law labels
- Legal sections are inconsistent with the cleaner Phoenix page wording already in repo
- Needs simpler replacement-support framing for paid traffic

Locked product/launch constraints
- Replacement-first
- Insurance supports replacement
- Remove Denver/Colorado bleed
- No repair-led paid messaging
- No ADAS-led paid messaging
- No new dependencies
- Do not enable the Google Ads campaign yet
- Nancy leads; Codex + Gemini review before and after implementation

Implementation approach
1. Windshield replacement page
- Treat this as a focused page rewrite, not a term-swap cleanup
- Rewrite metadata, schema, hero, FAQ, breadcrumb UI, and service-area content for Arizona/Phoenix reality
- Keep page focused on: same-day mobile replacement, OEM-quality glass, lifetime warranty, insurance help, Phoenix heat/road debris realities, and launch-city relevance
- Keep ADAS/calibration mention only as a supporting detail, not a lead section or repeated selling point
- Remove or replace any Colorado links, Denver vehicle references, Front Range service blocks, and generic related-service outputs that push repair or ADAS
- If `ServiceAreaLinks` is kept, force `market="arizona"`
- Fix any in-file Arizona funnel leakage: generic `/services/...` breadcrumbs where Arizona paths are more appropriate, and any hard-coded non-Arizona internal links

2. Arizona insurance page
- Proofread and simplify all corrupted copy
- Restore explicit statute labels and align phrasing with the cleaner Arizona wording already used in `src/app/phoenix/page.tsx`, without blindly copying any broader claim that weakens legal precision
- Keep page centered on replacement claim help, coverage verification, right-to-choose, mobile service, and direct insurer handling
- Reduce repair/chip language to a minor supporting note at most
- Fix breadcrumb/internal-link leakage and remove any Colorado-related or off-strategy related links
- Make it read like a lead page, not a statute dump

Verification
- Search changed files for: `Denver`, `Colorado`, `Front Range`, obvious corrupted fragments, and generic `/services/` breadcrumb leakage where Arizona paths should exist
- Run lint on the touched files/project
- Inspect diff for scope discipline
- Then run Codex + Gemini live diff review

Definition of done
- Both Arizona pages read cleanly for Phoenix paid traffic
- No Denver/Colorado bleed remains in the targeted files
- Insurance page copy is grammatically clean and internally consistent
- Messaging fits the approved campaign structure: replacement first, insurance support second
