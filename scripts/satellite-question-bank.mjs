#!/usr/bin/env node
/**
 * Generates src/data/questions.ts for all 18 remaining satellite sites
 * (windshield-denver already done manually as the pilot).
 *
 * Run: node scripts/satellite-question-bank.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Repo paths are resolved from satellite-inventory.json. SITES_DIR is kept as
// a fallback for sites that don't exist in the inventory yet (legacy behaviour).
const SITES_DIR = '/Users/dougsimpson/clients/pink-auto-glass/sites'
const INVENTORY_PATH = new URL('../data/satellite-inventory.json', import.meta.url).pathname
let inventoryMap = {}
try {
  const { readFileSync } = await import('fs')
  const inv = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))
  inventoryMap = Object.fromEntries(inv.satellites.map(s => [s.dir, s.repoPath]))
} catch { /* inventory not found — fall back to SITES_DIR */ }

// ── Site definitions ─────────────────────────────────────────────────────────

const CO_PHONE = '(720) 918-7465'
const AZ_PHONE = '(480) 712-7465'

const sites = [
  // CO Front Range
  {
    dir: 'mobile-windshield-denver',
    url: 'https://mobilewindshielddenver.com',
    name: 'Mobile Windshield Denver',
    type: 'co',
    city: 'Denver',
    citySlug: 'denver',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Denver Mobile Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Denver drivers have about mobile windshield repair and replacement.',
    questionsMetaTitle: 'Mobile Windshield Questions | Denver Guide',
    questionsMetaDescription: 'Common questions about mobile windshield repair and replacement in Denver — insurance, cost, how long it takes, and how mobile service works.',
  },
  {
    dir: 'windshield-chip-repair-denver',
    url: 'https://windshieldchiprepairdenver.com',
    name: 'Windshield Chip Repair Denver',
    type: 'co',
    city: 'Denver',
    citySlug: 'denver',
    phone: CO_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Denver Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Denver drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Denver Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Denver — can it be repaired, how long it takes, insurance coverage, and repair vs replacement.',
  },
  {
    dir: 'windshield-chip-repair-boulder',
    url: 'https://windshieldchiprepairboulder.com',
    name: 'Windshield Chip Repair Boulder',
    type: 'co',
    city: 'Boulder',
    citySlug: 'boulder',
    phone: CO_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Boulder Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Boulder drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Boulder Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Boulder — can it be repaired, how long it takes, insurance coverage, and repair vs replacement.',
  },
  {
    dir: 'aurora-windshield',
    url: 'https://aurorawindshield.com',
    name: 'Aurora Windshield',
    type: 'co',
    city: 'Aurora',
    citySlug: 'aurora',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Aurora Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Aurora drivers have about windshield repair and replacement.',
    questionsMetaTitle: 'Windshield Questions Answered | Aurora CO Guide',
    questionsMetaDescription: 'Common questions about windshield repair and replacement in Aurora, CO — insurance coverage, cost, how long it takes, and more.',
  },
  {
    dir: 'coloradospringswindshield',
    url: 'https://coloradospringswindshield.com',
    name: 'Colorado Springs Windshield',
    type: 'co',
    city: 'Colorado Springs',
    citySlug: 'colorado-springs',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Colorado Springs Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Colorado Springs drivers have about windshield repair and replacement.',
    questionsMetaTitle: 'Windshield Questions Answered | Colorado Springs Guide',
    questionsMetaDescription: 'Common questions about windshield repair and replacement in Colorado Springs — insurance coverage, cost, how long it takes, and more.',
  },
  {
    dir: 'autoglasscoloradosprings',
    url: 'https://autoglasscoloradosprings.com',
    name: 'Auto Glass Colorado Springs',
    type: 'co',
    city: 'Colorado Springs',
    citySlug: 'colorado-springs',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Colorado Springs Auto Glass Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Colorado Springs drivers have about windshield and auto glass repair.',
    questionsMetaTitle: 'Auto Glass Questions | Colorado Springs Guide',
    questionsMetaDescription: 'Common questions about windshield and auto glass repair in Colorado Springs — insurance, cost, how long it takes, and more.',
  },
  {
    dir: 'mobilewindshieldcoloradosprings',
    url: 'https://mobilewindshieldcoloradosprings.com',
    name: 'Mobile Windshield Colorado Springs',
    type: 'co',
    city: 'Colorado Springs',
    citySlug: 'colorado-springs',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Colorado Springs Mobile Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Colorado Springs drivers have about mobile windshield service.',
    questionsMetaTitle: 'Mobile Windshield Questions | Colorado Springs Guide',
    questionsMetaDescription: 'Common questions about mobile windshield repair in Colorado Springs — insurance coverage, cost, how mobile service works, and more.',
  },
  {
    dir: 'windshieldreplacementfortcollins',
    url: 'https://windshieldreplacementfortcollins.com',
    name: 'Windshield Replacement Fort Collins',
    type: 'co',
    city: 'Fort Collins',
    citySlug: 'fort-collins',
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Fort Collins Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Fort Collins drivers have about windshield repair and replacement.',
    questionsMetaTitle: 'Windshield Questions Answered | Fort Collins Guide',
    questionsMetaDescription: 'Common questions about windshield repair and replacement in Fort Collins — insurance coverage, cost, how long it takes, and more.',
  },
  // AZ Phoenix metro
  {
    dir: 'windshield-chip-repair-phoenix',
    url: 'https://windshieldchiprepairphoenix.com',
    name: 'Windshield Chip Repair Phoenix',
    type: 'az',
    city: 'Phoenix',
    citySlug: 'phoenix',
    phone: AZ_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Phoenix Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Phoenix drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Phoenix AZ Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Phoenix — AZ insurance coverage, heat effects, how long it takes, and repair vs replacement.',
  },
  {
    dir: 'mobile-windshield-phoenix',
    url: 'https://mobilewindshieldphoenix.com',
    name: 'Mobile Windshield Phoenix',
    type: 'az',
    city: 'Phoenix',
    citySlug: 'phoenix',
    phone: AZ_PHONE,
    chipOnly: false,
    mobileOnly: true,
    questionsPageHeading: 'Phoenix Mobile Windshield Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Phoenix drivers have about mobile windshield replacement.',
    questionsMetaTitle: 'Mobile Windshield Questions | Phoenix AZ Guide',
    questionsMetaDescription: 'Common questions about mobile windshield service in Phoenix — insurance coverage, heat damage, cost, and how mobile service works in the Valley.',
  },
  {
    dir: 'windshield-chip-repair-mesa',
    url: 'https://windshieldchiprepairmesa.com',
    name: 'Windshield Chip Repair Mesa',
    type: 'az',
    city: 'Mesa',
    citySlug: 'mesa',
    phone: AZ_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Mesa Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Mesa drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Mesa AZ Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Mesa — AZ insurance coverage, heat effects, how long it takes, and repair vs replacement.',
  },
  {
    dir: 'windshield-chip-repair-tempe',
    url: 'https://windshieldchiprepairtempe.com',
    name: 'Windshield Chip Repair Tempe',
    type: 'az',
    city: 'Tempe',
    citySlug: 'tempe',
    phone: AZ_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Tempe Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Tempe drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Tempe AZ Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Tempe — AZ insurance coverage, heat effects, how long it takes, and repair vs replacement.',
  },
  {
    dir: 'windshield-chip-repair-scottsdale',
    url: 'https://windshieldchiprepairscottsdale.com',
    name: 'Windshield Chip Repair Scottsdale',
    type: 'az',
    city: 'Scottsdale',
    citySlug: 'scottsdale',
    phone: AZ_PHONE,
    chipOnly: true,
    mobileOnly: true,
    questionsPageHeading: 'Scottsdale Windshield Chip Repair Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Scottsdale drivers have about windshield chip repair.',
    questionsMetaTitle: 'Windshield Chip Repair Questions | Scottsdale AZ Guide',
    questionsMetaDescription: 'Common questions about windshield chip repair in Scottsdale — AZ insurance coverage, heat effects, how long it takes, and repair vs replacement.',
  },
  // National / price-intent
  {
    dir: 'windshield-cost-calculator',
    url: 'https://windshieldcostcalculator.com',
    name: 'Windshield Cost Calculator',
    type: 'national',
    city: null,
    citySlug: null,
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Windshield Replacement Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions drivers have about windshield replacement cost and coverage.',
    questionsMetaTitle: 'Windshield Replacement Questions | Cost & Coverage Guide',
    questionsMetaDescription: 'Common questions about windshield replacement cost, insurance coverage, how long it takes, and whether chip repair is worth it.',
  },
  {
    dir: 'windshield-price-compare',
    url: 'https://windshieldpricecompare.com',
    name: 'Windshield Price Compare',
    type: 'national',
    city: null,
    citySlug: null,
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Windshield Replacement Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions drivers have when comparing windshield replacement options and pricing.',
    questionsMetaTitle: 'Windshield Price Questions | Comparison Guide',
    questionsMetaDescription: 'Common questions about windshield replacement pricing, insurance coverage, how long it takes, and whether chip repair is worth it.',
  },
  {
    dir: 'new-windshield-cost',
    url: 'https://newwindshieldcost.com',
    name: 'New Windshield Cost',
    type: 'national',
    city: null,
    citySlug: null,
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Windshield Cost Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions drivers have about the cost of a new windshield.',
    questionsMetaTitle: 'Windshield Cost Questions | New Windshield Guide',
    questionsMetaDescription: 'Common questions about windshield replacement cost, insurance coverage, chip repair savings, and what drives the price.',
  },
  {
    dir: 'windshield-cost-phoenix',
    url: 'https://windshieldcostphoenix.com',
    name: 'Windshield Cost Phoenix',
    type: 'az',
    city: 'Phoenix',
    citySlug: 'phoenix',
    phone: AZ_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Phoenix Windshield Cost Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions Phoenix drivers have about windshield replacement cost.',
    questionsMetaTitle: 'Windshield Cost Questions | Phoenix AZ Guide',
    questionsMetaDescription: 'Common questions about windshield replacement cost in Phoenix — AZ insurance coverage, heat damage, pricing, and more.',
  },
  {
    dir: 'new-windshield-near-me',
    url: 'https://newwindshieldnearme.com',
    name: 'New Windshield Near Me',
    type: 'national',
    city: null,
    citySlug: null,
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Windshield Replacement Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions drivers have when searching for windshield replacement near them.',
    questionsMetaTitle: 'Windshield Questions | Find Replacement Near You',
    questionsMetaDescription: 'Common questions about finding windshield replacement near you — cost, insurance, how long it takes, and chip repair vs full replacement.',
  },
  {
    dir: 'cheapest-windshield',
    url: 'https://cheapestwindshieldnearme.com',
    name: 'Cheapest Windshield Near Me',
    type: 'national',
    city: null,
    citySlug: null,
    phone: CO_PHONE,
    chipOnly: false,
    mobileOnly: false,
    questionsPageHeading: 'Windshield Replacement Questions Answered',
    questionsPageIntro: 'Straight answers to the most common questions drivers have about getting the best price on windshield replacement.',
    questionsMetaTitle: 'Windshield Cost Questions | Best Price Guide',
    questionsMetaDescription: 'Common questions about windshield replacement cost and coverage — how to pay $0 with insurance, chip repair savings, and what drives pricing.',
  },
]

