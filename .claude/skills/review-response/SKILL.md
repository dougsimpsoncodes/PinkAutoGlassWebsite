# /review-response — Pink Auto Glass Google Review Response Drafter

Drafts a personalized Google Business Profile response to a customer review, using the documented PAG template + the actual customer record from `omega_installs` (the invoice/installs table — primary source for completed jobs).

## Arguments

`$ARGUMENTS` = the raw pasted Google review. Accept whatever format the user pastes:
- Just a name and the review text
- Full Google output with "Local Guide", "N reviews", star count, time stamp, review body
- A name and star rating only

Parse what you can find. The **reviewer first+last name** and the **review text body** are required; the **star rating** is optional but changes the template branch.

## Inputs the user may optionally add

- `--phone +1XXXXXXXXXX` — force phone lookup (most reliable when name is ambiguous)
- `--no-log` — skip the audit log append

**Copy to clipboard is always on.** The whole point of this skill is to produce a draft the user can immediately paste into Google Business Profile — if the draft isn't on the clipboard, the skill failed. Do not add a `--no-copy` flag. Do not ask the user "want me to copy it?" — always copy, always report that it was copied.

## Instructions

### 0. Parse the review

Extract from `$ARGUMENTS`:
- `REVIEWER_NAME` — first + last (e.g., "Julia McKenzie")
- `STAR_RATING` — 1-5 if visible, else assume 5 (positive) if the review text is clearly positive
- `REVIEW_TEXT` — the actual review body
- `REVIEWER_PHONE` — if present (rare)

If you cannot find a reviewer name, stop and ask the user.

### 1. Look up the customer

Run the helper:

```bash
cd /Users/dougsimpson/clients/pink-auto-glass/website/.claude/skills/review-response
python3 find_customer.py "REVIEWER_NAME"
# Or if phone is available:
python3 find_customer.py "REVIEWER_NAME" --phone REVIEWER_PHONE
```

The helper queries `omega_installs` (primary — completed jobs with full vehicle, address, and invoice line items) and falls back to `leads` by phone. It returns JSON with:
- `match_source`, `match_confidence`
- `first_name`, `vehicle_year`, `vehicle_make`, `vehicle_model`, `service_type` (repair|replacement)
- `city`, `state`, `raw_address`
- `install_date`, `phone`, `total_revenue`
- `alternatives_count`, `alternatives` (if multiple matches)

**Handle the result:**

| Result | Action |
|---|---|
| `match_source: "omega_installs"`, `alternatives_count: 1` | Use the record. Proceed. |
| `match_source: "omega_installs"`, `alternatives_count > 1` | Show alternatives to the user, ask which one. Don't auto-pick. |
| `match_source: "leads_by_phone"` | Data may be incomplete (phone-only lead). Flag to user; proceed with what you have. |
| `match_source: "none"` | No match. Offer the generic fallback template (no vehicle/city). Tell the user so they can verify manually. |

### 2. Draft the response

**Before you draft:** read the last ~10 entries from `review_responses_drafted.jsonl` so you can see recent phrasing and deliberately avoid reusing it. Every response should feel hand-written, not templated.

```bash
tail -10 /Users/dougsimpson/clients/pink-auto-glass/website/.claude/skills/review-response/review_responses_drafted.jsonl | python3 -c "import json,sys; [print('- ' + json.loads(l)['draft_response']) for l in sys.stdin if l.strip()]"
```

#### Positive branch (4-5 stars)

**Required facts — every positive response MUST include all three, in natural prose:**

1. **Customer first name** (placement is flexible: opener, vocative, or mid-sentence)
2. **Vehicle year + make + model** (e.g., "your 2015 Chrysler 200", "the 2014 Ford Escape", "that 2024 Nissan Ariya")
3. **City name** (e.g., "in Aurora", "out to Denver", "Highlands Ranch drivers", "serving Golden")

**Everything else varies.** Each response is a fresh composition — not a template with slots. Do not ship the same opening, same closing, or same cadence two drafts in a row.

**Rules for variation:**
- **No recurring tail phrase.** Specifically BANNED as a rote closer:
  - `"We appreciate you choosing Pink Auto Glass for your auto glass needs in {CITY} — we're here anytime you need us!"`
  - `"Thanks for choosing Pink Auto Glass — we're here anytime you need us!"`
  - Any near-identical reuse of "we're here anytime you need us" more than once per 5 drafts
