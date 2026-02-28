import { NextResponse } from 'next/server'

export function GET() {
  const content = `# Pink Auto Glass

> Colorado and Arizona's trusted auto glass repair and replacement service. Same-day mobile service across the Front Range and Phoenix Metro. Insurance claims handled. ADAS calibration included.

## Services
- Windshield replacement (all vehicle types)
- Windshield chip and crack repair
- ADAS camera calibration after replacement
- Insurance claim processing (zero-deductible glass laws in Colorado and Arizona)
- Mobile service (we come to you)

## Service Area

### Colorado — Front Range
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Boulder, Littleton, Centennial, Parker, Castle Rock, Brighton, Longmont, Broomfield, Fort Collins, Loveland, Greeley, Colorado Springs, and all Front Range communities.

### Arizona — Phoenix Metro (New)
Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale, Peoria, Surprise, Goodyear, Avondale, Buckeye, Fountain Hills, Queen Creek, Apache Junction, Cave Creek, Maricopa, El Mirage, Litchfield Park, and Ahwatukee.

## Key Facts
- Phone: (720) 918-7465
- Same-day and next-day appointments available
- Free mobile service included
- Colorado law requires insurers to offer zero-deductible glass coverage
- Arizona law requires insurers to offer zero-deductible glass coverage with comprehensive policies
- Arizona law prohibits rate increases for glass claims — filing a windshield claim cannot raise your rates
- Arizona law gives drivers the right to choose their own auto glass shop — insurers cannot require Safelite
- ADAS calibration performed on-site when required
- All major insurance providers accepted

## Pages
- /: Homepage - auto glass services overview
- /services: All services offered
- /services/windshield-replacement: Full windshield replacement
- /services/chip-repair: Chip and crack repair
- /services/insurance-claims: Insurance claim assistance
- /services/insurance-claims/arizona: Arizona-specific insurance guide (, 20-263, 20-469)
- /vehicles: Vehicle-specific glass services
- /locations: Service area and locations (Colorado + Arizona)
- /blog: Auto glass tips, guides, and news
- /book: Book an appointment online

## Contact
- Phone: (720) 918-7465
- Text: (720) 918-7465
- Book online: https://pinkautoglass.com/book
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