// ── Content generators ────────────────────────────────────────────────────────

function coQuestions(site) {
  const { city, citySlug, phone, chipOnly, mobileOnly } = site

  const isColoradoSprings = city === 'Colorado Springs'
  const stateNote = 'Colorado law (CRS 10-4-613)'
  const weatherNote = isColoradoSprings
    ? "Colorado Springs sits at over 6,000 feet — even higher than Denver — with dramatic Pikes Peak weather patterns including daily temperature swings and spring hailstorms."
    : city === 'Fort Collins'
    ? "Fort Collins sees the same Front Range temperature swings as Denver, plus wind from Horsetooth Reservoir that can drive rock debris across Highway 287 and I-25."
    : city === 'Boulder'
    ? "Boulder's canyon roads, especially Boulder Canyon (CO-119) and Left Hand Canyon, constantly shed rock debris onto windshields. Add the 40°F daily temperature swings and chips spread fast."
    : city === 'Aurora'
    ? "Aurora's I-70 and I-225 corridors are chip hotspots, and the open plains east of Aurora mean more wind-driven debris than most Denver suburbs. Hail hits Aurora hard too — it's directly in the Front Range hail corridor."
    : "Denver's I-70 and I-25 construction zones throw constant rock debris, and the 300+ days of high-altitude sunshine weaken resin bonds faster than at sea level."

  const q1 = {
    slug: `does-insurance-cover-windshield-replacement-${citySlug}`,
    question: `Does insurance cover windshield replacement in ${city}?`,
    directAnswer: `Yes — in most cases. ${stateNote} requires every auto insurer to offer zero-deductible glass coverage. If you have comprehensive insurance with the glass add-on, you pay $0 for chip repairs and often $0 for full replacements.`,
    detail: [
      `Colorado stands out from most states because the law mandates that insurers offer a zero-deductible option for glass claims. Filing a windshield claim cannot legally raise your premium — it is treated as a no-fault event under state law.`,
      `Most major carriers serving ${city} — State Farm, Progressive, GEICO, American Family, and USAA — include zero-deductible glass coverage as either a standard benefit or an inexpensive add-on to your comprehensive policy.`,
      `You have the right to choose your own repair shop under Colorado law. When you contact Pink Auto Glass, we verify your coverage, handle the insurance paperwork, and bill your insurer directly. Most ${city} drivers pay nothing out of pocket.`,
    ],
    ctaHeadline: `Get a free quote — we'll check your coverage and handle the claim`,
    relatedSlugs: chipOnly
      ? [
          `windshield-chip-repair-cost-${citySlug}-2026`,
          `how-long-does-windshield-chip-repair-take-${citySlug}`,
          `mobile-windshield-replacement-${citySlug}`,
        ]
      : [
          `windshield-replacement-cost-${citySlug}-2026`,
          `how-long-does-windshield-replacement-take-${citySlug}`,
          `mobile-windshield-replacement-${citySlug}`,
        ],
    metaTitle: `Does Insurance Cover Windshield Replacement in ${city}?`,
    metaDescription: `Colorado law (CRS 10-4-613) requires insurers to offer zero-deductible glass coverage. Most ${city} drivers pay $0. Learn what your policy covers and how to file a claim.`,
    lastUpdated: 'June 2026',
  }

  const q2_replacement = {
    slug: `how-long-does-windshield-replacement-take-${citySlug}`,
    question: `How long does windshield replacement take in ${city}?`,
    directAnswer: `A full windshield replacement takes 60–90 minutes from start to finish. Chip repair is faster — typically 30–45 minutes. Both services are completed at your location by a certified mobile technician.`,
    detail: [
      `Most of that 60–90 minutes is hands-on installation time. The technician removes the damaged windshield, primes the frame, installs the new glass with urethane adhesive, and inspects the seal. Modern urethane cures in 30–60 minutes under normal conditions.`,
      `If your vehicle has ADAS systems — lane departure warning, forward collision alerts, automatic emergency braking — the camera mounted to your windshield requires recalibration after replacement. Calibration adds 30–60 minutes and cannot be skipped without risking system malfunction.`,
      weatherNote,
    ],
    ctaHeadline: `Same-day mobile service in ${city} — we come to you`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `mobile-windshield-replacement-${citySlug}`,
      `windshield-replacement-cost-${citySlug}-2026`,
    ],
    metaTitle: `How Long Does Windshield Replacement Take in ${city}?`,
    metaDescription: `Full windshield replacement takes 60–90 minutes. Chip repair takes 30–45 minutes. Mobile service at your home, office, or parking lot in ${city}.`,
    lastUpdated: 'June 2026',
  }

  const q2_chip = {
    slug: `how-long-does-windshield-chip-repair-take-${citySlug}`,
    question: `How long does windshield chip repair take in ${city}?`,
    directAnswer: `Windshield chip repair takes 30–45 minutes from start to finish. A mobile technician comes to your location in ${city}, injects UV-cure resin into the chip, and you drive away with the repair complete.`,
    detail: [
      `The process is straightforward: the technician cleans the chip, attaches an injector tool, draws out air from the void under vacuum, and forces resin into the break. A UV lamp cures the resin in minutes. The repair stops the chip from spreading and restores most of the structural integrity.`,
      `Results depend on chip size and type. Chips smaller than a quarter are almost always repairable in one appointment. Star breaks with 5–8 cracks can often be repaired but may require slightly longer. Chips that have already spread beyond 6 inches require full replacement.`,
      weatherNote,
    ],
    ctaHeadline: `Same-day chip repair in ${city} — we come to you`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
      `mobile-windshield-replacement-${citySlug}`,
    ],
    metaTitle: `How Long Does Windshield Chip Repair Take in ${city}?`,
    metaDescription: `Windshield chip repair takes 30–45 minutes. Mobile service at your location in ${city}. Most chip repairs are $0 with Colorado insurance.`,
    lastUpdated: 'June 2026',
  }

  const q3 = {
    slug: `windshield-replacement-cost-${citySlug}-2026`,
    question: `How much does windshield replacement cost in ${city} in 2026?`,
    directAnswer: `Without insurance, windshield replacement in ${city} typically costs $200–$450 for standard vehicles, $350–$700 for vehicles with ADAS cameras or heated glass, and $600–$1,200+ for luxury or specialty models. With Colorado's zero-deductible glass law, most insured drivers pay $0.`,
    detail: [
      `The biggest variable is your vehicle. A basic sedan windshield is far cheaper than one with embedded rain sensors, a heads-up display projection area, or a forward-facing camera mount. ADAS calibration — required after any replacement on equipped vehicles — adds $100–$250 to the total.`,
      `OEM glass matches factory specs exactly. For ADAS-equipped vehicles, OEM is recommended because aftermarket glass may have slight optical variances that affect camera calibration accuracy. Pink Auto Glass uses OEM or OEM-equivalent glass on every job.`,
      `The fastest way to confirm your exact cost is to request a quote — we look up your specific year, make, model, and trim to give you a real price. If you have insurance, we check your coverage on the same call.`,
    ],
    ctaHeadline: `Get your exact quote — we look up your vehicle and check your coverage`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-long-does-windshield-replacement-take-${citySlug}`,
      `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
    ],
    metaTitle: `Windshield Replacement Cost in ${city} 2026`,
    metaDescription: `${city} windshield replacement costs $200–$450 for standard vehicles. ADAS-equipped vehicles run higher. Colorado zero-deductible law means most insured drivers pay $0.`,
    lastUpdated: 'June 2026',
  }

  // Q3 variant for chip-only sites
  const q3_chip = {
    slug: `windshield-chip-repair-cost-${citySlug}-2026`,
    question: `How much does windshield chip repair cost in ${city} in 2026?`,
    directAnswer: `Windshield chip repair in ${city} typically costs $60–$120 without insurance. With Colorado's zero-deductible glass law, most chip repairs are $0 with comprehensive coverage — insurers prefer repair over replacement because it costs far less.`,
    detail: [
      `Colorado law (CRS 10-4-613) requires insurers to offer zero-deductible glass coverage. For chip repairs — which cost insurers $60–$100 — nearly every insurer with comprehensive coverage pays the full cost with no deductible, no rate increase, and no claim on your record.`,
      `Without insurance, prices vary by chip type and size. A single small chip is at the low end ($60–$80). Multiple chips or large star-break repairs run $100–$120. If a chip has already spread to a crack longer than 6 inches, full replacement is required and chip repair pricing no longer applies.`,
      `Pink Auto Glass provides mobile chip repair — we come to your location in ${city}, complete the repair in 30–45 minutes, and handle insurance billing if applicable.`,
    ],
    ctaHeadline: `Get a free chip repair quote — most ${city} drivers pay $0 with insurance`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-long-does-windshield-chip-repair-take-${citySlug}`,
      `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
    ],
    metaTitle: `Windshield Chip Repair Cost in ${city} 2026`,
    metaDescription: `${city} chip repair costs $60–$120 without insurance. With Colorado's zero-deductible glass law, most insured drivers pay $0 for chip repairs.`,
    lastUpdated: 'June 2026',
  }

  const q4 = {
    slug: `can-i-drive-with-a-cracked-windshield-in-colorado`,
    question: `Can I drive with a cracked windshield in Colorado?`,
    directAnswer: `Technically yes, but Colorado law (CRS 42-4-228) prohibits driving with any damage that impairs the driver's clear vision — a crack in your line of sight can result in a fix-it ticket. More critically, a cracked windshield weakens your vehicle's rollover protection by roughly 30%.`,
    detail: [
      `A chip or crack in the driver's direct field of view is a moving violation under state law. A chip outside the vision line is lower legal risk, but both create structural vulnerability. Traffic enforcement along Colorado's Front Range has increased for this violation in recent years.`,
      `Your windshield contributes roughly 30% of your vehicle's roof strength in a rollover. A cracked windshield — especially one with a crack that crosses the glass — can fail on impact, increasing the risk of roof crush. This structural argument matters more than the ticket risk.`,
      `Cracks grow fast in Colorado's climate. Daily temperature swings of 40°F or more cause glass to expand and contract repeatedly, widening hairline fractures. A two-inch chip in October can become a 12-inch crack by November. Chip repair is possible up to about 6 inches — after that, full replacement is the only option.`,
    ],
    ctaHeadline: `Don't wait for it to spread — same-day mobile service in ${city}`,
    relatedSlugs: chipOnly
      ? [
          `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
          `windshield-chip-repair-cost-${citySlug}-2026`,
          `does-insurance-cover-windshield-replacement-${citySlug}`,
        ]
      : [
          `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
          `windshield-replacement-cost-${citySlug}-2026`,
          `does-insurance-cover-windshield-replacement-${citySlug}`,
        ],
    metaTitle: `Can I Drive With a Cracked Windshield in Colorado?`,
    metaDescription: `Colorado law prohibits driving with damage that impairs vision. A cracked windshield also weakens roof structure by ~30%. Know when repair vs replacement is needed.`,
    lastUpdated: 'June 2026',
  }

  const q5 = {
    slug: `mobile-windshield-replacement-${citySlug}`,
    question: `How does mobile windshield replacement work in ${city}?`,
    directAnswer: `A certified technician comes to your location — home, office, parking lot, anywhere in the ${city} area — and completes the repair or replacement on-site. You never drive to a shop. Mobile service is included at no extra charge.`,
    detail: [
      `Once you book, we confirm your address and schedule a 2-hour arrival window. The technician arrives in a fully stocked service vehicle with the correct glass for your vehicle already on board. No waiting for parts, no rescheduling for stock.`,
      `The technician handles everything: removing the damaged windshield, cleaning the frame, applying primer, installing the new glass, and inspecting the seal. After installation, they walk you through the cure time — typically 30–60 minutes before driving — and leave written warranty documentation.`,
      `Pink Auto Glass covers ${city} and surrounding communities throughout the Colorado Front Range. Call or book online to confirm service at your specific address.`,
    ],
    ctaHeadline: `Book mobile service — we come to you anywhere in the ${city} area`,
    relatedSlugs: chipOnly
      ? [
          `how-long-does-windshield-chip-repair-take-${citySlug}`,
          `does-insurance-cover-windshield-replacement-${citySlug}`,
          `windshield-chip-repair-cost-${citySlug}-2026`,
        ]
      : [
          `how-long-does-windshield-replacement-take-${citySlug}`,
          `does-insurance-cover-windshield-replacement-${citySlug}`,
          `windshield-replacement-cost-${citySlug}-2026`,
        ],
    metaTitle: `Mobile Windshield Replacement ${city} | We Come to You`,
    metaDescription: `Pink Auto Glass sends a certified technician to your home, office, or parking lot in ${city}. No shop visit needed. Same-day mobile service at no extra charge.`,
    lastUpdated: 'June 2026',
  }

  const q6_prevent = {
    slug: `does-windshield-chip-repair-prevent-replacement-${citySlug}`,
    question: `Does windshield chip repair prevent the need for replacement in ${city}?`,
    directAnswer: `Yes — if you act quickly. A chip smaller than a quarter can almost always be repaired in 30–45 minutes, preserving your original windshield. Once a chip spreads into a crack longer than 6 inches, repair is no longer possible and full replacement is required.`,
    detail: [
      `Chip repair works by injecting UV-cured resin into the void left by the impact. The resin bonds the glass, stops the crack from propagating, and restores most of the structural integrity. The repair is usually invisible from the driver's seat.`,
      `Colorado's environment accelerates crack spread. Temperature swings of 40°F or more in a single day cause glass to expand and contract, widening hairline fractures. The longer you wait, the more likely a repairable chip becomes an unrepairable crack.`,
      `Colorado's zero-deductible glass law means chip repair is typically $0 with insurance — even on policies that have a deductible for full replacement. Getting a chip repaired early costs your insurer far less than replacement, which is why carriers support the repair-first approach.`,
    ],
    ctaHeadline: `Act now before it spreads — same-day chip repair in ${city}`,
    relatedSlugs: [
      `can-i-drive-with-a-cracked-windshield-in-colorado`,
      chipOnly ? `windshield-chip-repair-cost-${citySlug}-2026` : `windshield-replacement-cost-${citySlug}-2026`,
      `does-insurance-cover-windshield-replacement-${citySlug}`,
    ],
    metaTitle: `Does Windshield Chip Repair Prevent Replacement? ${city} Guide`,
    metaDescription: `Chips smaller than a quarter can be repaired in 30–45 min, preventing costly replacement. Colorado temperature swings make chips spread fast. Most repairs are $0 with insurance.`,
    lastUpdated: 'June 2026',
  }

  if (chipOnly) {
    return [q1, q2_chip, q3_chip, q4, q5, q6_prevent]
  }
  return [q1, q2_replacement, q3, q4, q5, q6_prevent]
}