- **Vary openings.** Rotate through forms like: `Thank you, {Name}!` / `{Name}, thank you!` / `Thanks so much, {Name}!` / `{Name} — this made our day.` / `We really appreciate the kind words, {Name}!` / `Huge thanks, {Name}!` / `{Name}, you're the best — thanks!`
- **Vary closings.** Examples: `Grateful you chose us.` / `Drive safe out there!` / `It was a pleasure.` / `Looking forward to the next time you need us.` / `You know where to find us.` / `Always a call away.` / `Happy you're back on the road.` / `Cheers from the Pink Auto Glass team.` / `Safe travels.`
- **Vary sentence structure and length.** Some responses are two short sentences. Some are one longer warm paragraph. Some lead with the customer's name in direct address; others lead with a thank you. **Match the energy of the review** — a rave review gets effusive energy; a terse review gets a compact, warm reply.
- **Mirror the reviewer's actual words** when they give you something quotable — that's the single most effective personalization technique. If Devon said "professional and exactly on time," those exact phrases should echo back. If Julia said "timely and effortlessly," use that phrase verbatim. Reviewers notice this; it signals you actually read what they wrote.
- **Name PAG employees when the reviewer did.** If the review calls out "Eric came to my house" or "Dan followed up," mention that person by name in the response. This rewards employees and feels personal to the customer.
- **Service vocabulary.** Use natural variants based on `service_type` AND the review text:
  - Replacement: "windshield replacement", "new windshield", "got the new glass in", "replaced the windshield"
  - Mobile replacement (reviewer mentioned "came out", "at my home", "mobile"): "mobile windshield replacement", "came out to you", "brought the shop to your driveway"
  - Repair: "windshield repair", "chip repair", "took care of that chip"
- **Never invent facts.** If `city` is null from the helper, drop the city reference entirely; do not substitute "Colorado" or guess. Same for vehicle.

**Gold-standard variation examples** (same customer Julia McKenzie, 2015 Chrysler 200, Aurora, mobile replacement — all five are acceptable; no two should ever ship in a row):

1. `Thank you, Julia! We're so glad our team made it out to you in Aurora the very next day and wrapped up the 2015 Chrysler 200 windshield replacement timely and effortlessly. Grateful you chose Pink Auto Glass!`

2. `Julia — this made our day! Getting a mobile replacement booked and done on a 2015 Chrysler 200 the next day is exactly what our Aurora customers deserve. Thanks so much for the kind words.`

3. `Thanks for the review, Julia! Happy to hear the mobile windshield job on your 2015 Chrysler 200 went smoothly — we love saving Aurora drivers a trip to the shop. Always a call away!`

4. `Julia, thank you! Nothing beats hearing that the team got out to Aurora fast and had your 2015 Chrysler 200 buttoned up without any hassle. Cheers from everyone at Pink Auto Glass.`

5. `Really appreciate you taking the time, Julia! Glad our mobile team could handle the 2015 Chrysler 200 replacement at your place in Aurora — next-day turnaround is what we shoot for. Drive safe out there.`

Notice each one: (a) includes first name, (b) includes 2015 Chrysler 200, (c) includes Aurora, (d) mentions the service, (e) has completely different structure, opener, and closer. That's the target.

#### Negative branch (1-3 stars)

Keep it disciplined. Small variations are fine, but the core message — acknowledge, own the gap, give the phone number, commit to making it right — stays constant:

> {FIRST}, we're sorry to hear about your experience. This isn't the standard we hold ourselves to. Please call us at (720) 918-7465 so we can make this right. We want every customer to be completely satisfied.

Do NOT try to be clever with negative reviews. Do NOT mention the vehicle or city (feels tone-deaf — "glad you're in Aurora" lands wrong when the customer is frustrated). Minor varied openings are OK (e.g., "{FIRST}, thank you for the feedback — and we're sorry..."), but the phone number, the apology, and the commitment to make it right must all be present.

#### No-match fallback (any rating)

If `find_customer.py` returned `match_source: "none"`, you cannot include vehicle or city — do NOT fabricate either. Use a warm, short, non-specific response, and VARY it the same way as the positive branch. Examples:

- `Thank you, {FIRST}! Really appreciate you taking the time to share your experience with Pink Auto Glass.`
- `{FIRST}, thanks so much for the kind words — means a lot to our team!`
- `Huge thanks, {FIRST}! We're glad you had a great experience with us.`

Tell the user: "No customer match found in omega_installs or leads. Drafted a generic response (no vehicle/city since I won't fabricate those) — please verify the reviewer's name before posting in case this is a legitimate customer we failed to match."

**Negative branch (1-3 stars):**

Template (verbatim, minimal variation):

> {FIRST}, we're sorry to hear about your experience. This isn't the standard we hold ourselves to. Please call us at (720) 918-7465 so we can make this right. We want every customer to be completely satisfied.

