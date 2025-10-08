# Hub Pages & Track Page - Testing Script

**Server Status:** ✅ Running at http://localhost:3000

**Last Updated:** October 8, 2025

---

## 🎯 Quick Test URLs

Copy and paste these into your browser:

```
http://localhost:3000/services
http://localhost:3000/locations
http://localhost:3000/vehicles
http://localhost:3000/track
http://localhost:3000/track?ref=TEST123
```

---

## 📋 Comprehensive Test Plan

### **TEST 1: /services Hub Page**

**URL:** http://localhost:3000/services

#### ✅ Visual Checks:
- [ ] Hero section displays with gradient background (pink to purple)
- [ ] "Complete Auto Glass Services in Denver" heading is visible
- [ ] Trust signals component appears below hero
- [ ] Breadcrumb shows "Services" link

#### ✅ Quick Decision Tool (Above Fold):
- [ ] "Which Service Do I Need?" section appears immediately
- [ ] 6 boxes show different scenarios:
  - Small chip → Repair ($89)
  - Large crack → Replacement ($299)
  - Damage in driver's view → Replacement
  - Multiple chips → Replacement
  - Edge damage → Replacement
  - Not sure? → Call CTA
- [ ] Phone number (720) 918-7465 is clickable

#### ✅ Service Cards (5 cards):
- [ ] Windshield Replacement card (pink/purple gradient header)
- [ ] Windshield Repair card (green gradient header)
- [ ] ADAS Calibration card (blue gradient header)
- [ ] Mobile Service card (purple gradient header)
- [ ] Insurance Claims card (teal gradient header)

**For each card, verify:**
- [ ] Pricing is displayed prominently
- [ ] "What's Included" list has checkmarks
- [ ] "When You Need This" bullet points
- [ ] "Learn More" button links work
- [ ] "Get Free Quote" / "Book Now" buttons present

#### ✅ Service Comparison Table:
- [ ] Table has gradient header (pink to purple)
- [ ] Columns: Factor | Windshield Repair | Windshield Replacement
- [ ] Rows include: Best For, Time Required, Typical Cost, Insurance, etc.
- [ ] Table is readable on desktop and mobile

#### ✅ Colorado Insurance Section:
- [ ] Green/blue gradient background
- [ ] "Why Most Windshield Claims Cost You $0" heading
- [ ] 6-step "How It Works" numbered list
- [ ] "Important" note about rate increases

#### ✅ Why Choose Us Section:
- [ ] 6 cards with icons:
  - Lifetime Warranty (Shield icon)
  - Same-Day Service (Clock icon)
  - Certified Technicians (Wrench icon)
  - OEM Quality (CheckCircle icon)
  - Free ADAS Calibration (DollarSign icon)
  - Transparent Pricing (Car icon)

#### ✅ FAQs Section:
- [ ] 8 FAQ items in accordion format
- [ ] Clicking a question expands the answer
- [ ] Arrow icon rotates when expanded
- [ ] Questions include:
  - "How do I know if I need repair or replacement?"
  - "Does insurance cover windshield..."
  - "How long does each service take?"
  - etc.

#### ✅ Service Areas & Popular Vehicles:
- [ ] Two-column grid at bottom
- [ ] Service Areas: Lists 10 cities with links
- [ ] Popular Vehicles: Lists 6 vehicles with links
- [ ] All links work (test 2-3 random ones)

#### ✅ Bottom CTA:
- [ ] Gradient background (pink to purple)
- [ ] "Ready to Get Your Windshield Fixed?" heading
- [ ] CTA buttons present and styled correctly

#### ✅ Functionality Tests:
- [ ] Click "Learn More" on Windshield Replacement → Goes to /services/windshield-replacement
- [ ] Click "Learn More" on Windshield Repair → Goes to /services/windshield-repair
- [ ] Click Denver in Service Areas → Goes to /locations/denver-co
- [ ] Click a vehicle link → Goes to vehicle page
- [ ] All "Get Free Quote" buttons link to /book
- [ ] Phone numbers are clickable (should prompt to call)

