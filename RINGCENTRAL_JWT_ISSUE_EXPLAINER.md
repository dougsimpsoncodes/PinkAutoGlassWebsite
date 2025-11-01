# RingCentral JWT Issue - Quick Explainer

## What to Copy/Paste to Another LLM

Copy the contents of `LLM_REVIEW_SCRIPT.md` and paste it with this message:

---

**Your Message:**

> I'm stuck on a RingCentral JWT authentication issue and need expert troubleshooting advice. I've spent several hours trying different approaches and the error persists. Here's the technical breakdown:
>
> [PASTE CONTENTS OF LLM_REVIEW_SCRIPT.MD HERE]

---

## Background (Don't Send This Part)

**What we're building:** Lead notification system for auto glass repair website that sends SMS alerts when customers submit booking requests.

**Current status:**
- ✅ Email notifications working perfectly (Resend)
- ❌ SMS notifications blocked by RingCentral JWT authentication error

**Why this matters:**
- SMS is "nice to have" but not critical (email covers 95% of needs)
- We've already invested 2+ hours troubleshooting this
- If we can't solve it quickly, we'll defer SMS and stick with email-only

**What we need from the other LLM:**
1. Root cause diagnosis - Why is "Invalid assertion signature" happening?
2. Quick fix - If there's an obvious solution we're missing
3. Alternative recommendation - Should we try password auth instead of JWT?
4. Go/No-Go advice - Is this worth more troubleshooting time or should we move on?

---

## Expected Response Types

### Best Case
"Oh, I see the issue! You need to [specific fix]. Here's exactly what to do..."

### Good Case
"This is a known issue with RingCentral JWT. Try [alternative approach] instead."

### Acceptable Case
"The JWT setup is complex. For your use case, I'd recommend [simpler solution like password auth]."

### Warning Case
"This requires contacting RingCentral support. It's a platform configuration issue you can't fix yourself."

---

## What to Do After

### If LLM Provides Clear Solution
1. Implement the fix
2. Test with `node scripts/test-ringcentral-sms.js`
3. If it works, great! If not, move to "defer SMS" plan

### If LLM Suggests Alternative Auth Method
1. Evaluate if it's simpler than current approach
2. If yes and takes < 30 minutes, try it
3. If no or takes longer, defer SMS for now

### If LLM Says "Contact Support"
1. **Don't contact support now** - not worth the time
2. Stick with email-only notifications
3. Add SMS to future roadmap when we have more time
4. Email notifications are already working perfectly for all 3 admins

---

## Decision Framework

**Spend More Time If:**
- LLM identifies obvious mistake we made
- Fix is < 15 minutes of work
- High confidence it will work

**Move On If:**
- Requires RingCentral support intervention
- Would take > 30 more minutes
- Solution is uncertain/experimental
- LLM can't diagnose root cause

**Remember:** Email notifications are fully functional. SMS is supplementary. Don't let perfect be the enemy of good.
