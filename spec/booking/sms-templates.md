# Pink Auto Glass SMS Templates

## Twilio Configuration

### Account Settings
- **Account SID**: `AC[32-character string]`
- **Auth Token**: `[32-character string]` (environment variable)
- **Service SID**: `VA[32-character string]` (for Verify API if used)

### Phone Number Requirements
- **From Number**: US toll-free number (e.g., +1-800-PINK-123)
- **Message Type**: Promotional and Transactional
- **Country**: United States only
- **Compliance**: TCPA compliant, opt-in consent required

---

## Template Categories

### 1. Confirmation Templates

#### Template: Initial Quote Confirmation
**Trigger**: Immediately after form submission  
**Type**: Transactional  
**Consent**: Not required (transactional confirmation)

```
Hi {{firstName}}! We received your windshield {{serviceType}} request for your {{year}} {{make}} {{model}} (Ref: {{referenceNumber}}). We'll call you within 15 minutes to confirm your appointment. Questions? Call (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{firstName}}`: Customer first name
- `{{serviceType}}`: "repair" or "replacement"  
- `{{year}}`: Vehicle year
- `{{make}}`: Vehicle make
- `{{model}}`: Vehicle model
- `{{referenceNumber}}`: Format QT-YYYY-NNNN

**Character Count**: 157 characters (fits in single SMS)

---

#### Template: Appointment Confirmed
**Trigger**: After phone confirmation call  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Your windshield {{serviceType}} is confirmed for {{appointmentDate}} between {{timeWindow}} at {{address}}. Your technician is {{technicianName}}. We'll text updates as we get closer!

Reply STOP to opt-out
```

**Personalization Tokens**:
- `{{serviceType}}`: "repair" or "replacement"
- `{{appointmentDate}}`: Format "Monday, Jan 15"  
- `{{timeWindow}}`: Format "10AM-12PM"
- `{{address}}`: Short address format "123 Main St"
- `{{technicianName}}`: First name only

**Character Count**: 148 characters

---

### 2. Reminder Templates

#### Template: 24-Hour Reminder  
**Trigger**: 24 hours before appointment  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Reminder: Your windshield {{serviceType}} is tomorrow {{appointmentDate}} between {{timeWindow}}. {{technicianName}} will call 30 mins before arrival. Need to reschedule? Call (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{serviceType}}`: "repair" or "replacement"
- `{{appointmentDate}}`: Format "Monday 1/15"
- `{{timeWindow}}`: Format "10AM-12PM"  
- `{{technicianName}}`: First name only

**Character Count**: 155 characters

---

#### Template: Arrival Notification
**Trigger**: 30 minutes before technician arrival  
**Type**: Transactional  
**Consent**: Required SMS consent

```
{{technicianName}} is on the way to {{address}} for your {{serviceType}}! ETA: {{estimatedArrival}}. He'll call when he arrives. Track progress: {{trackingLink}}

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{technicianName}}`: First name only
- `{{address}}`: Short format "123 Main St"
- `{{serviceType}}`: "windshield repair" or "windshield replacement"
- `{{estimatedArrival}}`: Format "30 minutes"
- `{{trackingLink}}`: Shortened URL to tracking page

**Character Count**: 142 characters

---

#### Template: Technician Arrival
**Trigger**: When technician arrives on-site  
**Type**: Transactional  
**Consent**: Required SMS consent

```
{{technicianName}} has arrived for your windshield {{serviceType}}! The work will take about {{duration}}. You'll get a text when it's complete.

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{technicianName}}`: First name only
- `{{serviceType}}`: "repair" or "replacement"
- `{{duration}}`: Format "30 minutes" or "1 hour"

**Character Count**: 128 characters

---

### 3. Status Update Templates

