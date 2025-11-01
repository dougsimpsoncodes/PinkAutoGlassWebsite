# World-Class Reporting Tool - Implementation Plan
## Pink Auto Glass Analytics Enhancement

---

## Executive Summary

This plan transforms Pink Auto Glass's analytics from basic tracking into a world-class reporting system that provides complete visibility into the customer acquisition funnel - from first touch to final conversion.

**Goal**: Answer 4 critical business questions:
1. **How are we finding people?** (Outbound marketing efforts)
2. **How do people find us?** (Inbound traffic sources & attribution)
3. **What do they do once they interact?** (User behavior & journey)
4. **How do we increase conversions?** (Optimization insights & ROI)

---

## Current State Analysis

### ✅ What's Working Well

**Website Analytics (Supabase)**
- Real-time tracking of page views, sessions, and conversions
- UTM parameter capture for attribution
- Conversion event tracking (phone clicks, text clicks, form submits)
- User session journey tracking
- Device/browser/location data

**Google Ads Integration**
- Manual CSV upload for search terms analysis
- AI-powered optimization recommendations
- Identification of high-converting keywords
- Wasted spend detection
- Competitor search analysis

**Notification System**
- RingCentral SMS outbound notifications
- Email notifications via Resend
- Admin alerts for new leads

### ❌ Critical Gaps

1. **No Call Tracking**
   - Can't track which marketing source drove phone calls
   - No call duration, recording, or outcome tracking
   - Missing ~40-60% of conversions (most auto glass leads call)

2. **Siloed Data Sources**
   - Google Ads data not connected to website analytics
   - Phone calls not attributed to marketing source
   - Can't calculate true ROI per channel

3. **No Unified Customer Journey**
   - Can't see: Google Ad → Website Visit → Phone Call
   - No multi-touch attribution
   - Can't identify highest-value customer paths

4. **Limited Optimization Insights**
   - No predictive analytics
   - No A/B test tracking
   - No cohort analysis
   - No customer lifetime value calculations

5. **Manual Data Management**
   - Google Ads data requires manual CSV upload
   - No automated reporting
   - No scheduled insights delivery

---

## World-Class Reporting Architecture

### Phase 1: RingCentral Call Tracking Integration (HIGH PRIORITY)

**Why First?** Phone calls are your primary conversion type. Without call tracking, you're blind to 40-60% of your conversions.

#### Implementation Steps

**1.1 Create Call Tracking Database Tables**

```sql
-- Call tracking tables
CREATE TABLE public.phone_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Call details
    call_id TEXT UNIQUE NOT NULL, -- RingCentral call ID
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,

    -- Call metadata
    duration INTEGER, -- seconds
    recording_url TEXT,
    transcription TEXT,
    call_result TEXT, -- 'answered', 'voicemail', 'missed', 'busy'

    -- Attribution (matched to session)
    session_id TEXT, -- Link to user_sessions table
    visitor_id TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Customer data
    customer_name TEXT,
    customer_email TEXT,
    lead_quality TEXT, -- 'hot', 'warm', 'cold', 'spam'

    -- Business outcome
    quote_value NUMERIC,
    converted_to_sale BOOLEAN DEFAULT false,
    appointment_scheduled BOOLEAN DEFAULT false,

    -- Location
    caller_city TEXT,
    caller_state TEXT
);

CREATE TABLE public.sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Message details
    message_id TEXT UNIQUE NOT NULL,
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    message_body TEXT,

    -- Attribution
    session_id TEXT,
    visitor_id TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Conversation threading
    conversation_id TEXT,

    -- Business outcome
    lead_quality TEXT,
    converted_to_sale BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_calls_created_at ON public.phone_calls(created_at DESC);
CREATE INDEX idx_calls_session_id ON public.phone_calls(session_id);
CREATE INDEX idx_calls_utm_source ON public.phone_calls(utm_source, utm_medium);
CREATE INDEX idx_calls_call_result ON public.phone_calls(call_result);

CREATE INDEX idx_sms_created_at ON public.sms_messages(created_at DESC);
CREATE INDEX idx_sms_session_id ON public.sms_messages(session_id);
CREATE INDEX idx_sms_conversation_id ON public.sms_messages(conversation_id);
```

