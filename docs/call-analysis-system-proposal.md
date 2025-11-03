# Call Analysis System Proposal
## Auto-Detection of Sales from Call Recordings

---

## Project Context

### Business Overview
Pink Auto Glass is a mobile auto glass repair and replacement service operating in Denver, Colorado. The business handles customer inquiries and bookings primarily via phone calls through RingCentral.

### Current Technology Stack
- **Framework**: Next.js 14 (React, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Call Management**: RingCentral API
  - Call logs synced to Supabase
  - Call recordings available via API
  - ~100 calls per month volume
- **AI/ML**: Anthropic Claude SDK already integrated
- **Hosting**: Vercel

### Existing Infrastructure
The application already has:
1. **RingCentral Integration**
   - Automated sync of call data to `ringcentral_calls` table
   - Call recording playback functionality via `/api/admin/recording/[id]`
   - Fields: call_id, start_time, duration, direction, from/to numbers, result, recording_id

2. **Admin Dashboard**
   - Call analytics page showing all calls
   - Filters by date range, inbound/outbound, answered/missed
   - Performance metrics (answer rate, avg duration)
   - CSV export functionality

3. **Authentication**
   - HTTP Basic Auth for admin routes
   - RingCentral JWT authentication working

---

## The Challenge

### Business Need
**Goal**: Automatically determine if a phone call resulted in a sale (quote accepted) and capture the dollar amount of the quote.

### Current Pain Points
1. **Manual Review**: Staff must listen to recordings manually to determine outcomes
2. **No Revenue Tracking**: Cannot easily track which calls generated revenue
3. **Missing Analytics**: No visibility into conversion rates or average deal size
4. **Time-Consuming**: Reviewing 100 calls/month manually takes significant time

### Success Criteria
A successful solution should:
- ✅ Accurately detect when a quote was accepted (yes/no)
- ✅ Extract the dollar amount of accepted quotes
- ✅ Run automatically without manual intervention
- ✅ Be cost-effective (~$10/month or less)
- ✅ Provide results viewable in the admin dashboard
- ✅ Handle ~100 calls per month volume

---

## Proposed Solution

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NIGHTLY BATCH PROCESS                     │
│                    (Vercel Cron - 2 AM)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Query Supabase for Unanalyzed Calls                      │
│    SELECT * FROM ringcentral_calls                           │
│    WHERE recording_id IS NOT NULL                            │
│    AND analyzed_at IS NULL                                   │
│    LIMIT 50                                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. For Each Call:                                            │
│    - Authenticate with RingCentral (JWT)                     │
│    - Download recording (MP3)                                │
│    - Store in memory buffer                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Transcribe Audio                                          │
│    OpenAI Whisper API:                                       │
│    POST /v1/audio/transcriptions                             │
│    - Model: whisper-1                                        │
│    - Response format: text                                   │
│    - Language: en                                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Analyze Transcript with Claude                            │
│    Anthropic Claude 3.5 Sonnet:                              │
│    - Input: Full transcript text                             │
│    - Prompt: Analyze for quote acceptance                    │
│    - Output: Structured JSON response                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Parse and Store Results                                   │
│    UPDATE ringcentral_calls SET                              │
│      transcription = '...',                                  │
│      sale_made = true/false,                                 │
│      quote_amount = 450.00,                                  │
│      analysis_confidence = 'high',                           │
│      analyzed_at = NOW()                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Display in Admin Dashboard                                │
│    - New "Sales" column with ✅/❌                           │
│    - Quote amount displayed                                  │
│    - Filter: "Closed Sales Only"                             │
│    - Revenue metrics widget                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation Details

### 1. Database Schema Changes

**New Columns for `ringcentral_calls` Table:**

```sql
ALTER TABLE ringcentral_calls ADD COLUMN IF NOT EXISTS
  transcription TEXT,
  sale_made BOOLEAN DEFAULT NULL,
  quote_amount DECIMAL(10,2) DEFAULT NULL,
  analysis_confidence VARCHAR(20) DEFAULT NULL,
  analysis_notes TEXT DEFAULT NULL,
  analyzed_at TIMESTAMP DEFAULT NULL;

-- Index for performance
CREATE INDEX idx_analyzed_calls ON ringcentral_calls(analyzed_at, sale_made);
```

**Purpose of Each Field:**
- `transcription`: Full text transcript from Whisper API
- `sale_made`: Boolean flag indicating if quote was accepted
- `quote_amount`: Dollar amount of the accepted quote
- `analysis_confidence`: 'high', 'medium', 'low' based on Claude's confidence
- `analysis_notes`: Additional context (e.g., "Customer requested callback")
- `analyzed_at`: Timestamp when analysis completed (NULL = not analyzed yet)

---

### 2. OpenAI Whisper Integration

**API Endpoint:** `https://api.openai.com/v1/audio/transcriptions`

**Request Format:**
```typescript
const formData = new FormData();
formData.append('file', audioBuffer, 'recording.mp3');
formData.append('model', 'whisper-1');
formData.append('language', 'en');
formData.append('response_format', 'text');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: formData
});

const transcript = await response.text();
```

**Pricing:**
- $0.006 per minute
- Average call: 3 minutes
- 100 calls/month: **~$2/month**

**Accuracy:**
- 90%+ for clear audio
- Handles background noise reasonably well
- Phone quality audio is well-supported

---

### 3. Claude AI Analysis

**Prompt Engineering Strategy:**

```typescript
const analysisPrompt = `You are analyzing a phone call transcript for Pink Auto Glass,
a mobile auto glass repair service.

TRANSCRIPT:
${transcript}

TASK:
Analyze this call and determine:
1. Was a quote/price given to the customer?
2. Did the customer accept the quote?
3. What was the dollar amount quoted?

RULES:
- A "sale" means the customer explicitly agreed to the quote/service
- Words indicating acceptance: "yes", "okay", "let's do it", "book it", "schedule"
- Words indicating rejection: "no", "too expensive", "let me think", "call back later"
- If unsure, mark confidence as "low"

RESPOND IN THIS EXACT JSON FORMAT:
{
  "sale_made": true/false,
  "quote_amount": 450.00,
  "confidence": "high/medium/low",
  "reasoning": "Customer agreed to $450 windshield replacement and scheduled for Tuesday"
}

If no quote was discussed or call was unrelated to service, respond:
{
  "sale_made": false,
  "quote_amount": null,
  "confidence": "high",
  "reasoning": "Call was about business hours inquiry, no quote given"
}`;
```

**Model:** Claude 3.5 Sonnet
- **Cost:** ~$3 per million input tokens, ~$15 per million output tokens
- **Estimated:** 100 calls × ~500 tokens avg = **~$2-3/month**
- **Benefits:**
  - Already integrated in project
  - Excellent at instruction following
  - Good with ambiguous language
  - Can explain reasoning

---

### 4. Cron Job Implementation

**Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/analyze-calls",
    "schedule": "0 2 * * *"
  }]
}
```

**API Route:** `/api/cron/analyze-calls`

**Process Flow:**
1. Verify cron secret header (security)
2. Query unanalyzed calls (LIMIT 50 per run)
3. Process each call sequentially:
   - Fetch recording from RingCentral
   - Transcribe with Whisper
   - Analyze with Claude
   - Update database
4. Log results and errors
5. Send summary email to admin (optional)

**Error Handling:**
- Retry failed calls on next run (analyzed_at remains NULL)
- Log errors to separate table for debugging
- Alert if >10 consecutive failures

---

### 5. Admin Dashboard Enhancements

**New Features:**

**A. Sales Column in Calls Table**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
  {call.analyzed_at ? (
    call.sale_made ? (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-semibold text-green-800">
          ${call.quote_amount?.toFixed(2)}
        </span>
      </div>
    ) : (
      <XCircle className="w-5 h-5 text-gray-400" />
    )
  ) : (
    <span className="text-xs text-gray-400">Pending</span>
  )}
</td>
```