#### ✅ Responsive Design:
- [ ] Resize browser to mobile width
- [ ] Service cards stack vertically
- [ ] Comparison table scrolls horizontally or stacks
- [ ] Decision tool boxes stack on mobile
- [ ] All text is readable

---

### **TEST 2: /locations Hub Page**

**URL:** http://localhost:3000/locations

#### ✅ Visual Checks:
- [ ] Hero section with MapPin icon visible
- [ ] "Mobile Windshield Service Throughout Colorado" heading
- [ ] Blue to purple gradient background
- [ ] Trust signals component below hero
- [ ] Breadcrumb shows "Locations"

#### ✅ Intro Section:
- [ ] "Professional Windshield Service Across Denver Metro" heading
- [ ] Two paragraphs of intro text
- [ ] Text is centered and readable

#### ✅ Coverage Area Stats:
- [ ] Blue/purple gradient background box
- [ ] Three stat cards visible:
  - 10+ Cities Served (MapPin icon)
  - 100+ Neighborhoods (Car icon)
  - Same-Day Service (Clock icon)
- [ ] "What Sets Our Mobile Service Apart" list with 5 checkmarks

#### ✅ Cities Grid (10 cities):
- [ ] 3-column grid on desktop
- [ ] Each city card has:
  - Colored header (pink/purple for popular, blue for others)
  - City name and description
  - MapPin icon
  - Neighborhoods count
  - "Same-day service" badge
  - "View [City] Details" link with arrow

**Test a few city cards:**
- [ ] Click Denver card → Goes to /locations/denver-co
- [ ] Click Aurora card → Goes to /locations/aurora-co
- [ ] Hover effect works (shadow increases)

#### ✅ Mobile Service Process:
- [ ] White background section
- [ ] "How Mobile Service Works" heading
- [ ] 4-column grid with steps:
  1. Call or Book Online (Phone icon, pink)
  2. We Come to You (MapPin icon, blue)
  3. Expert Service (Car icon, purple)
  4. You're Done (CheckCircle icon, green)
- [ ] Numbered badges (1, 2, 3, 4) visible

#### ✅ Service Highlights:
- [ ] 3 cards in a row:
  - Same Quality, Any Location (Shield icon, pink border)
  - Flexible Scheduling (Clock icon, blue border)
  - Full ADAS Capability (Car icon, green border)

#### ✅ Customer Testimonials:
- [ ] 3 testimonial cards
- [ ] Each has 5 yellow stars
- [ ] Customer name and location shown
- [ ] Quote text is readable

#### ✅ FAQs Section:
- [ ] 6 FAQ items
- [ ] Questions about mobile service coverage
- [ ] Accordion works (expand/collapse)

#### ✅ Services CTA Section:
- [ ] 4 buttons:
  - Windshield Replacement (pink)
  - Windshield Repair (blue)
  - ADAS Calibration (purple)
  - View All Services (gray)
- [ ] Click "View All Services" → Goes to /services

#### ✅ Bottom CTA:
- [ ] Blue to purple gradient
- [ ] "Ready to Schedule Mobile Service?" heading
- [ ] CTA buttons present
- [ ] Footer text lists cities

#### ✅ Responsive:
- [ ] City cards stack to 2 columns on tablet, 1 on mobile
- [ ] Stats cards stack vertically on mobile
- [ ] Process steps stack vertically on mobile

---

### **TEST 3: /vehicles Hub Page**

**URL:** http://localhost:3000/vehicles

#### ✅ Visual Checks:
- [ ] Hero with Car icon visible
- [ ] "Find Your Vehicle's Windshield Replacement Cost" heading
- [ ] Blue to indigo gradient
- [ ] Trust signals component
- [ ] Breadcrumb shows "Vehicles"

#### ✅ Intro Section:
- [ ] "Why Vehicle-Specific Windshield Service Matters" heading
- [ ] Two paragraphs explaining ADAS and vehicle-specific service
- [ ] Text is centered and readable