function azQuestions(site) {
  const { city, citySlug, phone, chipOnly } = site
  const stateNote = 'Arizona law (ARS 20-263)'

  const heatNote = city === 'Scottsdale'
    ? "Scottsdale temperatures regularly exceed 110°F in July and August. Parking on asphalt in Scottsdale Fashion Square or the Quarter can push dash temperatures above 160°F, which means the glass is under extreme thermal stress whenever you park."
    : city === 'Mesa'
    ? "Mesa's flat grid and lack of shade trees mean cars sit in direct sun all day. Summer temperatures push glass surface temperatures well past 150°F. Even a 10-minute drive from a shaded garage to a parking lot creates a temperature differential that stresses existing chips."
    : city === 'Tempe'
    ? "Tempe's urban heat island effect — amplified by ASU's dense campus and Mill Avenue's paved surfaces — pushes summer temperatures higher than surrounding areas. Chips in your windshield face constant expansion stress from the moment you park."
    : "Phoenix's summer temperatures regularly exceed 115°F. The extreme heat creates constant thermal expansion cycles in your windshield, making even small chips spread faster than in any other major U.S. metro."

  const q1 = {
    slug: `does-insurance-cover-windshield-replacement-${citySlug}`,
    question: `Does insurance cover windshield replacement in ${city}?`,
    directAnswer: `Yes — in most cases. ${stateNote} requires every auto insurer to offer zero-deductible glass coverage for windshield damage. If you have comprehensive insurance with the glass add-on, you pay $0 for chip repairs and often $0 for full replacements.`,
    detail: [
      `Arizona is one of a handful of states that mandates zero-deductible windshield coverage. The law requires insurers to make this available on any comprehensive policy. Filing a glass claim under this coverage cannot legally raise your rates.`,
      `Major carriers in the Phoenix metro — State Farm, Progressive, GEICO, Farmers, and USAA — typically include zero-deductible glass coverage as standard or as an inexpensive add-on. If you have full coverage or comprehensive, you likely qualify.`,
      `You have the right to choose your own repair shop. When you contact Pink Auto Glass, we verify your Arizona coverage, handle the claim paperwork, and bill your insurer directly. Most ${city} drivers pay nothing out of pocket.`,
    ],
    ctaHeadline: `Get a free quote — we'll check your AZ coverage and handle the claim`,
    relatedSlugs: chipOnly
      ? [
          `windshield-chip-repair-cost-${citySlug}-2026`,
          `how-heat-affects-windshields-in-${citySlug}`,
          `mobile-windshield-replacement-${citySlug}`,
        ]
      : [
          `windshield-replacement-cost-${citySlug}-2026`,
          `how-heat-affects-windshields-in-${citySlug}`,
          `mobile-windshield-replacement-${citySlug}`,
        ],
    metaTitle: `Does Insurance Cover Windshield Replacement in ${city}?`,
    metaDescription: `Arizona law (ARS 20-263) requires zero-deductible glass coverage. Most ${city} drivers pay $0. Learn what your policy covers and how to file a claim.`,
    lastUpdated: 'June 2026',
  }

  const q2_cost = {
    slug: `windshield-replacement-cost-${citySlug}-2026`,
    question: `How much does windshield replacement cost in ${city} in 2026?`,
    directAnswer: `Without insurance, windshield replacement in ${city} typically costs $200–$500 for standard vehicles, $350–$750 for vehicles with ADAS cameras, and $600–$1,400+ for luxury or specialty models. With Arizona's zero-deductible glass law, most insured drivers pay $0.`,
    detail: [
      `The biggest variable is your vehicle. ADAS systems — lane departure warning, forward collision alerts — require windshield camera recalibration after replacement, adding $100–$250 to the total. Heat-resistant glass designed for desert climates may also cost more than standard OEM.`,
      `Phoenix metro pricing tends to run slightly higher than the national average because demand is high (heat and monsoon season drive year-round volume) and quality glass with UV-blocking properties commands a premium. Pink Auto Glass uses OEM or OEM-equivalent glass on every job.`,
      `The fastest way to confirm your exact price is to request a quote — we look up your specific vehicle and check your insurance coverage on the same call.`,
    ],
    ctaHeadline: `Get your exact ${city} quote — we check your vehicle and coverage`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-heat-affects-windshields-in-${citySlug}`,
      `how-long-does-windshield-replacement-take-${citySlug}`,
    ],
    metaTitle: `Windshield Replacement Cost in ${city} 2026`,
    metaDescription: `${city} windshield replacement costs $200–$500 for standard vehicles. Heat and ADAS add cost. Arizona zero-deductible law means most insured drivers pay $0.`,
    lastUpdated: 'June 2026',
  }

  const q2_chip_cost = {
    slug: `windshield-chip-repair-cost-${citySlug}-2026`,
    question: `How much does windshield chip repair cost in ${city} in 2026?`,
    directAnswer: `Windshield chip repair in ${city} typically costs $60–$120 without insurance. With Arizona's zero-deductible glass law (ARS 20-263), most chip repairs are $0 with comprehensive coverage — your insurer pays and your rates cannot increase.`,
    detail: [
      `Arizona law requires insurers to offer zero-deductible comprehensive glass coverage. For chip repairs — which cost insurers $60–$100 — nearly every carrier with comprehensive coverage pays the full cost with no deductible and no rate impact.`,
      `Without insurance, prices vary by chip type. A single small chip runs $60–$80. Multiple chips or large star-break repairs run $100–$120. If a chip has already spread to a crack longer than 6 inches, full replacement is required at a much higher cost.`,
      `Acting fast matters especially in ${city}. The extreme heat and UV exposure mean chips spread faster here than almost anywhere else in the country. A chip repaired today for $0 prevents a replacement that could cost $400+ later.`,
    ],
    ctaHeadline: `Get a free chip repair quote — most ${city} drivers pay $0 with insurance`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-long-does-windshield-chip-repair-take-${citySlug}`,
      `how-heat-affects-windshields-in-${citySlug}`,
    ],
    metaTitle: `Windshield Chip Repair Cost in ${city} 2026`,
    metaDescription: `${city} chip repair costs $60–$120 without insurance. With Arizona's zero-deductible glass law, most insured drivers pay $0. Act fast — heat makes chips spread quickly.`,
    lastUpdated: 'June 2026',
  }

  const q3_heat = {
    slug: `how-heat-affects-windshields-in-${citySlug}`,
    question: `How does ${city}'s heat affect windshields?`,
    directAnswer: `${city}'s extreme heat is one of the worst conditions for windshield integrity in the country. Temperatures above 110°F push windshield glass into constant thermal expansion cycles, causing existing chips to spread rapidly and weakening the bond between the glass and the vehicle frame.`,
    detail: [
      heatNote,
      `UV intensity at Phoenix metro's latitude (33°N) is extremely high. UV radiation degrades the polyvinyl butyral (PVB) interlayer sandwiched between the glass panes over time, making windshields more brittle and more prone to cracking under impact or thermal stress. High-quality OEM glass with UV blocking helps, but no glass is immune.`,
      `Arizona's monsoon season (July–September) adds a second stress cycle: sudden temperature drops of 20–30°F when a monsoon rolls through after a 110°F afternoon create a sharp thermal shock. Wind-driven sand and gravel during dust storms also pit glass surfaces, accelerating UV damage. If you have a chip going into monsoon season, get it repaired before July.`,
    ],
    ctaHeadline: `Protect your windshield before the heat spreads that chip`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      chipOnly ? `windshield-chip-repair-cost-${citySlug}-2026` : `windshield-replacement-cost-${citySlug}-2026`,
      `mobile-windshield-replacement-${citySlug}`,
    ],
    metaTitle: `How ${city}'s Heat Affects Windshields | AZ Windshield Guide`,
    metaDescription: `${city}'s 110°F+ heat causes rapid chip spread, UV interlayer damage, and monsoon thermal shock. Learn how desert conditions affect your windshield and what to do.`,
    lastUpdated: 'June 2026',
  }

  const q4_mobile = {
    slug: `mobile-windshield-replacement-${citySlug}`,
    question: `How does mobile windshield service work in ${city}?`,
    directAnswer: `A certified technician comes to your location — home, office, parking lot, anywhere in the ${city} area — and completes the repair or replacement on-site. You never drive to a shop. Mobile service is included at no extra charge.`,
    detail: [
      `Once you book, we confirm your address and schedule a 2-hour arrival window. The technician arrives in a fully stocked service vehicle with the correct glass for your vehicle already on board. No waiting for parts, no rescheduling.`,
      `One important note for ${city} in summer: adhesive cure time is affected by extreme heat. Urethane cures faster in heat, but excessive heat can compromise the bond. We schedule installations with heat in mind — early morning or shaded locations are preferred in July and August.`,
      `Pink Auto Glass covers ${city} and the surrounding Phoenix metro area. Call or book online to confirm service at your specific address.`,
    ],
    ctaHeadline: `Book mobile service in ${city} — we come to you`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-heat-affects-windshields-in-${citySlug}`,
      chipOnly ? `windshield-chip-repair-cost-${citySlug}-2026` : `windshield-replacement-cost-${citySlug}-2026`,
    ],
    metaTitle: `Mobile Windshield Service ${city} AZ | We Come to You`,
    metaDescription: `Pink Auto Glass sends a certified technician to your home, office, or parking lot in ${city}. No shop visit needed. Same-day mobile service in the Phoenix metro.`,
    lastUpdated: 'June 2026',
  }

  const q5_time = {
    slug: `how-long-does-windshield-replacement-take-${citySlug}`,
    question: `How long does windshield replacement take in ${city}?`,
    directAnswer: `A full windshield replacement takes 60–90 minutes. Chip repair takes 30–45 minutes. Both are completed at your location by a mobile technician — no shop visit required.`,
    detail: [
      `The installation itself is 60–90 minutes: remove the old glass, clean and prime the pinch weld, install the new glass with urethane adhesive, and inspect the seal. ADAS recalibration, if needed, adds another 30–60 minutes.`,
      `In ${city}'s summer heat, cure time is a consideration. Urethane sets faster in high temperatures, but extreme heat (above 105°F) can cause adhesive to cure unevenly. We schedule installations with adequate ventilation and in the cooler morning hours when temperatures are extreme.`,
      `Chip repair is faster at 30–45 minutes and is not significantly affected by summer heat. In fact, the warm temperatures help the UV-cure resin flow into the chip more easily.`,
    ],
    ctaHeadline: `Same-day service in ${city} — book your appointment now`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `mobile-windshield-replacement-${citySlug}`,
      `how-heat-affects-windshields-in-${citySlug}`,
    ],
    metaTitle: `How Long Does Windshield Replacement Take in ${city}?`,
    metaDescription: `Full windshield replacement takes 60–90 minutes in ${city}. Chip repair takes 30–45 minutes. Mobile service at your location — no shop visit needed.`,
    lastUpdated: 'June 2026',
  }

  const q_chip_time = {
    slug: `how-long-does-windshield-chip-repair-take-${citySlug}`,
    question: `How long does windshield chip repair take in ${city}?`,
    directAnswer: `Windshield chip repair takes 30–45 minutes from start to finish. A mobile technician comes to your location in ${city}, injects UV-cure resin into the chip, and you drive away with the repair complete.`,
    detail: [
      `The process: clean the chip, attach an injector, draw out air under vacuum, force resin into the void, and cure with UV light. In ${city}'s summer heat, the resin flows more easily and UV curing can be slightly faster — but the technician will shade the work area to prevent uneven curing from direct sunlight.`,
      `Results depend on chip size and type. Chips smaller than a quarter are almost always repairable in one appointment. Star breaks with multiple cracks take slightly longer. Chips that have already spread beyond 6 inches require full replacement.`,
      `${city}'s heat makes speed matter more than in most cities. A chip that sits unrepaired through a week of 110°F days is far more likely to spread than the same chip in a cooler climate. Same-day repair is strongly recommended.`,
    ],
    ctaHeadline: `Same-day chip repair in ${city} — we come to you`,
    relatedSlugs: [
      `does-insurance-cover-windshield-replacement-${citySlug}`,
      `how-heat-affects-windshields-in-${citySlug}`,
      `windshield-chip-repair-cost-${citySlug}-2026`,
    ],
    metaTitle: `How Long Does Windshield Chip Repair Take in ${city}?`,
    metaDescription: `Chip repair takes 30–45 minutes in ${city}. Mobile service at your location. AZ's summer heat makes fast repair critical — chips spread faster here than almost anywhere.`,
    lastUpdated: 'June 2026',
  }

  if (chipOnly) {
    return [q1, q2_chip_cost, q3_heat, q4_mobile, q_chip_time]
  }
  return [q1, q2_cost, q3_heat, q4_mobile, q5_time]
}