**1.2 Build RingCentral Webhook Handler**

Create API endpoint to receive real-time call notifications:

```typescript
// /api/webhooks/ringcentral/route.ts
export async function POST(req: NextRequest) {
  // 1. Verify webhook signature
  // 2. Parse incoming call data
  // 3. Match caller's phone number to recent sessions (last 30 days)
  // 4. If match found, copy UTM params to call record
  // 5. Store call in database
  // 6. Send admin notification
}
```

**1.3 Create Call Tracking Dashboard**

New dashboard page: `/admin/dashboard/calls`

**Key Metrics:**
- Total calls (inbound/outbound)
- Average call duration
- Call-to-conversion rate
- Calls by traffic source
- Call recordings & transcriptions
- Lead quality distribution

---

### Phase 2: Google Ads Automated Integration

**Why?** Eliminate manual CSV uploads. Get real-time ad performance data.

#### Implementation Steps

**2.1 Set Up Google Ads API**

- Use Google Ads API v16
- Authenticate with OAuth 2.0
- Schedule hourly sync of campaign data

**2.2 Create Google Ads Database Tables**

```sql
CREATE TABLE public.google_ads_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_date DATE NOT NULL,

    -- Campaign details
    campaign_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    campaign_status TEXT,

    -- Performance metrics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    conversions INTEGER DEFAULT 0,

    -- Calculated metrics
    ctr NUMERIC, -- click-through rate
    cpc NUMERIC, -- cost per click
    cpa NUMERIC, -- cost per acquisition

    UNIQUE(sync_date, campaign_id)
);

CREATE TABLE public.google_ads_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_date DATE NOT NULL,

    -- Keyword details
    keyword_id TEXT NOT NULL,
    keyword_text TEXT NOT NULL,
    match_type TEXT, -- 'exact', 'phrase', 'broad'
    campaign_id TEXT NOT NULL,

    -- Performance
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    conversions INTEGER DEFAULT 0,

    -- Quality metrics
    quality_score INTEGER,
    avg_position NUMERIC,

    UNIQUE(sync_date, keyword_id)
);

CREATE TABLE public.google_ads_search_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_date DATE NOT NULL,

    -- Search term (what user actually typed)
    search_term TEXT NOT NULL,
    matched_keyword TEXT NOT NULL,
    campaign_id TEXT NOT NULL,

    -- Performance
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    conversions INTEGER DEFAULT 0,

    UNIQUE(sync_date, search_term, matched_keyword)
);
```

**2.3 Build Automated Sync**

```typescript
// /api/cron/sync-google-ads/route.ts
export async function GET(req: NextRequest) {
  // 1. Authenticate with Google Ads API
  // 2. Fetch yesterday's campaign data
  // 3. Fetch keyword performance
  // 4. Fetch search terms report
  // 5. Store in database
  // 6. Trigger AI analysis for new recommendations
}
```

**2.4 Enhanced Google Ads Dashboard**

Improvements to `/admin/dashboard/google-ads`:
- Real-time campaign performance (no CSV upload needed)
- Historical trend charts
- Automated daily recommendations
- Budget pacing alerts
- Competitor activity tracking

---

### Phase 3: Unified Attribution & Customer Journey

**Why?** Connect all touchpoints to understand the complete customer path.

#### Implementation Steps

**3.1 Build Attribution Engine**

