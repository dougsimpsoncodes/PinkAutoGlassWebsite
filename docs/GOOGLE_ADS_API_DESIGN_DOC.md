# Google Ads API Design Documentation
## Pink Auto Glass Analytics Platform

---

## Company Name
Pink Auto Glass

**Website**: www.pinkautoglass.com
**Business Type**: Auto glass repair and replacement service provider

---

## Business Model
Pink Auto Glass is a local auto glass repair and replacement company serving customers in Arizona. We operate a single business entity (www.pinkautoglass.com) providing mobile and in-shop auto glass services.

We advertise our own business through Google Ads campaigns to generate leads and drive phone calls from customers needing windshield repair, replacement, and ADAS calibration services. We do not manage advertising for any other companies or clients - we only advertise for our own business.

---

## Tool Access/Use
Our Google Ads API integration will be used exclusively by internal staff at Pink Auto Glass for the following purposes:

**Primary Users:**
- Business owner/administrators
- Marketing staff

**Tool Functionality:**
1. **Performance Dashboard**: View real-time Google Ads campaign performance metrics including impressions, clicks, cost, conversions, and ROI
2. **ROI Analytics**: Combine Google Ads data with phone call tracking data to calculate true return on investment
3. **Historical Reporting**: Analyze campaign performance trends over various time periods (daily, weekly, monthly, yearly)
4. **Data Syncing**: Automated daily sync of Google Ads metrics into our internal database for reporting

**Access Restrictions:**
- Tool is hosted on our private website behind authentication
- Only Pink Auto Glass employees will have access to the dashboard
- No external parties, agencies, or third-party users will have access
- Tool is for internal business intelligence and reporting only

---

## Tool Design

### Architecture Overview
Our tool consists of three main components:

**1. Data Collection Layer**
- Automated API sync runs daily at 2:00 AM MST
- Pulls campaign performance data for the previous day
- Stores data in our PostgreSQL database

**2. Database Layer**
- PostgreSQL database stores historical performance data
- Table structure:
  - `google_ads_daily_performance`: Daily campaign metrics
  - Stores: date, campaign_id, campaign_name, impressions, clicks, cost, conversions, conversion_value
- Data retention: Indefinite (for historical trend analysis)

**3. Reporting Dashboard**
- Web-based dashboard accessible only to authenticated Pink Auto Glass staff
- Pulls data from our internal database (not directly from Google Ads API)
- Displays:
  - Campaign performance summary
  - Daily/weekly/monthly trend charts
  - ROI calculations combining ad spend with revenue data
  - Key performance indicators (CPC, CTR, conversion rate, ROAS)

### Data Flow
1. Google Ads API → Daily Sync Script → PostgreSQL Database
2. PostgreSQL Database → Web Dashboard → Authenticated Users
3. Read-only access to Google Ads data (no campaign management or modifications)

### Security & Privacy
- All API credentials stored securely as environment variables
- Dashboard requires authentication (username/password)
- Data accessed only by authorized Pink Auto Glass employees
- No public access to Google Ads data
- HTTPS encryption for all data transmission

---

## API Services Called

We will use the following Google Ads API resources and services:

**1. Customer Resource**
- **Purpose**: Pull account-level performance metrics
- **Metrics**: impressions, clicks, cost_micros, conversions, conversions_value
- **Frequency**: Daily automated sync

**2. Campaign Resource**
- **Purpose**: Retrieve campaign-level performance data
- **Fields**: campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type
- **Metrics**: Same as Customer resource, segmented by campaign
- **Frequency**: Daily automated sync

**3. Ad Group Resource** (Optional/Future)
- **Purpose**: Detailed ad group performance analysis
- **Use Case**: Drill-down reporting for specific ad groups within campaigns

**4. Search Terms View** (Optional/Future)
- **Purpose**: Analyze which search queries triggered our ads
- **Use Case**: Keyword optimization insights

**API Access Level**: Basic Access (read-only)
**Data Access**: Historical performance metrics only (no campaign management or modification)

---

## Tool Mockups

### Dashboard Overview
Our analytics dashboard displays:

**Header Section:**
- Date range selector (Last 7 days, Last 30 days, Last 90 days, Custom range)
- Total metrics summary cards:
  - Total Impressions
  - Total Clicks
  - Total Spend
  - Total Conversions
  - ROI %

**Campaign Performance Table:**
| Campaign Name | Impressions | Clicks | Cost | Conversions | Conv. Value | ROI |
|---------------|-------------|--------|------|-------------|-------------|-----|
| Mobile Service | 1,234 | 45 | $125.50 | 8 | $1,200 | 856% |
| Windshield Repair | 2,456 | 78 | $245.30 | 12 | $1,800 | 634% |
| ADAS Calibration | 890 | 23 | $89.75 | 3 | $450 | 401% |

**Trend Charts:**
- Line chart showing daily spend vs. conversions over time
- Bar chart showing campaign comparison by ROI
- Pie chart showing budget distribution across campaigns

**ROI Analysis Section:**
- Combines Google Ads cost data with phone call tracking (RingCentral API)
- Calculates: (Revenue - Ad Spend) / Ad Spend × 100
- Displays cost per lead and cost per conversion

### Sync Status Page
- Last sync timestamp
- Sync status (Success/Failed)
- Records synced count
- Next scheduled sync time
- Manual sync trigger button (admin only)

---

## Technical Implementation

**Programming Language**: TypeScript/JavaScript (Node.js)
**Framework**: Next.js 14
**Database**: PostgreSQL (Neon serverless)
**Hosting**: Vercel
**Authentication**: NextAuth.js

**Cron Job**: Daily sync at 2:00 AM MST using Vercel Cron Jobs

---

## Use Case Summary

Pink Auto Glass will use the Google Ads API to:
1. **Monitor campaign performance** - Track which campaigns drive the most leads
2. **Calculate ROI** - Understand the true return on ad spend by combining with call tracking
3. **Optimize budget allocation** - Identify high-performing campaigns to inform budget decisions
4. **Historical analysis** - Analyze performance trends over time to improve marketing strategy

All data access is read-only and for internal business intelligence purposes only. We will not modify campaigns, create ads, or manage bidding through the API.

---

## Contact Information

**Company**: Pink Auto Glass
**Primary Contact**: Doug Simpson
**Email**: doug@pinkautoglass.com
**Phone**: (435) 045-1821
**Website**: www.pinkautoglass.com

**API Contact Email**: dougiefreshcodes@gmail.com
**Manager Account ID**: 435-045-1821

---

## Compliance Statement

Pink Auto Glass commits to:
- Using Google Ads API data solely for internal business reporting
- Not sharing API data with third parties
- Maintaining secure storage of all credentials
- Complying with Google Ads API Terms of Service
- Using data only for the purposes described in this document

We understand that our access may be audited by Google and we will provide any additional information required to maintain compliance.
