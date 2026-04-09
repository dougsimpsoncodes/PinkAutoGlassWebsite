# Google Business Profile Optimization Guide
## Pink Auto Glass — Updated April 9, 2026

---

## 1. UTM Tracking (Do This First)

Update these links in the GBP dashboard to track traffic source:

### Colorado GBP Profile
| Field | Current URL | New URL |
|-------|-----------|---------|
| Website | `https://pinkautoglass.com` | `https://pinkautoglass.com?utm_source=google&utm_medium=gbp&utm_campaign=listing` |
| Appointment | `https://pinkautoglass.com/book` | `https://pinkautoglass.com/book?utm_source=google&utm_medium=gbp&utm_campaign=appointment` |

### Arizona GBP Profile (if separate)
| Field | Current URL | New URL |
|-------|-----------|---------|
| Website | `https://pinkautoglass.com/phoenix` | `https://pinkautoglass.com/phoenix?utm_source=google&utm_medium=gbp&utm_campaign=listing-az` |
| Appointment | `https://pinkautoglass.com/book` | `https://pinkautoglass.com/book?utm_source=google&utm_medium=gbp&utm_campaign=appointment-az` |

### For GBP Posts (use on every post link)
```
?utm_source=google&utm_medium=gbp&utm_campaign=post-[YYYY-MM-DD]
```

### Why This Matters
71.4% of current traffic shows as "direct/none." A significant portion is likely from GBP (Google Maps, knowledge panel) which doesn't pass referrer data. Adding UTMs will reveal the true traffic source within 30 days.

### How to Update
1. Go to [business.google.com](https://business.google.com)
2. Select the Pink Auto Glass profile
3. Click "Edit profile" → "Contact"
4. Update the website URL with the UTM parameters above
5. Save

---

## 2. Weekly Posting Cadence

Post 1x per week, alternating between two types:

### Week A: Service Post
Focus on a specific service. Include a photo of actual work (not stock).

**Template:**
```
[Service Name] — Did you know? [Key fact about the service]

[1-2 sentences about the benefit]

📞 Call (720) 918-7465 or book online:
[URL with UTM: https://pinkautoglass.com/services/[service]?utm_source=google&utm_medium=gbp&utm_campaign=post-YYYY-MM-DD]
```

**Rotation (8-week cycle):**
1. Windshield Replacement — "Most Colorado drivers pay $0 out of pocket"
2. Chip Repair — "30-minute service, prevents costly replacement"
3. Mobile Service — "We come to you — home, office, anywhere"
4. Insurance Claims — "We handle 100% of your paperwork"
5. ADAS Calibration — "Required after windshield replacement on 2015+ vehicles"
6. Emergency Service — "Same-day 24/7 available"
7. Colorado Zero Deductible — "Colorado law: $0 for windshield replacement"
8. Arizona $0 Law — "AZ law requires $0 deductible for windshield replacement"

### Week B: Local Post
Focus on a specific city or area you serve. Mention the city by name.

**Template:**
```
Serving [City] this week! 🚗

Mobile windshield replacement & repair right to your door in [City]. Same-day appointments available.

[City]-specific detail — neighborhood, highway, or local reference]

📞 (720) 918-7465
[URL: https://pinkautoglass.com/locations/[city-slug]?utm_source=google&utm_medium=gbp&utm_campaign=post-YYYY-MM-DD]
```

**Rotation (rotate through top cities by traffic):**
Denver, Aurora, Lakewood, Colorado Springs, Boulder, Fort Collins, Centennial, Thornton, Arvada, Westminster, Parker, Highlands Ranch

### Photo Guidelines
- Real photos of actual work (truck, technician, finished windshield)
- Before/after shots of chip repairs
- Team photos
- Branded vehicle in front of recognizable local landmarks
- Avoid stock photos — Google and users can tell

---

## 3. Review Strategy

### Ask Every Customer
After every completed job, send a review request. Target: 2-5 new reviews per week.

**Method 1: SMS (preferred — highest response rate)**
Send within 2 hours of job completion:
```
Hi [Name]! Thanks for choosing Pink Auto Glass. If you're happy with your windshield service, we'd love a quick Google review — it really helps us: [GBP review link]
```

**Method 2: Email follow-up**
Send next business day if no SMS response.

### Get Your Review Link
1. Go to [business.google.com](https://business.google.com)
2. Click "Get more reviews"
3. Copy the short link
4. Use in SMS/email templates

### Respond to Every Review (Within 24 Hours)

**Positive reviews — mention the city and service:**
```
Thank you, [Name]! We're glad the windshield replacement at your home in [City] went smoothly. Appreciate you choosing Pink Auto Glass — we're here anytime you need us!
```

**Negative reviews — professional, offer resolution:**
```
[Name], we're sorry to hear about your experience. This isn't the standard we hold ourselves to. Please call us at (720) 918-7465 so we can make this right. We want every customer to be completely satisfied.
```

### Why City Names in Responses Matter
Google uses review response text for local ranking signals. Mentioning "windshield replacement in Denver" or "auto glass repair in Aurora" in your response helps those pages rank for local searches.

---

## 4. Profile Optimization Checklist

### Verify These Settings
- [ ] **Primary category:** Auto Glass Shop
- [ ] **Secondary categories:** Windshield Repair Service, Auto Glass Installation Service
- [ ] **Service areas:** All 65+ cities in CO + AZ metro
- [ ] **Services listed:** Windshield Replacement, Windshield Repair, ADAS Calibration, Mobile Service, Insurance Claims, Emergency Repair
- [ ] **Hours:** Mon-Sat 7am-7pm (or current hours)
- [ ] **Phone:** (720) 918-7465 (CO) / (480) 712-7465 (AZ)
- [ ] **Website URL:** Updated with UTM parameters (see section 1)
- [ ] **Appointment URL:** Updated with UTM parameters
- [ ] **Description:** Include keywords — "mobile windshield replacement," "Denver," "Phoenix," "$0 deductible," "same-day service"
- [ ] **Messaging:** Enabled
- [ ] **Photos:** 10+ real photos (not stock)

### Monthly Maintenance
- [ ] Check for and respond to new reviews
- [ ] Post at least 4 times (weekly cadence)
- [ ] Review GBP Insights for trends
- [ ] Update photos if you have new ones
- [ ] Check that hours and contact info are still correct

---

## 5. Measuring Success

After implementing UTM tracking, monitor these in the admin dashboard:

| Metric | Current | Target (30 days) |
|--------|---------|-------------------|
| "direct/none" traffic | 71.4% | < 55% (rest attributed to GBP) |
| GBP-attributed page views | Unknown | Visible in dashboard |
| New Google reviews/week | Unknown | 2-5 |
| GBP post engagement | Not tracked | Baseline established |

### Dashboard Query
Once UTMs are live, GBP traffic will appear in the `user_sessions` table as:
- `utm_source = 'google'`
- `utm_medium = 'gbp'`
- `utm_campaign` will show 'listing', 'appointment', or 'post-YYYY-MM-DD'

The existing tracking code in `tracking.ts` captures these automatically.
