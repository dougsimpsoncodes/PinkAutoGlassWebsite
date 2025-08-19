# Pink Auto Glass Booking Wireframes

## Mobile-First Design Specifications

### Touch Target Requirements
- **Minimum touch target size**: 44px x 44px (iOS HIG standard)
- **Recommended touch target size**: 48px x 48px for primary actions
- **Minimum spacing between touch targets**: 8px
- **Active area extends beyond visual boundary**: 6px minimum

## Step 1: Service Selection

```
┌─────────────────────────────┐
│ ← Pink Auto Glass           │ Header: 56px height
├─────────────────────────────┤
│                             │
│    What do you need?        │ Title: 32px font, 24px margin
│                             │
│ ┌─────────────────────────┐ │ Service cards: 120px height
│ │ 🔧 Windshield Repair   │ │ Full-width, 16px margin-bottom
│ │ Fix chips & cracks     │ │ 44px min touch target
│ │ Starting at $89        │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🚗 Windshield Replace  │ │ 
│ │ Complete replacement   │ │
│ │ From $299              │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🏃 Mobile Service       │ │
│ │ We come to you         │ │
│ │ Add $25                │ │
│ └─────────────────────────┘ │
│                             │
│ [    Continue    ]          │ Sticky CTA: 56px height
└─────────────────────────────┘ Bottom: 0, full-width
```

### Interactions & Gestures
- **Tap to select**: Service cards highlight with brand gradient border
- **Single selection**: Only one service can be selected
- **Visual feedback**: Selected card gets brand shadow + scale(1.02)
- **Continue button**: Disabled until selection made

### Accessibility
- Service cards have `role="radio"` with `aria-describedby` for pricing
- Continue button has `aria-disabled="true"` when no selection
- Screen reader announces service type and price on selection

---

## Step 2: Vehicle Information

```
┌─────────────────────────────┐
│ ← Step 2 of 5      ●●○○○    │ Progress: dots indicate steps
├─────────────────────────────┤
│                             │
│   Tell us about your car    │ Title: 28px font
│                             │
│ Year *                      │ Label: 16px, semibold
│ ┌─────────────────────────┐ │
│ │ Select year ▼          │ │ Select: 48px height
│ └─────────────────────────┘ │ Native dropdown on mobile
│                             │
│ Make *                      │
│ ┌─────────────────────────┐ │
│ │ Select make ▼          │ │
│ └─────────────────────────┘ │
│                             │
│ Model *                     │
│ ┌─────────────────────────┐ │
│ │ Select model ▼         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ Optional upload section
│ │ 📷 Add photos (optional)│ │ 80px height
│ │ Tap to upload damage   │ │
│ └─────────────────────────┘ │
│                             │
│                             │
│                             │
│ [    Continue    ]          │ Sticky CTA
└─────────────────────────────┘
```

### Form Interactions
- **Year dropdown**: Shows last 30 years, current year first
- **Make dropdown**: Enabled after year selection, popular makes first
- **Model dropdown**: Enabled after make selection, alphabetical
- **Photo upload**: 
  - Taps camera icon opens device camera
  - Supports multiple photos (max 5)
  - Each photo shows 60x60px thumbnail with X to remove
- **Real-time validation**: Fields validate on blur

### Error States
```
│ Year *                      │
│ ┌─────────────────────────┐ │
│ │ Please select year      │ │ Error: red border, 14px text
│ └─────────────────────────┘ │ Below field, #dc2626 color
│ ⚠ This field is required    │
```

---

## Step 3: Contact Information

```
┌─────────────────────────────┐
│ ← Step 3 of 5      ●●●○○    │
├─────────────────────────────┤
│                             │
│   How can we reach you?     │
│                             │
│ First Name *                │
│ ┌─────────────────────────┐ │
│ │ Enter first name       │ │ Input: 48px height
│ └─────────────────────────┘ │ Placeholder text: #6b7280
│                             │
│ Last Name *                 │
│ ┌─────────────────────────┐ │
│ │ Enter last name        │ │
│ └─────────────────────────┘ │
│                             │
│ Phone Number *              │
│ ┌─────────────────────────┐ │
│ │ (555) 123-4567         │ │ Auto-format as user types
│ └─────────────────────────┘ │
│                             │
│ Email                       │
│ ┌─────────────────────────┐ │
│ │ your@email.com         │ │
│ └─────────────────────────┘ │
│                             │
│ Best Time to Call           │
│ ┌─────────────────────────┐ │
│ │ ○ Morning ○ Afternoon  │ │ Radio buttons: 32px touch
│ │ ○ Evening ○ Anytime    │ │ 2x2 grid on mobile
│ └─────────────────────────┘ │
│                             │
│ [    Continue    ]          │
└─────────────────────────────┘
```