#### Template: Work In Progress
**Trigger**: Optional, for longer jobs  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Update: {{technicianName}} is working on your windshield. Everything looks good! We're about halfway done. Should be finished in about {{remainingTime}}.

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{technicianName}}`: First name only
- `{{remainingTime}}`: Format "30 minutes"

**Character Count**: 134 characters

---

#### Template: Work Completed
**Trigger**: When service is finished  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Your windshield {{serviceType}} is complete! {{technicianName}} will review the work with you. Please wait 1 hour before highway speeds. Thanks for choosing Pink Auto Glass!

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{serviceType}}`: "repair" or "replacement"
- `{{technicianName}}`: First name only

**Character Count**: 147 characters

---

### 4. Follow-up Templates  

#### Template: Service Feedback Request
**Trigger**: 2 hours after service completion  
**Type**: Promotional  
**Consent**: Required SMS consent

```
Hi {{firstName}}! How did we do with your windshield {{serviceType}}? We'd love a quick review: {{reviewLink}}. Thanks for choosing Pink Auto Glass!

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{firstName}}`: Customer first name
- `{{serviceType}}`: "repair" or "replacement"
- `{{reviewLink}}`: Shortened URL to review platform

**Character Count**: 127 characters

---

#### Template: Future Service Reminder
**Trigger**: 6 months after service (for repairs)  
**Type**: Promotional  
**Consent**: Required SMS consent

```
Hi {{firstName}}! It's been 6 months since your windshield repair. How's it holding up? Any new chips or cracks? We're here to help: (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{firstName}}`: Customer first name

**Character Count**: 145 characters

---

### 5. Issue Resolution Templates

#### Template: Appointment Delayed
**Trigger**: When running late  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Sorry! {{technicianName}} is running about {{delayTime}} late for your {{timeWindow}} appointment. New ETA: {{newETA}}. Need to reschedule? Call (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{technicianName}}`: First name only
- `{{delayTime}}`: Format "30 minutes"
- `{{timeWindow}}`: Format "10AM-12PM"
- `{{newETA}}`: Format "12:30 PM"

**Character Count**: 144 characters

---

#### Template: Weather Delay
**Trigger**: When weather impacts service  
**Type**: Transactional  
**Consent**: Required SMS consent

```
Weather alert: Your windshield {{serviceType}} today may be delayed due to {{weatherType}}. We'll monitor conditions and update you soon. Safety first!

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{serviceType}}`: "repair" or "replacement"
- `{{weatherType}}`: "rain", "snow", or "severe weather"

**Character Count**: 137 characters

---

#### Template: Reschedule Request
**Trigger**: When customer needs to reschedule  
**Type**: Transactional  
**Consent**: Required SMS consent

```
No problem! We've cancelled your {{appointmentDate}} appointment. Call (555) 123-PINK when you're ready to reschedule. We'll take great care of your {{year}} {{make}}.

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{appointmentDate}}`: Format "Monday 1/15"
- `{{year}}`: Vehicle year
- `{{make}}`: Vehicle make

**Character Count**: 144 characters

---

### 6. Emergency/Urgent Templates

#### Template: Same-Day Service Available
**Trigger**: When urgent slots open up  
**Type**: Promotional  
**Consent**: Required SMS consent

```
Good news {{firstName}}! We have a same-day opening for your windshield {{serviceType}}. Available today {{timeWindow}}. Want it? Reply YES or call (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{firstName}}`: Customer first name
- `{{serviceType}}`: "repair" or "replacement"
- `{{timeWindow}}`: Format "2-4 PM"

**Character Count**: 149 characters

---

#### Template: Safety Reminder
**Trigger**: For customers who haven't scheduled after 48 hours  
**Type**: Promotional  
**Consent**: Required SMS consent

```
Hi {{firstName}}! Windshield damage can spread quickly and compromise safety. Don't wait - schedule your {{serviceType}} today: (555) 123-PINK

