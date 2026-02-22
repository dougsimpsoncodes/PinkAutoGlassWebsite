# AI Search Optimization - 6 Enhancements

## Plan

- [x] 1. Create `/llms.txt` route at `src/app/llms.txt/route.ts` (plain text response)
- [x] 2. Add 5 AI crawler rules to `src/app/robots.ts` (OAI-SearchBot, ClaudeBot, Claude-SearchBot, Bytespider, meta-externalagent)
- [x] 3. Add SpeakableSpecification schema to top 3 service pages + blog post template
- [x] 4. Add visible `<time>` timestamps to service pages + blog posts
- [x] 5. Semantic HTML5 — wrap service page content in `<article>`, ensure `<section>` usage (blog already had `<article>`)
- [x] 6. Add "answer-first" summary paragraphs after H1 on top 3 service pages

## Files Modified
- `src/app/llms.txt/route.ts` (NEW)
- `src/app/robots.ts`
- `src/app/services/windshield-replacement/page.tsx`
- `src/app/services/insurance-claims/page.tsx`
- `src/app/services/windshield-repair/page.tsx`
- `src/app/blog/[slug]/page.tsx`

## Build
- [x] `npm run build` — passed, 232 pages generated, zero errors

## Review (Feb 22, 2026)

### Task 1: /llms.txt
Created `src/app/llms.txt/route.ts` returning plain text with business info, services, area, pages, and contact.

### Task 2: robots.ts AI crawlers
Added 5 new rules: OAI-SearchBot, ClaudeBot, Claude-SearchBot, Bytespider, meta-externalagent. All existing rules preserved.

### Task 3: SpeakableSpecification
- Service pages: Added WebPage schema with SpeakableSpecification to the combined schema graph
- Blog posts: Added speakable property directly to the Article schema object
- All use cssSelector targeting `.answer-first` and `h1`

### Task 4: Visible timestamps
- Service pages: Added `<time dateTime="2026-02-22">Updated February 22, 2026</time>` after breadcrumbs
- Blog posts: Wrapped existing date display in `<time>` element with dateTime attribute and "Published" prefix

### Task 5: Semantic HTML5
- Service pages: Changed outermost `<div>` to `<article>`, all content sections already used `<section>`
- Blog posts: Already used `<article>` tag, no change needed

### Task 6: Answer-first content blocks
Added ~150-word answer-first paragraphs (with className="answer-first") inside the hero sections of:
- Windshield replacement: covers cost range, $0 deductible law, OEM glass, mobile service, ADAS calibration
- Insurance claims: covers process, zero-deductible law CRS 10-4-613, accepted insurers, no rate increase
- Windshield repair: covers 30-minute service, insurance coverage, mobile service, resin process, lifetime warranty
- Blog posts: Added answer-first class to the excerpt paragraph
