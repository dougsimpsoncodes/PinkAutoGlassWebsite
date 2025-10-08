/**
 * Vehicle Make/Model Data for Programmatic SEO
 *
 * Top 20 vehicles on Denver roads - prioritized by popularity and search volume
 * This data drives the /vehicles/[slug] pages for long-tail SEO
 */

export interface VehicleModel {
  make: string;
  model: string;
  slug: string; // URL-friendly slug
  years: number[]; // Popular years to mention
  avgReplacementPrice: number; // Average windshield replacement cost
  avgRepairPrice: number; // Average chip repair cost
  hasADAS: boolean; // Requires ADAS calibration (2018+)
  adasYearStart?: number; // First year ADAS was standard
  glassType: 'OEM' | 'OEM-Preferred' | 'Aftermarket-OK'; // Glass recommendation
  popularityRank: number; // 1-20, used for priority ordering
  commonIssues?: string[]; // Model-specific windshield issues
  notes?: string; // Any special notes about this vehicle
}

export const vehiclesData: VehicleModel[] = [
  // HONDA
  {
    make: 'Honda',
    model: 'Accord',
    slug: 'honda-accord-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 350,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2018,
    glassType: 'OEM-Preferred',
    popularityRank: 1,
    commonIssues: [
      'Honda Sensing camera requires recalibration after replacement',
      'Heated windshield option on EX-L and Touring trims',
      'Rain sensor integration common on 2020+ models'
    ],
    notes: 'One of the most popular sedans in Denver. Honda Sensing (ADAS) standard on 2018+ models requires calibration.'
  },
  {
    make: 'Honda',
    model: 'Civic',
    slug: 'honda-civic-windshield-replacement-denver',
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 320,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2016,
    glassType: 'OEM-Preferred',
    popularityRank: 2,
    commonIssues: [
      'Honda Sensing camera placement sensitive to alignment',
      'Compact windshield size keeps costs lower',
      'Common hail damage in Denver area'
    ],
    notes: 'Extremely popular compact car. Honda Sensing available from 2016, standard on most trims 2018+.'
  },
  {
    make: 'Honda',
    model: 'CR-V',
    slug: 'honda-cr-v-windshield-replacement-denver',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 380,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2017,
    glassType: 'OEM-Preferred',
    popularityRank: 7,
    commonIssues: [
      'Larger SUV windshield increases replacement cost',
      'Honda Sensing standard on most trims',
      'Rain sensor and heated glass common on upper trims'
    ],
    notes: 'Top-selling SUV. Honda Sensing became standard equipment on most trims starting 2017.'
  },

  // TOYOTA
  {
    make: 'Toyota',
    model: 'Camry',
    slug: 'toyota-camry-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 340,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2018,
    glassType: 'OEM-Preferred',
    popularityRank: 3,
    commonIssues: [
      'Toyota Safety Sense 2.0 requires static calibration',
      'Acoustic glass on XLE and XSE trims',
      'Head-up display on premium models requires special glass'
    ],
    notes: 'Best-selling sedan in America. Toyota Safety Sense 2.0 standard on all 2018+ models.'
  },
  {
    make: 'Toyota',
    model: 'Corolla',
    slug: 'toyota-corolla-windshield-replacement-denver',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 310,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2017,
    glassType: 'Aftermarket-OK',
    popularityRank: 4,
    commonIssues: [
      'Compact windshield keeps costs down',
      'Toyota Safety Sense standard on most models',
      'Rain sensor on higher trims only'
    ],
    notes: 'Most affordable Toyota sedan. Aftermarket glass acceptable on base models without ADAS.'
  },
  {
    make: 'Toyota',
    model: 'RAV4',
    slug: 'toyota-rav4-windshield-replacement-denver',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 390,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2019,
    glassType: 'OEM',
    popularityRank: 5,
    commonIssues: [
      'Best-selling SUV requires OEM glass for ADAS compatibility',
      'Larger windshield on 2019+ redesign',
      'Panoramic moonroof models have additional sensors'
    ],
    notes: 'Best-selling SUV in America. All 2019+ models have Toyota Safety Sense 2.0 requiring calibration.'
  },

  // FORD
  {
    make: 'Ford',
    model: 'F-150',
    slug: 'ford-f150-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 450,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2018,
    glassType: 'OEM-Preferred',
    popularityRank: 6,
    commonIssues: [
      'Large truck windshield = higher cost',
      'Ford Co-Pilot360 requires calibration on XLT+ trims',
      'Work truck damage common (gravel, debris)'
    ],
    notes: 'Best-selling vehicle in America. Work trucks see more windshield damage than average.'
  },
  {
    make: 'Ford',
    model: 'Escape',
    slug: 'ford-escape-windshield-replacement-denver',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 360,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2020,
    glassType: 'OEM-Preferred',
    popularityRank: 20,
    commonIssues: [
      'Ford Co-Pilot360 standard on 2020+ models',
      'Compact SUV windshield size',
      'Rain sensor common on mid-trims'
    ],
    notes: 'Popular compact SUV. Major redesign in 2020 brought standard safety features.'
  },

  // CHEVROLET
  {
    make: 'Chevrolet',
    model: 'Silverado',
    slug: 'chevrolet-silverado-windshield-replacement-denver',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 460,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2019,
    glassType: 'OEM-Preferred',
    popularityRank: 8,
    commonIssues: [
      'Large truck windshield with high replacement cost',
      'Forward collision alert standard on LT+ trims',
      'Work/tow trucks see frequent rock chips'
    ],
    notes: 'Work trucks in Colorado see above-average windshield damage from gravel roads.'
  },
  {
    make: 'Chevrolet',
    model: 'Equinox',
    slug: 'chevrolet-equinox-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 350,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2018,
    glassType: 'Aftermarket-OK',
    popularityRank: 18,
    commonIssues: [
      'Standard safety features on 2018+ models',
      'Mid-size SUV windshield',
      'Rain sensor on Premier trim'
    ],
    notes: 'Popular family SUV. Aftermarket glass acceptable on base LS trim without advanced safety.'
  },

  // TESLA
  {
    make: 'Tesla',
    model: 'Model 3',
    slug: 'tesla-model-3-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 950,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2018,
    glassType: 'OEM',
    popularityRank: 9,
    commonIssues: [
      'Tesla-specific glass with heating elements required',
      'Autopilot cameras require Tesla-certified calibration',
      'Higher cost due to proprietary glass and tech'
    ],
    notes: 'Requires OEM Tesla glass and certified calibration. Most expensive sedan windshield.'
  },
  {
    make: 'Tesla',
    model: 'Model Y',
    slug: 'tesla-model-y-windshield-replacement-denver',
    years: [2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 1100,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2020,
    glassType: 'OEM',
    popularityRank: 10,
    commonIssues: [
      'Large panoramic windshield = highest cost',
      'Autopilot and Full Self-Driving require certified calibration',
      'Tesla-specific acoustic glass required'
    ],
    notes: 'Most expensive windshield replacement due to size and technology integration.'
  },

  // SUBARU
  {
    make: 'Subaru',
    model: 'Outback',
    slug: 'subaru-outback-windshield-replacement-denver',
    years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 420,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2015,
    glassType: 'OEM',
    popularityRank: 11,
    commonIssues: [
      'EyeSight system uses dual cameras requiring precise calibration',
      'Subaru requires OEM glass for EyeSight functionality',
      'Popular in Colorado mountains = frequent rock damage'
    ],
    notes: 'EyeSight (ADAS) standard since 2015. Very popular in Denver/Boulder. Requires OEM glass.'
  },
  {
    make: 'Subaru',
    model: 'Forester',
    slug: 'subaru-forester-windshield-replacement-denver',
    years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 410,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2014,
    glassType: 'OEM',
    popularityRank: 12,
    commonIssues: [
      'EyeSight dual-camera system requires OEM glass',
      'High windshield angle increases rock chip risk',
      'Mountain driving = above-average damage'
    ],
    notes: 'Extremely popular in Colorado. EyeSight available from 2014, standard 2019+. Requires OEM.'
  },

  // NISSAN
  {
    make: 'Nissan',
    model: 'Altima',
    slug: 'nissan-altima-windshield-replacement-denver',
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 340,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2019,
    glassType: 'Aftermarket-OK',
    popularityRank: 13,
    commonIssues: [
      'Nissan Safety Shield 360 standard on 2019+ models',
      'Mid-size sedan with standard windshield',
      'Rain sensor on SL and Platinum trims'
    ],
    notes: 'Affordable mid-size sedan. Safety Shield 360 became standard in 2019 redesign.'
  },

  // HYUNDAI
  {
    make: 'Hyundai',
    model: 'Elantra',
    slug: 'hyundai-elantra-windshield-replacement-denver',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    avgReplacementPrice: 310,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2021,
    glassType: 'Aftermarket-OK',
    popularityRank: 14,
    commonIssues: [
      'SmartSense safety standard on 2021+ models',
      'Compact sedan with lower replacement cost',
      'Base models without ADAS acceptable for aftermarket'
    ],
    notes: 'Budget-friendly compact sedan. ADAS became standard in 2021 redesign.'
  },

  // MAZDA
  {
    make: 'Mazda',
    model: 'CX-5',
    slug: 'mazda-cx-5-windshield-replacement-denver',
    years: [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 370,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2017,
    glassType: 'OEM-Preferred',
    popularityRank: 15,
    commonIssues: [
      'i-ACTIVSENSE safety features on Touring+ trims',
      'Head-up display on Grand Touring requires special glass',
      'Popular compact SUV in urban Denver'
    ],
    notes: 'Upscale compact SUV. i-ACTIVSENSE available on mid-trims, standard on upper trims.'
  },

  // JEEP
  {
    make: 'Jeep',
    model: 'Wrangler',
    slug: 'jeep-wrangler-windshield-replacement-denver',
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 380,
    avgRepairPrice: 89,
    hasADAS: false, // Optional on most trims
    glassType: 'Aftermarket-OK',
    popularityRank: 16,
    commonIssues: [
      'Nearly vertical windshield = high rock chip risk',
      'Off-road use leads to frequent damage',
      'Folding windshield on some models complicates replacement'
    ],
    notes: 'Colorado mountain vehicle. Steep windshield angle and off-road use = frequent replacements.'
  },

  // RAM
  {
    make: 'Ram',
    model: '1500',
    slug: 'ram-1500-windshield-replacement-denver',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 470,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2019,
    glassType: 'OEM-Preferred',
    popularityRank: 17,
    commonIssues: [
      'Large truck windshield with premium cost',
      'Forward collision warning standard on Big Horn+ trims',
      'Work trucks see high damage rates'
    ],
    notes: 'Popular work truck. Redesigned 2019+ models have advanced safety features.'
  },

  // GMC
  {
    make: 'GMC',
    model: 'Sierra',
    slug: 'gmc-sierra-windshield-replacement-denver',
    years: [2019, 2020, 2021, 2022, 2023, 2024, 2025],
    avgReplacementPrice: 465,
    avgRepairPrice: 89,
    hasADAS: true,
    adasYearStart: 2019,
    glassType: 'OEM-Preferred',
    popularityRank: 19,
    commonIssues: [
      'Nearly identical to Silverado, shares parts',
      'Large truck windshield',
      'Safety features standard on SLE+ trims'
    ],
    notes: 'Upscale version of Silverado. Same windshield specs and ADAS requirements.'
  },
];

/**
 * Helper functions
 */

export function getVehicleBySlug(slug: string): VehicleModel | undefined {
  return vehiclesData.find(v => v.slug === slug);
}

export function getVehiclesByMake(make: string): VehicleModel[] {
  return vehiclesData.filter(v => v.make.toLowerCase() === make.toLowerCase());
}

export function getTopVehicles(limit: number = 10): VehicleModel[] {
  return vehiclesData
    .sort((a, b) => a.popularityRank - b.popularityRank)
    .slice(0, limit);
}

export function getAllMakes(): string[] {
  return Array.from(new Set(vehiclesData.map(v => v.make))).sort();
}

export function getAllVehicleSlugs(): string[] {
  return vehiclesData.map(v => v.slug);
}