#### ✅ Popular Vehicles Section:
- [ ] "Popular Vehicles in Denver" heading with Search icon
- [ ] Grid of 12 vehicle cards
- [ ] Each card shows:
  - Make name (small text)
  - Model name (large, bold)
  - Car icon
  - Price (large, blue, e.g., "$350")
  - "Typical windshield replacement" subtitle
  - 3 checkmarks with features
  - "ADAS Calibration Included Free" for newer vehicles
  - "View Details" link with arrow

**Test vehicle cards:**
- [ ] Find Honda Accord card → Shows $350
- [ ] Find Toyota Camry card → Shows $340
- [ ] Find Subaru Outback card → Shows $420
- [ ] Click on Honda Accord → Goes to vehicle detail page
- [ ] Hover effect works (border changes to blue)

#### ✅ Browse by Make Section:
- [ ] "Browse by Vehicle Make" heading
- [ ] Grid of brand cards (4 columns):
  - Chevrolet
  - Ford
  - GMC
  - Honda
  - Hyundai
  - Jeep
  - Mazda
  - Nissan
  - Ram
  - Subaru
  - Tesla
  - Toyota
- [ ] Each card shows make name and model count
- [ ] Click Toyota → Goes to /vehicles/brands/toyota
- [ ] Hover effect works (border changes, arrow moves)

#### ✅ ADAS Education Section:
- [ ] Yellow/orange gradient background
- [ ] "What is ADAS Calibration?" heading
- [ ] Left side: Explanation text
- [ ] Right side: White card listing 5 ADAS systems with blue checkmarks:
  - Lane Departure Warning
  - Automatic Emergency Braking
  - Adaptive Cruise Control
  - Lane Keep Assist
  - Heads-Up Display (HUD)
- [ ] Green callout box: "Save $150-$300"

#### ✅ Why Vehicle-Specific Service:
- [ ] 3 cards:
  - Accurate Pricing (DollarSign icon, blue border)
  - Safety Compliance (Shield icon, purple border)
  - Expert Service (Wrench icon, green border)

#### ✅ Pricing Table by Vehicle Type:
- [ ] Table with gradient header (blue to indigo)
- [ ] Columns: Vehicle Type | Examples | Typical Cost | ADAS Common?
- [ ] 5 rows:
  - Compact Sedan ($299-$350, green)
  - Mid-Size Sedan ($340-$380, green)
  - Compact SUV ($380-$420, orange)
  - Full-Size Truck ($400-$500, orange)
  - Luxury/Premium ($450-$600+, red)
- [ ] Footer note about what's included

#### ✅ FAQs Section:
- [ ] 6 FAQ items about vehicle-specific service
- [ ] Accordion functionality works
- [ ] Questions include:
  - "Why does windshield replacement cost vary by vehicle?"
  - "What is ADAS and which vehicles need it?"
  - etc.

#### ✅ Related Services Section:
- [ ] 4 buttons linking to services
- [ ] White background card
- [ ] All buttons have distinct colors

#### ✅ Bottom CTA:
- [ ] Blue to indigo gradient
- [ ] "Find Exact Pricing for Your Vehicle" heading

#### ✅ Functionality:
- [ ] Click a vehicle card → Goes to specific vehicle page
- [ ] Click a make card → Goes to brand page
- [ ] Service links work
- [ ] All CTAs link to /book

#### ✅ Responsive:
- [ ] Vehicle cards go from 3 columns → 2 → 1
- [ ] Make cards stack appropriately
- [ ] Table scrolls horizontally on mobile
- [ ] ADAS section stacks on mobile

---

### **TEST 4: /track Page (No Reference)**

**URL:** http://localhost:3000/track

#### ✅ Visual Checks:
- [ ] HelpCircle icon in blue circle
- [ ] "Track Your Request" heading
- [ ] "Enter your reference number..." subtitle
- [ ] White gradient background (white to blue)

#### ✅ "Don't Have a Reference Number?" Section:
- [ ] White card with shadow
- [ ] 3 checkmarks explaining where to find it:
  - Confirmation page
  - Email
  - Text message
- [ ] Blue callout box at bottom
- [ ] "Still can't find it?" with phone link