Text STOP to opt-out
```

**Personalization Tokens**:
- `{{firstName}}`: Customer first name
- `{{serviceType}}`: "repair" or "replacement"

**Character Count**: 138 characters

---

## Compliance Requirements

### TCPA Compliance
- **Express Written Consent**: Required for all non-transactional messages
- **Consent Language**: "I consent to receive appointment updates and service notifications via SMS from Pink Auto Glass. Standard message rates may apply. Text STOP to opt-out anytime."
- **Opt-out Mechanism**: All messages include "Text STOP to opt-out"
- **Record Keeping**: Store consent timestamp and method for each customer

### Message Frequency
- **Transactional**: No frequency limits (confirmations, updates, delays)
- **Promotional**: Maximum 2 messages per week per customer
- **Overall**: Maximum 4 messages per customer per week across all types

### Business Hours
- **Send Window**: 8:00 AM - 8:00 PM customer local time
- **Emergencies**: Safety-related messages can be sent outside hours
- **Timezone Handling**: Use customer address to determine local time

---

## Opt-out Handling

### Automatic Responses
```
STOP Keywords: STOP, END, CANCEL, UNSUBSCRIBE, QUIT
Response: "You've been unsubscribed from Pink Auto Glass SMS. You won't receive promotional messages but may still get appointment confirmations. Call (555) 123-PINK for service."
```

### Opt-back-in Process
```
START Keywords: START, BEGIN, YES (in response to opt-out)
Response: "Welcome back! You'll now receive SMS updates from Pink Auto Glass. Text STOP anytime to opt-out."
```

### Help Response
```  
HELP Keywords: HELP, INFO, ?
Response: "Pink Auto Glass SMS: Get appointment updates and service info. Msg&data rates apply. Text STOP to opt-out, HELP for help. Call (555) 123-PINK"
```

---

## Error Handling

### Failed Delivery Template
**Action**: Retry once after 30 minutes, then mark as undeliverable
```
Internal Note: SMS to {{phone}} failed. Reason: {{failureReason}}. Customer marked for phone-only communication.
```

### Invalid Phone Number
**Action**: Flag in CRM for phone number verification
```
Internal Alert: Invalid phone {{phone}} for lead {{referenceNumber}}. Phone verification required.
```

---

## A/B Testing Framework

### Test Variables
1. **Message Length**: Short vs. detailed versions
2. **Tone**: Friendly vs. professional
3. **CTA Style**: Direct vs. question format
4. **Timing**: Immediate vs. 5-minute delay for confirmations

### Success Metrics
- **Open Rate**: SMS delivered and read
- **Response Rate**: Customer replies or clicks links  
- **Conversion Rate**: Appointments kept vs. scheduled
- **Opt-out Rate**: Customers who unsubscribe

---

## Integration Specifications

### Webhook Configuration
```json
{
  "webhookUrl": "https://pinkautoglass.com/api/webhooks/twilio",
  "events": ["delivered", "failed", "replied"],
  "authentication": "bearer_token"
}
```

### Message Status Tracking
```javascript
const messageStatuses = {
  "queued": "Message queued for delivery",
  "sending": "Message being sent",
  "sent": "Message sent to carrier", 
  "delivered": "Message delivered to device",
  "failed": "Message delivery failed",
  "undelivered": "Message could not be delivered"
};
```

### Rate Limiting
- **Burst Rate**: 1 message per second per customer
- **Sustained Rate**: 100 messages per minute account-wide
- **Daily Limit**: 1,000 messages per day (can be increased)

---

## Template Maintenance

### Regular Review Schedule
- **Monthly**: Review delivery rates and opt-out rates
- **Quarterly**: Update seasonal messaging and phone numbers  
- **Annually**: Full compliance audit and template optimization

### Version Control
- All template changes tracked in Git
- A/B test results documented
- Customer feedback incorporated into updates
- Legal review required for consent language changes

### Performance Monitoring
- **Delivery Rate Target**: >95%
- **Opt-out Rate Target**: <2% monthly
- **Response Rate Target**: >10% for transactional messages
- **Compliance Score**: 100% (zero violations)