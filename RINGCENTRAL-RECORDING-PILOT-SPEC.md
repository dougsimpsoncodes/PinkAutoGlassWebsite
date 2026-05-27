# RINGCENTRAL-RECORDING-PILOT-SPEC.md

## Objective
Run a small, high-confidence pilot to learn which call traits correlate with closed revenue vs leads that did not close for Pink Auto Glass.

## Locked Scope
- **Market:** Denver / Colorado only
- **Sample size:** 20 calls
- **Mix:** 10 won + 10 lost
- **Recency window:** last 45–60 days
- **Inputs:** recording audio + transcript + lead/outcome metadata
- **Output:** structured findings, not productized software

## 1) Role
- Senior GTM / conversation-intelligence analyst with enough engineering ability to safely extract recordings, transcribe them locally, and join them to lead + invoice outcomes.

## 2) Constraints
- Sensitive customer audio and PII: keep the pilot local/private.
- Prefer **existing project capabilities** over new product code.
- Smallest viable workflow first; no broad admin/dashboard build yet.
- Outcome labeling quality matters more than sample volume.
- Do not label a call "lost" just because it is still `new` unless it has aged out past a conservative waiting window and still has no revenue / invoice evidence.
- No external delivery of customer audio/transcripts without Doug explicitly approving it.

## 3) Architecture Expectations
Use the code and data paths that already exist:
- **Recording fetch:** `src/app/api/admin/recording/[id]/route.ts`
- **Call source:** `ringcentral_calls`
- **Lead linkage:** `leads` (`first_contact_method = 'call'`, `phone_e164`, `status`, `revenue_amount`, `session_id`)
- **Revenue/install evidence:** `omega_installs`
- **Market classification:** `src/lib/market.ts` via `classifyCallMarket(to_number)`

Pilot should be run as an **offline analyst workflow**, not a feature launch:
1. Select candidate calls from DB
2. Fetch audio via existing recording route or direct authenticated script
3. Transcribe locally with Whisper
4. Score against a fixed rubric
5. Summarize patterns separating won vs lost

## 4) Output Format
Deliverables for the pilot:
1. `pilot-call-cohort.csv` — 20 selected calls with outcome labels + metadata
2. `pilot-transcripts/` — local transcript files per call
3. `pilot-scorecard.csv` — rubric scores per call
4. `pilot-findings.md` — concise synthesis:
   - strongest differentiators between won vs lost
   - example quotes/snippets
   - recommended scripting/process changes
   - confidence limits / caveats

## 5) Real-World Context
- Pink Auto Glass is call-heavy; phone leads are the dominant lead source.
- Denver is the active market to study first.
- Existing data supports recording access and call/lead/invoice joins.
- Live evidence check on 2026-05-02 found enough pilot volume:
  - `456` Denver inbound recorded calls in the last 60 days
  - `69` Denver unique-phone won candidates with recorded calls
  - `137` Denver unique-phone lost candidates if defined conservatively as aged 21+ days with no revenue/invoice evidence
- Current call-lead statuses are sparse (`new` vs `completed` dominates), so the loss definition must be explicit and conservative.

## Pilot Labeling Rules
### Won
A call qualifies as **won** if all of the following are true:
- Denver market call
- Inbound recorded call
- Matching call-originated lead by phone
- At least one strong close signal:
  - `leads.status = 'completed'`, or
  - `leads.revenue_amount > 0`, or
  - matching `omega_installs` invoice/install evidence by phone

### Lost
A call qualifies as **lost** only if all of the following are true:
- Denver market call
- Inbound recorded call
- Matching call-originated lead by phone
- Call is at least **21 days old**
- No `completed` status
- No `revenue_amount`
- No matching `omega_installs` invoice/install evidence by phone

### Exclusions
Exclude:
- Calls without recordings
- Outbound calls
- Arizona calls
- Calls with ambiguous market or duplicate outcome evidence
- Very recent unresolved leads
- Repeat calls from the same customer after the first qualifying call selected for the cohort

## Selection Rules
- Pull a candidate pool from the last 60 days.
- Deduplicate by caller phone so one customer does not dominate the pilot.
- Prefer the **earliest qualifying call** per customer for analysis.
- Randomize within each bucket after eligibility filtering, then spot-check for label sanity.
- If any selected lost call looks operationally unresolved rather than truly lost, replace it.

## Transcription Approach
- Use local Whisper CLI (`whisper`) for privacy.
- Save text transcripts locally under project artifacts.
- Start with `--model medium` unless speed becomes a blocker.
- If RingCentral returns compressed audio formats, normalize with `ffmpeg` only as needed.

## Analysis Rubric
Score each call on a 1–5 or yes/no basis:
1. **Answer speed / first impression**
2. **Empathy / rapport**
3. **Control of call flow**
4. **Insurance-explanation clarity**
5. **Price / deductible confidence**
6. **Trust signals used** (mobile service, insurance handling, warranty, timing)
7. **Objection handling quality**
8. **Scheduling attempt made**
9. **Clear next step secured**
10. **Caller intent strength** (weak / medium / high)
11. **Competitor shopping signals**
12. **Operational friction** (hold time, confusion, dropped baton, missing info)

Also capture freeform notes for:
- memorable phrases that seem to help close
- phrases that create doubt or drag
- common loss patterns

## Communication Protocol
- Report back after cohort selection before bulk transcription if the labels look shaky.
- Report back again after first 3 won + 3 lost calls if the rubric needs adjustment.
- Final report should be plain English, business-facing, and include exact next actions.

## Priority Order
1. Confirm clean cohort selection logic
2. Generate the 20-call cohort
3. Transcribe locally
4. Score and synthesize patterns
5. Recommend operational changes

## Definition of Done
The pilot is done when:
- 20 calls are selected with defensible won/lost labels
- all 20 are transcribed locally
- each call is scored against the rubric
- a findings memo identifies repeatable close-vs-loss patterns
- next-step recommendations are concrete enough to test in operations

## Deploy Process
- **No production deploy is required for this pilot** if the workflow stays offline.
- If we later decide to add admin tooling or automation, that becomes a separate scoped build with separate approval.

## Requires Doug Approval Before Proceeding
- Sending audio or transcripts to any external API/service
- Building new production UI or database-backed workflow for this pilot
- Expanding beyond the 20-call Denver pilot
- Sharing raw customer call content outside the immediate working environment

## Recommended First Execution Path
1. Build a one-off local selection script using current Supabase data.
2. Export the 10 won + 10 lost cohort to CSV.
3. Download/fetch recordings using existing RingCentral auth path.
4. Transcribe locally with Whisper.
5. Score manually in a structured CSV first.
6. Only after the pilot proves value, decide whether automation/UI is worth building.