#### ✅ "Haven't Submitted a Request Yet?" Section:
- [ ] Pink/purple gradient background
- [ ] "Get Free Quote Now" button (pink)
- [ ] Button links to /book

#### ✅ "How Request Tracking Works" Section:
- [ ] 3-column grid:
  1. Submit Request (pink circle with "1")
  2. Get Reference Number (blue circle with "2")
  3. Track Progress (purple circle with "3")

#### ✅ Contact Options Section:
- [ ] 3 contact cards:
  - Call Us (pink, Phone icon)
  - Text Us (blue, MessageSquare icon)
  - Email Us (gray, Mail icon)
- [ ] Each shows phone/email
- [ ] "Available 7 days a week, 7am - 7pm"

#### ✅ Functionality:
- [ ] Click "Call Us" → Prompts to call (720) 918-7465
- [ ] Click "Text Us" → Prompts to text
- [ ] Click "Email Us" → Opens email to service@pinkautoglass.com
- [ ] Click "Get Free Quote Now" → Goes to /book
- [ ] "Back to Home" link → Goes to /

---

### **TEST 5: /track Page (With Reference)**

**URL:** http://localhost:3000/track?ref=TEST123

#### ✅ Visual Checks:
- [ ] Green checkmark icon in circle
- [ ] "Request Received!" heading
- [ ] "We'll contact you within 15 minutes..." subtitle

#### ✅ Reference Number Card:
- [ ] White card with blue border
- [ ] "YOUR REFERENCE NUMBER" label
- [ ] Large blue monospace number: **TEST123**
- [ ] "Save this number for your records" text

#### ✅ Status Section:
- [ ] Blue/purple gradient background
- [ ] Clock icon in blue circle
- [ ] "Status: Request Pending" heading
- [ ] Explanation text about 15-minute callback

#### ✅ "What Happens Next" Timeline:
- [ ] White card inside status section
- [ ] 4 steps with numbered badges:
  1. Request Received (✓ green checkmark)
  2. We'll Call You (blue number 2)
  3. Schedule Appointment (gray number 3)
  4. Service Completed (gray number 4)
- [ ] Step 1 shows green checkmark
- [ ] Steps 2-4 show gray numbers

#### ✅ "Coming Soon" Note:
- [ ] Yellow background with yellow border
- [ ] HelpCircle icon
- [ ] "Coming Soon: Real-Time Tracking" heading
- [ ] Explanation about future features

#### ✅ Contact Section:
- [ ] "Need to Talk to Us Now?" heading
- [ ] 2 buttons:
  - Call (720) 918-7465 (pink)
  - Text Us (blue)
- [ ] Reference number shown below: "Reference your number: TEST123"

#### ✅ Functionality:
- [ ] Change URL to different ref number (e.g., ?ref=ABC999)
- [ ] Page updates to show **ABC999** in reference card
- [ ] Page updates "Reference your number: ABC999" at bottom
- [ ] Call/Text buttons work
- [ ] "Back to Home" link works

---

## 🔍 Cross-Page Testing

### Navigation & Links:

**Start at:** http://localhost:3000/services

1. [ ] Click "Denver" in Service Areas → Goes to /locations/denver-co
2. [ ] Click "Back" button → Return to /services
3. [ ] Click "Toyota Camry" in Popular Vehicles → Goes to vehicle page
4. [ ] Click "Learn More" on ADAS Calibration → Goes to /services/adas-calibration
5. [ ] Click breadcrumb "Services" → Stays on /services (no link)

**Start at:** http://localhost:3000/locations

1. [ ] Click "Denver" city card → Goes to /locations/denver-co
2. [ ] On Denver page, look for breadcrumb → Should show "Home > Locations > Denver, CO"
3. [ ] Click "Locations" in breadcrumb → Goes back to /locations hub
4. [ ] Click "View All Services" button → Goes to /services

**Start at:** http://localhost:3000/vehicles