```sql
CREATE TABLE public.attribution_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Customer identifier
    visitor_id TEXT NOT NULL,
    session_id TEXT NOT NULL,

    -- First touch attribution
    first_touch_source TEXT,
    first_touch_medium TEXT,
    first_touch_campaign TEXT,
    first_touch_date TIMESTAMPTZ,

    -- Last touch attribution
    last_touch_source TEXT,
    last_touch_medium TEXT,
    last_touch_campaign TEXT,
    last_touch_date TIMESTAMPTZ,

    -- Journey timeline (JSONB for flexibility)
    touchpoints JSONB, -- Array of all interactions

    -- Conversion details
    converted BOOLEAN DEFAULT false,
    conversion_type TEXT, -- 'phone', 'text', 'form', 'online_booking'
    conversion_value NUMERIC,
    days_to_convert INTEGER,
    touchpoint_count INTEGER,

    -- Customer outcome
    appointment_scheduled BOOLEAN DEFAULT false,
    service_completed BOOLEAN DEFAULT false,
    revenue NUMERIC
);
```

**Example touchpoints JSONB structure:**
```json
[
  {
    "timestamp": "2025-10-30T10:00:00Z",
    "type": "google_ad_click",
    "source": "google",
    "campaign": "windshield-repair-colorado",
    "cost": 3.50
  },
  {
    "timestamp": "2025-10-30T10:05:00Z",
    "type": "page_view",
    "page": "/",
    "duration": 45
  },
  {
    "timestamp": "2025-10-30T10:07:00Z",
    "type": "phone_call",
    "duration": 180,
    "result": "answered"
  },
  {
    "timestamp": "2025-10-30T14:30:00Z",
    "type": "appointment_scheduled",
    "service": "windshield_replacement",
    "value": 350
  }
]
```

**3.2 Create Customer Journey Dashboard**

New page: `/admin/dashboard/journeys`

**Features:**
- Visual funnel (Ad Click → Site Visit → Engagement → Conversion)
- Top converting paths
- Drop-off analysis (where do people leave?)
- Multi-touch attribution models (first-touch, last-touch, linear, time-decay)
- Customer journey timeline for individual users

**3.3 Build Journey Matching Logic**

```typescript
// /lib/analytics/attribution.ts
export async function linkConversionToJourney(conversion: {
  type: 'phone' | 'text' | 'form',
  timestamp: Date,
  identifier: string, // phone number or email
  session_id?: string
}) {
  // 1. Find recent sessions for this identifier
  // 2. Build complete touchpoint timeline
  // 3. Apply attribution models
  // 4. Calculate ROI per touchpoint
  // 5. Update attribution_paths table
}
```

---

### Phase 4: ROI & Optimization Dashboard

**Why?** Turn data into actionable insights that drive revenue growth.

#### Implementation Steps

**4.1 ROI Calculation Engine**

```sql
CREATE TABLE public.roi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_date DATE NOT NULL UNIQUE,

    -- Channel-level ROI
    google_ads_spend NUMERIC DEFAULT 0,
    google_ads_revenue NUMERIC DEFAULT 0,
    google_ads_roi NUMERIC, -- (revenue - spend) / spend * 100

    direct_traffic_conversions INTEGER DEFAULT 0,
    direct_traffic_revenue NUMERIC DEFAULT 0,

    organic_conversions INTEGER DEFAULT 0,
    organic_revenue NUMERIC DEFAULT 0,

    -- Overall business metrics
    total_marketing_spend NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    total_roi NUMERIC,

    -- Efficiency metrics
    cost_per_lead NUMERIC,
    lead_to_sale_rate NUMERIC,
    average_job_value NUMERIC,
    customer_acquisition_cost NUMERIC
);
```

**4.2 Create ROI Dashboard**

New page: `/admin/dashboard/roi`

**Key Sections:**

**A. Channel Performance Scorecard**
| Channel | Spend | Conversions | Revenue | ROI | Cost/Lead |
|---------|-------|-------------|---------|-----|-----------|
| Google Ads | $2,450 | 45 | $15,750 | 543% | $54.44 |
| Organic | $0 | 12 | $4,200 | ∞ | $0 |
| Direct | $0 | 8 | $2,800 | ∞ | $0 |

**B. Predictive Insights**
- "Based on trends, you'll reach $18K revenue this month"
- "Increase Google Ads budget by 20% for optimal ROI"
- "Your best-performing day is Wednesday at 2PM"