function nationalQuestions(site) {
  const { dir } = site
  const isPhoenixCost = dir === 'windshield-cost-phoenix'

  return [
    {
      slug: 'average-windshield-replacement-cost-2026',
      question: 'What is the average cost of windshield replacement in 2026?',
      directAnswer: 'The national average for windshield replacement is $250–$400 for standard vehicles without ADAS. Vehicles with forward-facing cameras and advanced driver-assistance systems run $400–$800. With comprehensive insurance that includes zero-deductible glass coverage, most drivers pay $0.',
      detail: [
        'The single biggest cost driver is whether your vehicle has ADAS. Lane departure warning, automatic emergency braking, and forward collision alert systems all rely on a camera mounted to your windshield. That camera must be professionally recalibrated after every windshield replacement — adding $100–$250 to the total.',
        'Glass type matters too. OEM glass matches factory specs and is recommended for ADAS vehicles. Aftermarket glass is cheaper ($50–$150 less) but may have optical variances that affect camera calibration. For non-ADAS vehicles, quality aftermarket glass is a reasonable choice.',
        isPhoenixCost
          ? 'Phoenix metro pricing runs slightly higher than the national average due to high service demand during hail and monsoon season, and because desert-grade UV-blocking glass commands a premium. Expect $280–$450 for standard vehicles in the Phoenix area.'
          : 'Prices vary by region. Major metros (LA, NYC, Chicago) trend higher due to labor costs. Sun Belt cities (Phoenix, Denver, Dallas) see high volume that keeps competition strong. Rural areas may have higher prices due to limited competition and shipping costs.',
      ],
      ctaHeadline: 'Get a real quote for your vehicle — not a range',
      relatedSlugs: [
        'does-insurance-cover-windshield-replacement',
        'how-long-does-windshield-replacement-take',
        'is-windshield-chip-repair-worth-it',
      ],
      metaTitle: 'Average Windshield Replacement Cost 2026 | Pricing Guide',
      metaDescription: 'Standard windshield replacement costs $250–$400. ADAS-equipped vehicles run $400–$800. Most drivers with comprehensive insurance pay $0 via zero-deductible glass coverage.',
      lastUpdated: 'June 2026',
    },
    {
      slug: 'does-insurance-cover-windshield-replacement',
      question: 'Does insurance cover windshield replacement?',
      directAnswer: 'Comprehensive insurance covers windshield replacement. About 10 states — including Colorado and Arizona — require insurers to offer zero-deductible glass coverage, meaning you may pay $0. In other states, your standard deductible applies (typically $250–$500).',
      detail: [
        'Windshield damage is covered under comprehensive insurance, not collision. Comprehensive covers non-collision damage: weather, falling objects, vandalism, and glass breakage. Collision only covers accidents where your car strikes something.',
        'Zero-deductible states (CO, AZ, FL, KY, MA, MN, NY, SC, SD, WI) require insurers to offer windshield-specific coverage with no out-of-pocket cost. In these states, chip repair is almost always $0 and full replacement often is too. In other states, your deductible applies — and if your deductible is higher than the repair cost, it may not be worth filing.',
        'Filing a glass claim under comprehensive coverage does not increase your rate in most states. Because glass damage is typically weather-related (hail, road debris), it is treated as a no-fault event. Always confirm with your specific insurer before filing.',
      ],
      ctaHeadline: "Get a quote — we'll verify your coverage before you commit",
      relatedSlugs: [
        'average-windshield-replacement-cost-2026',
        'is-windshield-chip-repair-worth-it',
        'how-long-does-windshield-replacement-take',
      ],
      metaTitle: 'Does Insurance Cover Windshield Replacement? | Coverage Guide',
      metaDescription: 'Comprehensive insurance covers windshield replacement. CO, AZ, and 8 other states require zero-deductible glass coverage. Learn when to file and when not to.',
      lastUpdated: 'June 2026',
    },
    {
      slug: 'how-long-does-windshield-replacement-take',
      question: 'How long does windshield replacement take?',
      directAnswer: 'Full windshield replacement takes 60–90 minutes. Chip repair takes 30–45 minutes. If your vehicle has ADAS cameras (lane departure warning, forward collision alert), add 30–60 minutes for required camera recalibration after replacement.',
      detail: [
        'The installation process: the technician removes the damaged windshield, cleans the pinch weld and frame, applies primer, installs the new glass with urethane adhesive, and inspects the seal for leaks and wind noise. All of this is 60–90 minutes.',
        'Drive-away time is 30–60 minutes after installation — urethane needs time to reach minimum safe drive-away strength. In cold weather (below 40°F), allow up to 60 minutes. In warm weather, 30 minutes is usually sufficient.',
        'ADAS recalibration (if needed) happens after installation and adds 30–60 minutes. Skipping calibration is not safe — a camera that is even slightly off-angle can cause lane departure and collision systems to trigger incorrectly or fail to trigger at all.',
      ],
      ctaHeadline: 'Same-day mobile service — book your appointment now',
      relatedSlugs: [
        'does-insurance-cover-windshield-replacement',
        'average-windshield-replacement-cost-2026',
        'is-windshield-chip-repair-worth-it',
      ],
      metaTitle: 'How Long Does Windshield Replacement Take? | Time Guide',
      metaDescription: 'Full windshield replacement takes 60–90 minutes. Chip repair takes 30–45 minutes. ADAS recalibration adds 30–60 minutes. Drive-away in 30–60 min after installation.',
      lastUpdated: 'June 2026',
    },
    {
      slug: 'is-windshield-chip-repair-worth-it',
      question: 'Is windshield chip repair worth it?',
      directAnswer: "Yes — almost always. A chip repaired within 24–48 hours of impact preserves your original windshield, costs $60–$120 (often $0 with insurance), and takes 30–45 minutes. The alternative is a $250–$800 replacement. The math isn't close.",
      detail: [
        'Chip repair works by injecting UV-cured resin into the void, bonding the glass, and stopping the crack from propagating. The repair is permanent, usually invisible from the driver\'s seat, and restores most of the structural integrity. It is not a cosmetic patch — it is a structural repair.',
        'The repair-first decision tree is simple: chip smaller than a quarter and not in the driver\'s direct line of sight → repair. Chip that has already spread beyond 6 inches → replacement required. Chip directly in the driver\'s vision center → replacement usually recommended for optical clarity.',
        'Timing is critical. Every day a chip sits unrepaired, it is exposed to temperature cycles, UV, pressure from driving, and car wash impact. A chip repaired on day 1 is repairable; the same chip on day 14 often is not. Most insurers with comprehensive coverage pay the full cost of chip repair — there is rarely a financial reason to delay.',
      ],
      ctaHeadline: 'Get your chip repaired before it spreads — same-day mobile service',
      relatedSlugs: [
        'does-insurance-cover-windshield-replacement',
        'average-windshield-replacement-cost-2026',
        'how-long-does-windshield-replacement-take',
      ],
      metaTitle: 'Is Windshield Chip Repair Worth It? | Repair vs Replace Guide',
      metaDescription: 'Chip repair costs $60–$120 (often $0 with insurance) and takes 30–45 minutes. Full replacement costs $250–$800+. Repair is worth it in almost every case — if you act fast.',
      lastUpdated: 'June 2026',
    },
  ]
}