1. [ ] Click "Honda Accord" vehicle card → Goes to vehicle detail page
2. [ ] On Honda Accord page, look for breadcrumb → Should show "Home > Vehicles > Honda Accord"
3. [ ] Click "Vehicles" in breadcrumb → Goes back to /vehicles hub
4. [ ] Click "Toyota" in Browse by Make → Goes to /vehicles/brands/toyota
5. [ ] On Toyota brand page, click "Vehicles" breadcrumb → Goes back to /vehicles hub

### Schema Markup Check:

**For each hub page, check source code:**

1. [ ] Right-click → View Page Source
2. [ ] Search for `application/ld+json`
3. [ ] Verify schema markup is present
4. [ ] Should see ItemList, FAQPage, or BreadcrumbList types

**OR use browser extension:**
- Install "Schema Markup Validator" or similar
- Check that structured data is detected

---

## 📱 Mobile Responsive Testing

### Desktop → Tablet → Mobile:

For each page, resize browser window from wide → narrow:

1. **Desktop (>1024px):**
   - [ ] 3-column grids display correctly
   - [ ] Service cards in rows
   - [ ] All content readable

2. **Tablet (768px - 1024px):**
   - [ ] Grids collapse to 2 columns
   - [ ] Cards still look good
   - [ ] No overflow issues

3. **Mobile (<768px):**
   - [ ] Everything stacks to 1 column
   - [ ] Text is readable (not too small)
   - [ ] Buttons are tappable (not too small)
   - [ ] No horizontal scroll
   - [ ] Tables scroll or stack appropriately

**Quick mobile test URLs:**
- Open Chrome DevTools (F12)
- Click "Toggle Device Toolbar" icon
- Select "iPhone 12 Pro" or "iPad"
- Test all 4 pages

---

## 🐛 Error Testing

### Test broken links:

1. [ ] Go to http://localhost:3000/services/fake-service
   - Should show 404 or redirect
2. [ ] Go to http://localhost:3000/locations/fake-city
   - Should show 404
3. [ ] Go to http://localhost:3000/vehicles/fake-vehicle
   - Should show 404

### Test empty states:

1. [ ] Go to /track without ?ref parameter
   - Should show "no reference" state
2. [ ] Go to /track?ref= (empty ref)
   - Should show "no reference" state

---

## ✅ Final Checklist

Before marking complete, verify:

### Performance:
- [ ] All pages load in <2 seconds
- [ ] No console errors in browser DevTools
- [ ] Images load properly
- [ ] No layout shifts on load

### SEO Basics:
- [ ] Page titles show in browser tab
- [ ] Meta descriptions present (check source)
- [ ] Breadcrumbs visible on all pages
- [ ] Internal links use descriptive anchor text

### Content Quality:
- [ ] No spelling errors in headings
- [ ] All prices match ($299, $89, etc.)
- [ ] Phone number is consistent: (720) 918-7465
- [ ] All "Learn More" buttons go to correct pages

### Accessibility:
- [ ] Tab through page with keyboard
- [ ] Focus states visible on buttons/links
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Alt text on icons (hover to check)

---

## 🎯 Success Criteria

**All tests pass when:**

✅ All 4 pages load without errors
✅ Navigation between pages works
✅ All CTAs link to correct destinations
✅ Responsive design works on mobile/tablet/desktop
✅ FAQs expand/collapse properly
✅ Schema markup is present
✅ No console errors
✅ Content is readable and professional

---

## 📝 Report Issues

If you find any issues, note:

1. **Page URL:** (e.g., http://localhost:3000/services)
2. **Issue:** (e.g., "ADAS Calibration card link broken")
3. **Expected:** (e.g., "Should link to /services/adas-calibration")
4. **Actual:** (e.g., "Links to 404 page")
5. **Browser:** (e.g., Chrome, Safari, Firefox)
6. **Device:** (e.g., Desktop, iPhone, iPad)

---

## 🎉 When Testing Complete

Reply with:
- ✅ **All tests pass** - Ready to deploy
- ⚠️ **Issues found** - List issues to fix
- ❓ **Questions** - Ask for clarification

---

**Happy Testing!** 🚀