**C. Optimization Recommendations**
```
🎯 HIGH IMPACT ACTIONS:

1. Increase bids on "windshield replacement near me" (+40%)
   - Current CPA: $42
   - Projected additional revenue: $3,200/month
   - Confidence: 95%

2. Add negative keyword: "safelite"
   - Currently wasting $180/month
   - Zero conversions in 90 days

3. Extend hours: Get 8 more calls on Saturdays
   - Analysis shows 8 missed calls on weekends
   - Potential revenue: $2,800/month
```

**4.3 Automated Weekly Reports**

Email every Monday with:
- Last week's performance summary
- Top 3 opportunities
- Budget recommendations
- Competitive insights

---

### Phase 5: Advanced Analytics Features

**5.1 Cohort Analysis**

Track customer behavior over time:
- Retention rates
- Lifetime value by acquisition source
- Seasonal patterns

**5.2 A/B Testing Framework**

Test different:
- Landing page designs
- Call-to-action buttons
- Pricing displays
- Service packages

**5.3 Predictive Lead Scoring**

Use ML to score leads:
- Which visitors are most likely to convert?
- Optimal time to follow up
- Expected job value

**5.4 Competitor Intelligence**

Track competitors:
- Ad copy changes
- Keyword bidding activity
- Market share trends

---

## Implementation Roadmap

### Month 1: Foundation
**Week 1-2: RingCentral Call Tracking**
- Database schema
- Webhook integration
- Basic call dashboard

**Week 3-4: Google Ads API Integration**
- API authentication
- Automated daily sync
- Enhanced dashboard

### Month 2: Attribution
**Week 5-6: Customer Journey Tracking**
- Build attribution engine
- Journey visualization
- Multi-touch attribution models

**Week 7-8: ROI Dashboard**
- ROI calculations
- Channel performance
- Automated recommendations

### Month 3: Advanced Features
**Week 9-10: Predictive Analytics**
- Lead scoring
- Budget optimization
- Forecasting

**Week 11-12: Automation & Polish**
- Automated reports
- Alert system
- Performance tuning

---

## Technical Requirements

### New Dependencies
```json
{
  "@google-ads/api-client": "^16.0.0",
  "@ringcentral/sdk": "^5.0.0",
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "recharts": "^2.10.0"
}
```

### Database Migrations
- 5 new tables (phone_calls, sms_messages, google_ads_*, attribution_paths, roi_metrics)
- ~20 new indexes
- 3 new RLS policies

### API Integrations
- Google Ads API (OAuth 2.0)
- RingCentral Webhooks
- Vercel Cron Jobs (for scheduled syncs)

---

## Success Metrics

### Reporting Quality
- ✅ Complete attribution for 95%+ of conversions
- ✅ Real-time data (< 5 minute lag)
- ✅ Zero manual data entry
- ✅ ROI calculated for every marketing dollar

### Business Impact
- 🎯 Increase conversion rate by 25%
- 🎯 Reduce cost per acquisition by 30%
- 🎯 Improve ROI visibility by 100%
- 🎯 Save 5 hours/week on reporting

### User Experience
- Dashboard loads in < 2 seconds
- Mobile-optimized for field access
- Automated weekly insights
- Real-time alerts for high-value leads

---

## Next Steps

1. **Review & Approve Plan** - Confirm priorities and timeline
2. **Start with Phase 1** - RingCentral call tracking (highest impact)
3. **Iterative Development** - Ship features weekly
4. **Gather Feedback** - Adjust based on team usage
5. **Scale Up** - Add advanced features as foundation stabilizes

---

## Questions for Discussion

1. **Priority**: Should we start with call tracking or Google Ads automation?
2. **Call Tracking**: Do you want call recordings and transcriptions?
3. **Lead Values**: Do you track quote values and job revenue currently?
4. **Reporting Frequency**: Daily, weekly, or monthly automated reports?
5. **Access**: Should technicians have read-only dashboard access?
