# Pink Auto Glass — Measurement & Attribution Execution Spec

Date: 2026-05-02
Project: /Users/dougsimpson/clients/pink-auto-glass/website
Owner: Neville

## 1) Role
Senior analytics + attribution engineer focused on Google Ads, lead tracking, and conversion-quality decision systems for a live local-services website.

## 2) Constraints
- Keep scope focused on measurement, attribution, and decision-quality fixes
- Do not introduce unrelated code churn
- Do not break the live production lead flow
- Prefer the smallest safe set of changes that materially improves trustworthiness
- No assumptions: verify current implementation before changing it

## 3) Architecture expectations
- Use the existing analytics/tracking stack already present in the repo
- Start from the known attribution remediation work already documented in `tasks/2026-04-14-attribution-remediation.md`
- Respect the live production data model and current Google/Microsoft upload flows
- Prefer shared helpers over duplicated qualification logic
- Keep canonical attribution stricter than heuristic reporting

## 4) Output format
- Implement the first high-confidence fixes directly in the codebase
- Validate with the smallest meaningful gates available (typecheck/build/targeted inspection)
- Update `PROJECT-STATE.md` with what changed and what remains
- Report back to Doug with concise results and any real blocker

## 5) Real-world context
- Live Vercel production site
- Main site only
- Denver-first business decision context
- Current business risk is optimizing spend with weak tracking and incomplete call attribution

## Communication protocol
- Keep Doug updated only on meaningful progress, blockers, or completed results
- Avoid extra planning loops; execute unless a risky or irreversible decision blocks safe progress

## Priority order
1. Measurement and attribution repair
2. Validation that hard conversions are represented correctly
3. Preserve homepage and call-first lead flow while improving trust in the data

## Definition of done for this phase
- Required spec created
- Existing measurement + attribution code paths inspected
- Highest-confidence first fixes implemented
- Validation run on changed code or a clear blocker documented
- Project state updated

## Deploy process
- Make focused code changes locally first
- Run validation gates
- Do not push or deploy to production unless Doug explicitly asks

## Requires Doug approval before proceeding
- Production deploy
- Any destructive schema/data operation beyond the already-documented remediation path
- Any external-facing messaging about the audit or its findings