**B. Revenue Metrics Widget**
- Total Revenue (sum of quote_amount where sale_made = true)
- Conversion Rate (sales / total analyzed calls)
- Average Deal Size (avg quote_amount where sale_made = true)
- Trend chart (sales over time)

**C. New Filters**
- "Closed Sales Only"
- "Quoted but Not Sold"
- "Pending Analysis"

**D. Manual Analysis Trigger**
- Button to analyze a single call immediately
- Useful for urgent/important calls
- Bypasses nightly batch

---

## Cost Analysis

### Monthly Operational Costs

| Service | Usage | Cost/Unit | Monthly Cost |
|---------|-------|-----------|--------------|
| OpenAI Whisper | 100 calls × 3 min avg | $0.006/min | **$1.80** |
| Claude 3.5 Sonnet | 100 calls × 500 tokens | $3/$15 per 1M | **$2.50** |
| Vercel Cron | Daily job | Free tier | **$0.00** |
| Supabase Storage | Minimal text data | Free tier | **$0.00** |
| RingCentral API | Existing usage | No change | **$0.00** |

**Total Estimated Cost: $4.30/month**

### Scalability

If call volume increases:

| Volume | Whisper | Claude | Total/Month |
|--------|---------|--------|-------------|
| 100 calls | $1.80 | $2.50 | **$4.30** |
| 500 calls | $9.00 | $12.50 | **$21.50** |
| 1,000 calls | $18.00 | $25.00 | **$43.00** |

---

## Alternative Approaches Considered

### ❌ Option 1: Real-Time Processing
**Pros:** Instant results
**Cons:** Higher costs (always-on infrastructure), complex webhook setup, wasted processing on spam calls
**Verdict:** Overkill for 100 calls/month

### ❌ Option 2: Manual On-Demand Analysis
**Pros:** Lower costs, only analyze important calls
**Cons:** Requires manual intervention, defeats purpose of automation
**Verdict:** Doesn't solve the core problem

### ❌ Option 3: Custom Fine-Tuned Model
**Pros:** Potentially more accurate
**Cons:** Requires training data (hundreds of labeled calls), expensive, complex maintenance
**Verdict:** Not justified for current volume

