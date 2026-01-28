# Google Ads Conversion Tracking Setup Guide

## Overview

This guide explains how to set up all conversion actions in Google Ads for Pink Auto Glass.

## Current Conversion Labels

These are already implemented in the website code (`src/lib/analytics.ts`):

```
GOOGLE_ADS_CONVERSION_ID = 'AW-17667607828'
GOOGLE_ADS_LEAD_FORM_LABEL = '3CXNCJaG9cEbEJSayehB'
GOOGLE_ADS_TEXT_LABEL = 'zs3xCJyG9cEbEJSayehB'
GOOGLE_ADS_CALL_LABEL = 'NRHDCJmG9cEbEJSayehB'
```

## Conversion Actions to Set Up in Google Ads

### 1. Quote Form Submission (Lead Form)
**Status:** ✅ Already tracked in code

**Google Ads Setup:**
1. Go to **Tools & Settings → Measurement → Conversions**
2. Click **+ New conversion action**
3. Select **Website**
4. Choose **Manually add code** (we already have it)
5. Settings:
   - **Goal:** Lead
   - **Conversion name:** "Quote Form Submission" or "Lead Form"
   - **Value:** Use the same value for each conversion = **$150**
   - **Count:** One per click (prevents duplicates)
   - **Conversion window:** 30 days
   - **Attribution model:** Data-driven or Last click
   - **Include in "Conversions":** Yes

**Verify the label:** Should show `3CXNCJaG9cEbEJSayehB`

---

### 2. Phone Call Click (Website Click-to-Call)
**Status:** ✅ Already tracked in code

**Google Ads Setup:**
1. Go to **Tools & Settings → Measurement → Conversions**
2. Click **+ New conversion action**
3. Select **Website**
4. Choose **Manually add code**
5. Settings:
   - **Goal:** Lead
   - **Conversion name:** "Phone Call Click" or "Click to Call"
   - **Value:** Use the same value for each conversion = **$100**
   - **Count:** One per click
   - **Conversion window:** 30 days
   - **Include in "Conversions":** Yes

**Verify the label:** Should show `NRHDCJmG9cEbEJSayehB`

---

### 3. Text Message Click (SMS Click)
**Status:** ✅ Already tracked in code

**Google Ads Setup:**
1. Go to **Tools & Settings → Measurement → Conversions**
2. Click **+ New conversion action**
3. Select **Website**
4. Choose **Manually add code**
5. Settings:
   - **Goal:** Lead
   - **Conversion name:** "Text Message Click" or "SMS Click"
   - **Value:** Use the same value for each conversion = **$50**
   - **Count:** One per click
   - **Conversion window:** 30 days
   - **Include in "Conversions":** Yes

**Verify the label:** Should show `zs3xCJyG9cEbEJSayehB`

---

### 4. Phone Calls FROM Ads (Call Extensions)
**Status:** ⚠️ Needs to be set up in Google Ads

**Google Ads Setup:**
1. Go to **Tools & Settings → Measurement → Conversions**
2. Click **+ New conversion action**
3. Select **Phone calls**
4. Choose **Calls to a phone number on your website**
5. Select **Using Google forwarding numbers**
6. Settings:
   - **Conversion name:** "Phone Calls from Ads"
   - **Value:** Use the same value for each conversion = **$150**
   - **Count:** One per call
   - **Call length:** Minimum **60 seconds** (adjust based on your average)
   - **Conversion window:** 30 days
   - **Include in "Conversions":** Yes

**Important:** After creating this:
- Go to **Ads & extensions → Extensions → Call extensions**
- Add your phone number: **(720) 918-7465**
- Enable **Call reporting**
- Check **"Use Google forwarding number"**

This will show a trackable forwarding number in your ads that routes to your real number.

---

## Conversion Values Explained

We assign different values based on lead quality:

- **Quote Form:** $150 (highest intent - they provided detailed info)
- **Phone Calls from Ads:** $150 (high intent - actively searching)
- **Phone Call Click (Website):** $100 (medium intent - exploring options)
- **Text Click:** $50 (lower intent - easier barrier to entry)

These values help Google Ads optimize bidding toward higher-value conversions.

---

## Testing Conversions

### Test Website Conversions
1. Visit: https://pinkautoglass.com
2. Add `?gclid=test123` to the URL (simulates ad click)
3. Complete an action (form, call click, text click)
4. Check Google Ads → Conversions → Recent conversions (may take 24 hours)

### Test Call Conversions from Ads
1. Create a test ad with call extension
2. Call the Google forwarding number
3. Stay on call for at least 60 seconds
4. Check conversions in 24 hours

---

## Duplicate Prevention

All conversions use **transaction IDs** to prevent duplicates:

```typescript
// Form submissions - uses lead ID
trackLeadFormConversion(leadId);

// Call clicks - uses session ID
trackCallClickConversion(sessionId);

// Text clicks - uses session ID
trackTextClickConversion(sessionId);
```

This ensures if someone clicks the phone button multiple times in one session, it only counts once.

---

## Verification Checklist

After setup, verify:

- [ ] All 4 conversion actions appear in Google Ads → Conversions
- [ ] Each has the correct conversion label
- [ ] "Include in Conversions" is enabled for all
- [ ] Values are assigned appropriately
- [ ] Count is set to "One" per click/call
- [ ] Google forwarding number is active in call extensions
- [ ] Test conversions are being recorded

---

## Common Issues

### Conversions Not Tracking
1. Check browser console for gtag errors
2. Verify Google Ads tag is on every page (it is - in layout.tsx)
3. Wait 24-48 hours for data to appear
4. Use Google Tag Assistant to debug

### Duplicate Conversions
- Ensure "Count" is set to "One" in Google Ads
- Check transaction_id is being sent correctly

### Phone Calls Not Tracking
- Verify call extension has "Use Google forwarding number" enabled
- Check minimum call length (reduce if needed)
- Ensure call reporting is enabled

---

## Next Steps

1. Create any missing conversion actions in Google Ads
2. Set up Google forwarding number for call extensions
3. Wait 7 days to collect data
4. Review conversion performance
5. Adjust values based on actual lead quality
6. Use conversion data to optimize campaigns