### Input Behaviors
- **Auto-focus**: First field focused on step entry
- **Phone formatting**: Automatically formats (555) 123-4567
- **Email validation**: Real-time email format checking
- **Time selection**: Single selection radio group

### Accessibility Features
- All inputs have proper labels and aria-describedby for errors
- Phone input has `inputmode="tel"` for numeric keypad
- Email input has `inputmode="email"` for email keyboard

---

## Step 4: Location & Schedule

```
┌─────────────────────────────┐
│ ← Step 4 of 5      ●●●●○    │
├─────────────────────────────┤
│                             │
│   Where and when?           │
│                             │
│ Service Location *          │
│ ┌─────────────────────────┐ │
│ │ 📍 Use my location     │ │ Geolocation: 48px height
│ └─────────────────────────┘ │ Primary action
│                             │
│ OR enter address            │ Divider text: 14px, gray
│                             │
│ ┌─────────────────────────┐ │
│ │ Street address         │ │ Address input: 48px
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ City, State ZIP        │ │
│ └─────────────────────────┘ │
│                             │
│ Preferred Date *            │
│ ┌─────────────────────────┐ │
│ │ Today   Tomorrow       │ │ Quick select: 40px height
│ │ Later   [Select Date]  │ │ 2x2 grid
│ └─────────────────────────┘ │
│                             │
│ Time Window                 │
│ ┌─────────────────────────┐ │
│ │ ○ 8-10 AM  ○ 10-12 PM  │ │ Time slots: 36px height
│ │ ○ 12-2 PM  ○ 2-4 PM    │ │ 2x2 grid
│ │ ○ 4-6 PM   ○ Flexible  │ │
│ └─────────────────────────┘ │
│                             │
│ [    Continue    ]          │
└─────────────────────────────┘
```

### Location Features
- **Geolocation**: Requests permission, auto-fills address
- **Address validation**: Real-time verification with Google Places API
- **Service area check**: Validates location is within coverage area

### Date/Time Selection
- **Quick dates**: Today/Tomorrow show availability immediately
- **Date picker**: Opens native calendar picker
- **Time slots**: Show actual availability, gray out unavailable
- **Flexible option**: Allows "Call me to schedule"

---

## Step 5: Review & SMS Consent

```
┌─────────────────────────────┐
│ ← Step 5 of 5      ●●●●●    │
├─────────────────────────────┤
│                             │
│   Review your request       │
│                             │
│ ┌─────────────────────────┐ │ Review card: rounded corners
│ │ Windshield Repair       │ │ Service + vehicle info
│ │ 2019 Honda Civic        │ │ Editable sections
│ │                         │ │
│ │ John Smith              │ │ Contact info
│ │ (555) 123-4567          │ │
│ │                         │ │
│ │ 123 Main St             │ │ Location + timing
│ │ Tomorrow, 10-12 PM      │ │
│ └─────────────────────────┘ │
│                             │
│ Damage Description          │ Optional textarea
│ ┌─────────────────────────┐ │
│ │ Describe damage or add │ │ 120px height
│ │ special instructions   │ │ Auto-expand
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │ SMS consent: prominent
│ │ ☑ Send me text updates │ │ Checkbox: 24px
│ │ about my appointment    │ │ Brand color when checked
│ │                         │ │
│ │ Standard rates apply    │ │ Disclaimer: 12px gray
│ │ Text STOP to opt-out    │ │
│ └─────────────────────────┘ │
│                             │
│ [  Get Free Quote  ]        │ Final CTA: brand gradient
└─────────────────────────────┘ 56px height, rounded
```

### Review Section Interactions
- **Edit links**: Tapping any section goes back to that step
- **Data persistence**: All entered data preserved across steps
- **SMS consent**: Required for appointment updates
- **Description**: Optional but helps with quote accuracy

### Final CTA Specifications
- **Button text**: "Get Free Quote" (not "Submit")
- **Loading state**: Shows spinner + "Getting your quote..."
- **Disabled state**: Gray background, no interaction
- **Success state**: Green checkmark + confirmation text

---

