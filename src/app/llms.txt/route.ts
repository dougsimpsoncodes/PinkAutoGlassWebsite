import { NextResponse } from 'next/server'

export function GET() {
  const content = `# Pink Auto Glass

> Denver's trusted auto glass repair and replacement service. Same-day mobile service across the Front Range. Insurance claims handled. ADAS calibration included.

## Services
- Windshield replacement (all vehicle types)
- Windshield chip and crack repair
- ADAS camera calibration after replacement
- Insurance claim processing (Colorado zero-deductible glass law)
- Mobile service (we come to you)

## Service Area
Denver, Aurora, Lakewood, Arvada, Westminster, Thornton, Boulder, Littleton, Centennial, Parker, Castle Rock, Brighton, Longmont, Broomfield, and all Front Range communities in Colorado.

## Key Facts
- Phone: (720) 918-7465
- Same-day and next-day appointments available
- Free mobile service included
- Colorado law (CRS 10-4-613) requires insurers to offer zero-deductible glass coverage
- ADAS calibration performed on-site when required
- All major insurance providers accepted

## Pages
- /: Homepage - auto glass services overview
- /services: All services offered
- /services/windshield-replacement: Full windshield replacement
- /services/chip-repair: Chip and crack repair
- /services/insurance-claims: Insurance claim assistance
- /vehicles: Vehicle-specific glass services
- /locations: Service area and locations
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