Do NOT try to be clever with negative reviews. Stick to the script. Do not mention the vehicle or the city (those are SEO boosts for positive reviews; on negative reviews they read as tone-deaf).

**No-match fallback (any rating):**

If `find_customer.py` returned `match_source: "none"`, use a warm generic response with no vehicle or city specifics:

> Thank you, {FIRST}! We really appreciate you taking the time to share your experience. Thanks for choosing Pink Auto Glass — we're here anytime you need us!

Tell the user: "No customer match found in omega_installs or leads. Drafted a generic response — verify the name before posting in case this is a legitimate customer we failed to match."

### 3. Copy to clipboard (MANDATORY — never skip this step)

```bash
printf '%s' "DRAFT_RESPONSE" | pbcopy
pbpaste  # verify clipboard contents echo back correctly
```

**Rules:**
- Use `printf '%s'`, NEVER `echo` — `echo` adds a trailing newline that corrupts the paste (see the project `CLAUDE.md` rule about echo corruption in .env files; same problem applies here).
- Always verify with `pbpaste` in the same step so the user sees the exact bytes that landed on the clipboard.
- If the draft contains single quotes or special characters, use a HEREDOC or Python one-liner to avoid shell escaping bugs:
  ```bash
  python3 -c "import subprocess; subprocess.run(['pbcopy'], input='DRAFT', text=True)"
  ```
- This step runs **on every single invocation** of the skill, regardless of match quality, no-match fallbacks, or negative-review branches. The user's next physical action after the skill completes is ⌘V into the GBP reply box — if the clipboard doesn't contain the draft, the skill has failed its primary job.

### 4. Log the draft (audit trail)

Append one JSON line to `review_responses_drafted.jsonl`:

```bash
python3 -c "
import json, datetime
entry = {
  'drafted_at': datetime.datetime.now().isoformat(),
  'reviewer_name': 'REVIEWER_NAME',
  'star_rating': STAR_RATING,
  'match_source': 'omega_installs|leads_by_phone|none',
  'customer_first_name': 'FIRST',
  'vehicle': 'YEAR MAKE MODEL',
  'service_type': 'repair|replacement|unknown',
  'city': 'CITY',
  'review_text': 'REVIEW_TEXT',
  'draft_response': 'DRAFT_RESPONSE',
}
with open('/Users/dougsimpson/clients/pink-auto-glass/website/.claude/skills/review-response/review_responses_drafted.jsonl','a') as f:
  f.write(json.dumps(entry) + '\n')
"
```

This closes the "we don't track which reviews we've responded to" gap. The log accumulates forever — the user can grep it to see past responses, confirm a given review was already drafted, or audit tone/consistency.

### 5. Report to the user

Output format:

```
Customer: {FIRST} {LAST} — {YEAR} {MAKE} {MODEL}, {SERVICE_TYPE}, {CITY}
Source: {match_source} ({match_confidence})
Install date: {install_date}
Total revenue: ${total_revenue}

Draft (📋 copied to clipboard — ready to paste into GBP):
─────────
{DRAFT_RESPONSE}
─────────

✅ Logged to review_responses_drafted.jsonl
```

Explicitly state "copied to clipboard" in the output so the user knows they can immediately ⌘V into Google Business Profile. If there were alternatives or caveats, show them in a short section above the draft.

## Known gotchas (important)

- **Phone leads have no name in the `leads` table.** When a customer calls in rather than filling out the web form, the `leads` row is created with only a phone number (no first/last name, vehicle, or address). The full customer data only appears in `omega_installs` after the install is invoiced. **Always query `omega_installs` first**, not `leads`. The helper already does this — don't second-guess it.

- **USPS "city" ≠ community "city".** Some PAG service-area addresses have USPS cities that differ from the community residents identify with (e.g., Highlands Ranch homes are USPS-addressed "Littleton"). Take the parsed city at face value — don't overengineer a ZIP→city override map. The review is getting posted either way.

- **Never fabricate a vehicle or city.** If the helper returned `null` for any field, say so explicitly in the draft or fall back to the no-match template. Fabricated specifics look fine in draft but get caught the moment a customer reads it.

- **Don't auto-post.** This skill only drafts and copies. Posting into GBP is manual (the user pastes). Responses are public and permanent — never bypass the human verification step.

## Regression tests (run after editing this skill or find_customer.py)

Known-good cases to re-verify:

```bash
python3 find_customer.py "Chad Allen"
# Expected: 2014 Ford Escape, service_type=replacement, omega match, phone +12039075837

python3 find_customer.py "Julia McKenzie"
# Expected: 2015 Chrysler 200, service_type=replacement, Aurora CO, omega match, phone +17202751618
```

If either regression case stops matching, stop and investigate before shipping.