### ✅ Option 4: Nightly Batch + Claude (CHOSEN)
**Pros:** Automated, cost-effective, leverages existing tools, scalable
**Cons:** Results delayed until next morning
**Verdict:** Best balance of automation, cost, and accuracy

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Transcription errors on poor audio | Medium | Medium | Store transcription for manual review; confidence scoring |
| Claude misinterprets context | Low | High | Detailed prompts; human review of low-confidence results |
| API rate limits hit | Low | Low | Batch processing with delays; handle 429 errors gracefully |
| Cron job fails silently | Low | Medium | Logging + monitoring; email alerts on repeated failures |
| Cost overruns | Very Low | Low | Hard limits on API usage; alerts at 80% of budget |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positives (marking non-sales as sales) | Low | Medium | Confidence scoring; manual review dashboard |
| False negatives (missing actual sales) | Low | High | Keep original recordings; staff spot-checks |
| Privacy concerns (storing transcripts) | Low | Medium | Secure database; retention policy; data encryption |

---

## Success Metrics

### Primary KPIs
1. **Accuracy Rate**: >90% correct sale detection (verified by spot-checking)
2. **Processing Rate**: >95% of recordings analyzed within 24 hours
3. **Cost Efficiency**: <$10/month operational costs
4. **Time Savings**: Reduce manual review time by >80%

### Secondary Metrics
1. Conversion rate by time of day
2. Average deal size trends
3. Correlation between call duration and sales
4. Staff efficiency improvements

---

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Database schema migration
- [ ] OpenAI API integration and testing
- [ ] Claude analysis prompt development
- [ ] Unit tests for transcription + analysis

### Phase 2: Automation (Week 2)
- [ ] Cron job implementation
- [ ] Error handling and logging
- [ ] Batch processing logic
- [ ] Testing with historical recordings

### Phase 3: Dashboard (Week 3)
- [ ] UI updates for sales display
- [ ] Revenue metrics widgets
- [ ] Filters and search
- [ ] Manual analysis trigger

### Phase 4: Validation (Week 4)
- [ ] Process 50 historical calls
- [ ] Manual verification of results
- [ ] Prompt tuning based on accuracy
- [ ] Documentation and training

---

## Open Questions for Review

1. **Prompt Engineering**: Is the Claude prompt detailed enough? Should we include example transcripts in the prompt?

2. **Confidence Scoring**: How should we handle "medium" or "low" confidence results? Auto-flag for manual review?

3. **Partial Quotes**: What if multiple quotes are given in one call? Should we capture all or just the final accepted one?

4. **Follow-up Calls**: If a customer calls back to accept a previously declined quote, how do we link them?

5. **Data Retention**: How long should we keep transcriptions? Privacy implications?

6. **Edge Cases**:
   - Customer accepts quote but later cancels?
   - Multiple services quoted in one call?
   - Quote given but scheduling deferred?

7. **Testing Strategy**: Should we manually label 20-30 calls first to validate accuracy before full rollout?

8. **API Key Management**: Need to add `OPENAI_API_KEY` to environment variables. Any security concerns?

9. **Scalability**: If this works well, should we design for real-time processing from the start?

10. **Reporting**: What additional analytics would be valuable? (e.g., reasons for quote rejection, objections handled)

---

## Appendix: Example Analysis

### Sample Call Transcript
```
Agent: "Thank you for calling Pink Auto Glass, this is Sarah. How can I help you today?"

Customer: "Hi, I have a crack in my windshield that I need fixed."

Agent: "I'd be happy to help with that. Can you tell me the make and model of your vehicle?"

Customer: "It's a 2019 Honda Accord."

Agent: "Perfect. And where is the crack located on the windshield?"

Customer: "It's on the passenger side, about 6 inches long."

Agent: "Okay, for a crack that size, we'd need to do a full windshield replacement.
For your Honda Accord, the replacement would be $450, and we can come to your location.
We have availability tomorrow afternoon or Wednesday morning."

Customer: "That sounds good. Let's do tomorrow afternoon."

Agent: "Great! I'll schedule you for tomorrow at 2 PM. Can I get your address?"

Customer: "Sure, it's 1234 Main Street, Denver."

Agent: "Perfect, we'll see you tomorrow at 2 PM. You'll receive a confirmation text shortly."
```

### Expected Analysis Output
```json
{
  "sale_made": true,
  "quote_amount": 450.00,
  "confidence": "high",
  "reasoning": "Customer was quoted $450 for windshield replacement and explicitly agreed with 'That sounds good. Let's do tomorrow afternoon.' Appointment was scheduled, indicating clear acceptance."
}
```

---

## Conclusion

This proposal outlines a fully automated, cost-effective solution for detecting sales and capturing quote amounts from call recordings. By leveraging existing infrastructure (RingCentral, Supabase, Claude) and adding OpenAI Whisper for transcription, we can deliver actionable sales intelligence for under $5/month.

The nightly batch processing approach balances automation with cost efficiency, while the confidence scoring system allows for human oversight of ambiguous cases.

**Recommendation**: Proceed with implementation, starting with a 2-week pilot on historical calls to validate accuracy before enabling production automation.