// ── File generators ───────────────────────────────────────────────────────────

function generateQuestionsTs(site) {
  const questions = site.type === 'co'
    ? coQuestions(site)
    : site.type === 'az'
    ? azQuestions(site)
    : nationalQuestions(site)

  const { url, name, questionsPageHeading, questionsPageIntro, questionsMetaTitle, questionsMetaDescription } = site

  // Use JSON.stringify (double-quoted) — valid TypeScript, avoids apostrophe escaping issues
  const questionsJson = JSON.stringify(questions, null, 2)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)"\s*:/g, '$1:') // strip quotes from simple identifier keys only

  return `export const siteConfig = {
  url: "${url}",
  name: "${name}",
  questionsPageHeading: "${questionsPageHeading}",
  questionsPageIntro: "${questionsPageIntro}",
  questionsMetaTitle: "${questionsMetaTitle}",
  questionsMetaDescription: "${questionsMetaDescription}",
}

export interface QuestionEntry {
  slug: string
  question: string
  directAnswer: string
  detail: string[]
  ctaHeadline: string
  relatedSlugs: string[]
  metaTitle: string
  metaDescription: string
  lastUpdated: string
}

export const questions: QuestionEntry[] = ${questionsJson}
`
}

// ── Main ──────────────────────────────────────────────────────────────────────

let generated = 0
let skipped = 0

for (const site of sites) {
  const siteDir = inventoryMap[site.dir] ?? join(SITES_DIR, site.dir)
  const dataDir = join(siteDir, 'src', 'data')

  try {
    mkdirSync(dataDir, { recursive: true })
    const content = generateQuestionsTs(site)
    writeFileSync(join(dataDir, 'questions.ts'), content, 'utf-8')
    console.log(`✅ ${site.dir}`)
    generated++
  } catch (err) {
    console.error(`❌ ${site.dir}: ${err.message}`)
    skipped++
  }
}

console.log(`\nDone: ${generated} generated, ${skipped} failed.`)