## Success Confirmation

```
┌─────────────────────────────┐
│ ← Pink Auto Glass           │
├─────────────────────────────┤
│                             │
│        ✓                    │ Large checkmark: 80px
│                             │ Brand color
│   Request Sent!             │ Success title: 32px bold
│                             │
│ We'll call you within       │ Confirmation message
│ 15 minutes to confirm       │ 18px font, centered
│ your appointment.           │
│                             │
│ ┌─────────────────────────┐ │ Reference card
│ │ Reference #QT-2024-1234 │ │ Reference number
│ │                         │ │ Easy to read/share
│ │ We've sent details to:  │ │
│ │ john@email.com          │ │ Email confirmation
│ └─────────────────────────┘ │
│                             │
│ Questions? Call us:         │
│ (555) 123-4567             │ Direct contact info
│                             │
│ [   Back to Home   ]       │ Secondary CTA
│                             │
│ [  Track Request   ]       │ Primary CTA
└─────────────────────────────┘ Link to status page
```

## Sticky CTA Specifications

### Position & Behavior
- **Position**: Fixed bottom, full width
- **Z-index**: 1100 (sticky level)
- **Background**: White with top border shadow
- **Padding**: 16px horizontal, 12px vertical
- **Safe area**: Respects iOS safe area insets

### Visual States
```
Default State:
┌─────────────────────────────┐
│ [      Continue      ]      │ 48px height, brand gradient
└─────────────────────────────┘ 16px horizontal margin

Disabled State:
┌─────────────────────────────┐
│ [      Continue      ]      │ Gray background (#e5e7eb)
└─────────────────────────────┘ No interaction, opacity 0.6

Loading State:
┌─────────────────────────────┐
│ [  ○ Getting quote...  ]    │ Spinner + text
└─────────────────────────────┘ Prevents double submission
```

### Responsive Behavior
- **Small screens (<375px)**: CTA reduces to 40px height
- **Large screens (>768px)**: Centers with max-width 400px
- **Landscape**: Reduces padding to 8px vertical
- **Keyboard visible**: Hides automatically on iOS/Android

## Mobile Gestures & Interactions

### Swipe Navigation
- **Swipe right**: Go back to previous step (when available)
- **Swipe left**: Not implemented (prevents accidental forward nav)
- **Pull to refresh**: Not applicable in booking flow

### Touch Feedback
- **Button press**: 150ms haptic feedback (light)
- **Selection**: 200ms haptic feedback (medium) 
- **Error**: 300ms haptic feedback (error pattern)
- **Success**: 500ms haptic feedback (success pattern)

### Scroll Behavior
- **Smooth scrolling**: 300ms ease-out animation
- **Form focus**: Auto-scroll to bring input into view
- **Error focus**: Scroll to first error field
- **Momentum scrolling**: Enabled on iOS

### Loading States
- **Step transition**: 200ms fade between steps
- **Form submission**: Button shows spinner, form dims
- **Image upload**: Progress bar for each photo
- **Address lookup**: Inline spinner in input field

## Accessibility Standards

### Screen Reader Support
- **Step announcements**: "Step 2 of 5, Vehicle Information"
- **Form progress**: "3 of 5 required fields completed" 
- **Error announcements**: Immediate announcement on validation
- **Success confirmation**: Full confirmation message read aloud

### Focus Management
- **Step entry**: Focus moves to first interactive element
- **Error handling**: Focus moves to first error field
- **Modal dismissal**: Focus returns to trigger element
- **Skip links**: Allow jumping to main content

### Color & Contrast
- **Text contrast**: Minimum 4.5:1 ratio for normal text
- **Interactive elements**: 3:1 contrast ratio minimum
- **Error states**: Multiple indicators (color + icon + text)
- **Focus indicators**: High contrast focus rings

### Voice Control
- **Voice navigation**: All interactive elements have voice labels
- **Dictation support**: Text inputs support voice-to-text
- **Voice commands**: "Go back", "Continue", "Submit" recognized

## Performance Specifications

### Loading Times
- **Step transition**: < 200ms
- **Form validation**: < 100ms
- **Image upload**: Progress feedback within 500ms
- **Quote submission**: Confirmation within 3 seconds

### Bandwidth Considerations
- **Images**: Compress to < 100KB each
- **Progressive loading**: Show content as it loads
- **Offline handling**: Cache form data, sync when online
- **Slow connections**: Timeout warnings after 10 seconds