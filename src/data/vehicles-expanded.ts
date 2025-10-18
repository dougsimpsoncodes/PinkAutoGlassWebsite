// Expanded vehicle database for SEO vehicle pages - 50+ popular vehicles
// This data supports dynamic vehicle-specific landing pages

export interface VehicleData {
  slug: string;
  make: string;
  model: string;
  years: string; // e.g., "2018-2025"
  adasStandard: boolean; // ADAS comes standard on most trims
  adasYearStart?: number; // Year ADAS became available
  priceRange: string;
  specialFeatures?: string[];
  popularTrims?: string[];
}

export const vehicleDatabase: VehicleData[] = [
  // Subaru - Popular in Colorado
  {
    slug: 'subaru-outback-windshield-replacement-denver',
    make: 'Subaru',
    model: 'Outback',
    years: '2015-2025',
    adasStandard: true,
    adasYearStart: 2015,
    priceRange: '$450-$650',
    specialFeatures: ['EyeSight ADAS', 'Heated windshield', 'Rain sensor'],
    popularTrims: ['Base', 'Premium', 'Limited', 'Touring XT']
  },
  {
    slug: 'subaru-forester-windshield-replacement-denver',
    make: 'Subaru',
    model: 'Forester',
    years: '2014-2025',
    adasStandard: true,
    adasYearStart: 2014,
    priceRange: '$420-$600',
    specialFeatures: ['EyeSight ADAS', 'Lane keeping'],
    popularTrims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring']
  },
  {
    slug: 'subaru-crosstrek-windshield-replacement-denver',
    make: 'Subaru',
    model: 'Crosstrek',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$400-$580',
    specialFeatures: ['EyeSight ADAS', 'Compact windshield'],
    popularTrims: ['Base', 'Premium', 'Sport', 'Limited']
  },
  {
    slug: 'subaru-ascent-windshield-replacement-denver',
    make: 'Subaru',
    model: 'Ascent',
    years: '2019-2025',
    adasStandard: true,
    adasYearStart: 2019,
    priceRange: '$500-$700',
    specialFeatures: ['EyeSight ADAS', 'Large windshield', 'Heated'],
    popularTrims: ['Base', 'Premium', 'Limited', 'Touring']
  },
  {
    slug: 'subaru-legacy-windshield-replacement-denver',
    make: 'Subaru',
    model: 'Legacy',
    years: '2015-2025',
    adasStandard: true,
    adasYearStart: 2015,
    priceRange: '$400-$580',
    specialFeatures: ['EyeSight ADAS', 'Sedan windshield'],
    popularTrims: ['Base', 'Premium', 'Sport', 'Limited', 'Touring XT']
  },

  // Toyota - Best-selling brand
  {
    slug: 'toyota-rav4-windshield-replacement-denver',
    make: 'Toyota',
    model: 'RAV4',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2019,
    priceRange: '$400-$600',
    specialFeatures: ['Toyota Safety Sense', 'Pre-collision system'],
    popularTrims: ['LE', 'XLE', 'Adventure', 'Limited', 'TRD', 'Prime']
  },
  {
    slug: 'toyota-4runner-windshield-replacement-denver',
    make: 'Toyota',
    model: '4Runner',
    years: '2014-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$450-$650',
    specialFeatures: ['Large SUV windshield', 'Off-road rated'],
    popularTrims: ['SR5', 'TRD Off-Road', 'TRD Pro', 'Limited']
  },
  {
    slug: 'toyota-tacoma-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Tacoma',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$400-$600',
    specialFeatures: ['Truck windshield', 'TSS on newer models'],
    popularTrims: ['SR', 'SR5', 'TRD Sport', 'TRD Off-Road', 'TRD Pro']
  },
  {
    slug: 'toyota-tundra-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Tundra',
    years: '2014-2025',
    adasStandard: true,
    adasYearStart: 2022,
    priceRange: '$500-$700',
    specialFeatures: ['Full-size truck', 'Large windshield', 'TSS on new gen'],
    popularTrims: ['SR', 'SR5', 'Limited', 'Platinum', '1794', 'TRD Pro']
  },
  {
    slug: 'toyota-highlander-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Highlander',
    years: '2014-2025',
    adasStandard: true,
    adasYearStart: 2018,
    priceRange: '$450-$650',
    specialFeatures: ['Toyota Safety Sense', '3-row SUV'],
    popularTrims: ['LE', 'XLE', 'Limited', 'Platinum']
  },
  {
    slug: 'toyota-camry-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Camry',
    years: '2015-2025',
    adasStandard: true,
    adasYearStart: 2018,
    priceRange: '$350-$550',
    specialFeatures: ['Toyota Safety Sense', 'Sedan'],
    popularTrims: ['LE', 'SE', 'XLE', 'XSE', 'TRD']
  },
  {
    slug: 'toyota-corolla-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Corolla',
    years: '2014-2025',
    adasStandard: true,
    adasYearStart: 2020,
    priceRange: '$300-$480',
    specialFeatures: ['Toyota Safety Sense', 'Compact'],
    popularTrims: ['L', 'LE', 'SE', 'XLE', 'XSE']
  },
  {
    slug: 'toyota-sienna-windshield-replacement-denver',
    make: 'Toyota',
    model: 'Sienna',
    years: '2015-2025',
    adasStandard: true,
    adasYearStart: 2021,
    priceRange: '$500-$700',
    specialFeatures: ['Large minivan windshield', 'TSS standard'],
    popularTrims: ['LE', 'XLE', 'XSE', 'Limited', 'Platinum']
  },

  // Honda - Popular and reliable
  {
    slug: 'honda-cr-v-windshield-replacement-denver',
    make: 'Honda',
    model: 'CR-V',
    years: '2015-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$380-$580',
    specialFeatures: ['Honda Sensing', 'Compact SUV'],
    popularTrims: ['LX', 'EX', 'EX-L', 'Touring']
  },
  {
    slug: 'honda-civic-windshield-replacement-denver',
    make: 'Honda',
    model: 'Civic',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$320-$500',
    specialFeatures: ['Honda Sensing', 'Compact sedan/hatch'],
    popularTrims: ['LX', 'Sport', 'EX', 'Touring', 'Type R']
  },
  {
    slug: 'honda-pilot-windshield-replacement-denver',
    make: 'Honda',
    model: 'Pilot',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$480-$680',
    specialFeatures: ['Honda Sensing', '3-row SUV', 'Large windshield'],
    popularTrims: ['LX', 'EX', 'EX-L', 'Touring', 'Elite']
  },
  {
    slug: 'honda-accord-windshield-replacement-denver',
    make: 'Honda',
    model: 'Accord',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$360-$560',
    specialFeatures: ['Honda Sensing', 'Mid-size sedan'],
    popularTrims: ['LX', 'Sport', 'EX', 'EX-L', 'Touring']
  },
  {
    slug: 'honda-odyssey-windshield-replacement-denver',
    make: 'Honda',
    model: 'Odyssey',
    years: '2018-2025',
    adasStandard: true,
    adasYearStart: 2018,
    priceRange: '$520-$720',
    specialFeatures: ['Honda Sensing', 'Minivan', 'Large windshield'],
    popularTrims: ['LX', 'EX', 'EX-L', 'Touring', 'Elite']
  },
  {
    slug: 'honda-ridgeline-windshield-replacement-denver',
    make: 'Honda',
    model: 'Ridgeline',
    years: '2017-2025',
    adasStandard: true,
    adasYearStart: 2017,
    priceRange: '$460-$640',
    specialFeatures: ['Honda Sensing', 'Mid-size truck'],
    popularTrims: ['Sport', 'RTL', 'RTL-E', 'Black Edition']
  },
  {
    slug: 'honda-hr-v-windshield-replacement-denver',
    make: 'Honda',
    model: 'HR-V',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$350-$530',
    specialFeatures: ['Subcompact SUV', 'Honda Sensing on newer'],
    popularTrims: ['LX', 'Sport', 'EX', 'EX-L']
  },

  // Ford - Best-selling trucks
  {
    slug: 'ford-f150-windshield-replacement-denver',
    make: 'Ford',
    model: 'F-150',
    years: '2015-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$480-$700',
    specialFeatures: ['Full-size truck', 'Co-Pilot360 on newer', 'Large windshield'],
    popularTrims: ['XL', 'XLT', 'Lariat', 'King Ranch', 'Platinum', 'Limited', 'Raptor']
  },
  {
    slug: 'ford-explorer-windshield-replacement-denver',
    make: 'Ford',
    model: 'Explorer',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$460-$660',
    specialFeatures: ['3-row SUV', 'Co-Pilot360'],
    popularTrims: ['Base', 'XLT', 'Limited', 'ST', 'Platinum']
  },
  {
    slug: 'ford-escape-windshield-replacement-denver',
    make: 'Ford',
    model: 'Escape',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$380-$580',
    specialFeatures: ['Compact SUV', 'Co-Pilot360'],
    popularTrims: ['S', 'SE', 'SEL', 'Titanium']
  },
  {
    slug: 'ford-edge-windshield-replacement-denver',
    make: 'Ford',
    model: 'Edge',
    years: '2015-2023',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$420-$620',
    specialFeatures: ['Mid-size SUV', 'Co-Pilot360'],
    popularTrims: ['SE', 'SEL', 'Titanium', 'ST']
  },
  {
    slug: 'ford-bronco-windshield-replacement-denver',
    make: 'Ford',
    model: 'Bronco',
    years: '2021-2025',
    adasStandard: true,
    adasYearStart: 2021,
    priceRange: '$500-$700',
    specialFeatures: ['Off-road SUV', 'Co-Pilot360', 'Unique windshield shape'],
    popularTrims: ['Base', 'Big Bend', 'Black Diamond', 'Outer Banks', 'Wildtrak', 'Badlands']
  },
  {
    slug: 'ford-mustang-windshield-replacement-denver',
    make: 'Ford',
    model: 'Mustang',
    years: '2015-2025',
    adasStandard: false,
    adasYearStart: 2018,
    priceRange: '$420-$620',
    specialFeatures: ['Sports car', 'Raked windshield', 'Co-Pilot360 on select'],
    popularTrims: ['EcoBoost', 'GT', 'Mach 1', 'Shelby GT500']
  },

  // Chevrolet
  {
    slug: 'chevrolet-silverado-windshield-replacement-denver',
    make: 'Chevrolet',
    model: 'Silverado 1500',
    years: '2014-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$490-$720',
    specialFeatures: ['Full-size truck', 'Large windshield'],
    popularTrims: ['WT', 'Custom', 'LT', 'RST', 'LTZ', 'High Country']
  },
  {
    slug: 'chevrolet-equinox-windshield-replacement-denver',
    make: 'Chevrolet',
    model: 'Equinox',
    years: '2018-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$380-$560',
    specialFeatures: ['Compact SUV'],
    popularTrims: ['L', 'LS', 'LT', 'Premier']
  },
  {
    slug: 'chevrolet-tahoe-windshield-replacement-denver',
    make: 'Chevrolet',
    model: 'Tahoe',
    years: '2015-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$540-$760',
    specialFeatures: ['Full-size SUV', 'Very large windshield'],
    popularTrims: ['LS', 'LT', 'RST', 'Premier', 'High Country']
  },
  {
    slug: 'chevrolet-traverse-windshield-replacement-denver',
    make: 'Chevrolet',
    model: 'Traverse',
    years: '2018-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$470-$670',
    specialFeatures: ['3-row SUV', 'Large windshield'],
    popularTrims: ['L', 'LS', 'LT', 'RS', 'Premier', 'High Country']
  },
  {
    slug: 'chevrolet-colorado-windshield-replacement-denver',
    make: 'Chevrolet',
    model: 'Colorado',
    years: '2015-2025',
    adasStandard: false,
    priceRange: '$420-$600',
    specialFeatures: ['Mid-size truck'],
    popularTrims: ['WT', 'LT', 'Z71', 'ZR2']
  },

  // Jeep - Popular in Colorado
  {
    slug: 'jeep-wrangler-windshield-replacement-denver',
    make: 'Jeep',
    model: 'Wrangler',
    years: '2018-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$450-$650',
    specialFeatures: ['Unique flat windshield', 'Off-road'],
    popularTrims: ['Sport', 'Sport S', 'Sahara', 'Rubicon', '4xe']
  },
  {
    slug: 'jeep-grand-cherokee-windshield-replacement-denver',
    make: 'Jeep',
    model: 'Grand Cherokee',
    years: '2014-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$480-$680',
    specialFeatures: ['Mid-size SUV', 'Available ADAS'],
    popularTrims: ['Laredo', 'Limited', 'Trailhawk', 'Overland', 'Summit']
  },
  {
    slug: 'jeep-cherokee-windshield-replacement-denver',
    make: 'Jeep',
    model: 'Cherokee',
    years: '2014-2023',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$400-$600',
    specialFeatures: ['Compact SUV'],
    popularTrims: ['Latitude', 'Latitude Plus', 'Limited', 'Trailhawk']
  },
  {
    slug: 'jeep-compass-windshield-replacement-denver',
    make: 'Jeep',
    model: 'Compass',
    years: '2017-2025',
    adasStandard: false,
    priceRange: '$380-$560',
    specialFeatures: ['Subcompact SUV'],
    popularTrims: ['Sport', 'Latitude', 'Limited', 'Trailhawk']
  },
  {
    slug: 'jeep-gladiator-windshield-replacement-denver',
    make: 'Jeep',
    model: 'Gladiator',
    years: '2020-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$470-$650',
    specialFeatures: ['Mid-size truck', 'Similar to Wrangler windshield'],
    popularTrims: ['Sport', 'Sport S', 'Overland', 'Rubicon', 'Mojave']
  },

  // Tesla - High-tech vehicles
  {
    slug: 'tesla-model-3-windshield-replacement-denver',
    make: 'Tesla',
    model: 'Model 3',
    years: '2018-2025',
    adasStandard: true,
    adasYearStart: 2018,
    priceRange: '$600-$900',
    specialFeatures: ['Autopilot cameras', 'Acoustic glass', 'Complex calibration'],
    popularTrims: ['Standard Range Plus', 'Long Range', 'Performance']
  },
  {
    slug: 'tesla-model-y-windshield-replacement-denver',
    make: 'Tesla',
    model: 'Model Y',
    years: '2020-2025',
    adasStandard: true,
    adasYearStart: 2020,
    priceRange: '$650-$950',
    specialFeatures: ['Autopilot cameras', 'Large windshield', 'Panoramic'],
    popularTrims: ['Long Range', 'Performance']
  },
  {
    slug: 'tesla-model-s-windshield-replacement-denver',
    make: 'Tesla',
    model: 'Model S',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$700-$1100',
    specialFeatures: ['Autopilot cameras', 'Luxury glass', 'Complex ADAS'],
    popularTrims: ['Long Range', 'Plaid']
  },
  {
    slug: 'tesla-model-x-windshield-replacement-denver',
    make: 'Tesla',
    model: 'Model X',
    years: '2016-2025',
    adasStandard: true,
    adasYearStart: 2016,
    priceRange: '$800-$1200',
    specialFeatures: ['Panoramic windshield', 'Largest Tesla glass', 'Complex calibration'],
    popularTrims: ['Long Range', 'Plaid']
  },

  // RAM
  {
    slug: 'ram-1500-windshield-replacement-denver',
    make: 'RAM',
    model: '1500',
    years: '2014-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$490-$720',
    specialFeatures: ['Full-size truck', 'Available forward collision'],
    popularTrims: ['Tradesman', 'Big Horn', 'Laramie', 'Rebel', 'Limited', 'TRX']
  },
  {
    slug: 'ram-2500-windshield-replacement-denver',
    make: 'RAM',
    model: '2500',
    years: '2014-2025',
    adasStandard: false,
    priceRange: '$520-$750',
    specialFeatures: ['Heavy-duty truck', 'Extra-large windshield'],
    popularTrims: ['Tradesman', 'Big Horn', 'Power Wagon', 'Laramie', 'Limited']
  },

  // Nissan
  {
    slug: 'nissan-rogue-windshield-replacement-denver',
    make: 'Nissan',
    model: 'Rogue',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2018,
    priceRange: '$380-$580',
    specialFeatures: ['ProPILOT Assist available', 'Compact SUV'],
    popularTrims: ['S', 'SV', 'SL', 'Platinum']
  },
  {
    slug: 'nissan-altima-windshield-replacement-denver',
    make: 'Nissan',
    model: 'Altima',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$340-$540',
    specialFeatures: ['ProPILOT on select', 'Mid-size sedan'],
    popularTrims: ['S', 'SV', 'SR', 'SL', 'Platinum']
  },
  {
    slug: 'nissan-pathfinder-windshield-replacement-denver',
    make: 'Nissan',
    model: 'Pathfinder',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2022,
    priceRange: '$470-$670',
    specialFeatures: ['3-row SUV', 'ProPILOT on new gen'],
    popularTrims: ['S', 'SV', 'SL', 'Platinum']
  },
  {
    slug: 'nissan-frontier-windshield-replacement-denver',
    make: 'Nissan',
    model: 'Frontier',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2022,
    priceRange: '$400-$600',
    specialFeatures: ['Mid-size truck', 'Newly redesigned'],
    popularTrims: ['S', 'SV', 'PRO-4X', 'PRO-X']
  },

  // GMC
  {
    slug: 'gmc-sierra-windshield-replacement-denver',
    make: 'GMC',
    model: 'Sierra 1500',
    years: '2014-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$490-$720',
    specialFeatures: ['Full-size truck', 'Same as Silverado'],
    popularTrims: ['Pro', 'SLE', 'Elevation', 'SLT', 'AT4', 'Denali']
  },
  {
    slug: 'gmc-yukon-windshield-replacement-denver',
    make: 'GMC',
    model: 'Yukon',
    years: '2015-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$540-$760',
    specialFeatures: ['Full-size SUV', 'Very large windshield'],
    popularTrims: ['SLE', 'SLT', 'AT4', 'Denali']
  },
  {
    slug: 'gmc-acadia-windshield-replacement-denver',
    make: 'GMC',
    model: 'Acadia',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$450-$650',
    specialFeatures: ['3-row SUV'],
    popularTrims: ['SLE', 'SLT', 'AT4', 'Denali']
  },

  // Mazda
  {
    slug: 'mazda-cx5-windshield-replacement-denver',
    make: 'Mazda',
    model: 'CX-5',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$400-$600',
    specialFeatures: ['i-ACTIVSENSE available', 'Compact SUV'],
    popularTrims: ['Sport', 'Select', 'Preferred', 'Carbon Edition', 'Signature']
  },
  {
    slug: 'mazda-cx9-windshield-replacement-denver',
    make: 'Mazda',
    model: 'CX-9',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$480-$680',
    specialFeatures: ['i-ACTIVSENSE', '3-row SUV'],
    popularTrims: ['Sport', 'Touring', 'Carbon Edition', 'Grand Touring', 'Signature']
  },
  {
    slug: 'mazda3-windshield-replacement-denver',
    make: 'Mazda',
    model: 'Mazda3',
    years: '2019-2025',
    adasStandard: true,
    adasYearStart: 2019,
    priceRange: '$340-$520',
    specialFeatures: ['i-ACTIVSENSE standard', 'Compact sedan/hatch'],
    popularTrims: ['Base', 'Select', 'Preferred', 'Premium', 'Turbo']
  },

  // Hyundai
  {
    slug: 'hyundai-tucson-windshield-replacement-denver',
    make: 'Hyundai',
    model: 'Tucson',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$380-$580',
    specialFeatures: ['SmartSense available', 'Compact SUV'],
    popularTrims: ['SE', 'SEL', 'N Line', 'Limited']
  },
  {
    slug: 'hyundai-santa-fe-windshield-replacement-denver',
    make: 'Hyundai',
    model: 'Santa Fe',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2019,
    priceRange: '$440-$640',
    specialFeatures: ['SmartSense', 'Mid-size SUV'],
    popularTrims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy']
  },
  {
    slug: 'hyundai-palisade-windshield-replacement-denver',
    make: 'Hyundai',
    model: 'Palisade',
    years: '2020-2025',
    adasStandard: true,
    adasYearStart: 2020,
    priceRange: '$500-$700',
    specialFeatures: ['SmartSense standard', '3-row SUV', 'Large windshield'],
    popularTrims: ['SE', 'SEL', 'XRT', 'Limited', 'Calligraphy']
  },

  // Kia
  {
    slug: 'kia-sportage-windshield-replacement-denver',
    make: 'Kia',
    model: 'Sportage',
    years: '2017-2025',
    adasStandard: false,
    adasYearStart: 2020,
    priceRange: '$380-$580',
    specialFeatures: ['Drive Wise available', 'Compact SUV'],
    popularTrims: ['LX', 'EX', 'SX', 'X-Line']
  },
  {
    slug: 'kia-sorento-windshield-replacement-denver',
    make: 'Kia',
    model: 'Sorento',
    years: '2016-2025',
    adasStandard: false,
    adasYearStart: 2021,
    priceRange: '$450-$650',
    specialFeatures: ['Drive Wise', '3-row SUV'],
    popularTrims: ['LX', 'S', 'EX', 'SX', 'X-Line']
  },
  {
    slug: 'kia-telluride-windshield-replacement-denver',
    make: 'Kia',
    model: 'Telluride',
    years: '2020-2025',
    adasStandard: true,
    adasYearStart: 2020,
    priceRange: '$500-$700',
    specialFeatures: ['Drive Wise standard', '3-row SUV', 'Large windshield'],
    popularTrims: ['LX', 'S', 'EX', 'SX', 'X-Line', 'X-Pro']
  }
];

export function getVehicleBySlug(slug: string): VehicleData | undefined {
  return vehicleDatabase.find(v => v.slug === slug);
}

export function getVehiclesByMake(make: string): VehicleData[] {
  return vehicleDatabase.filter(v => v.make.toLowerCase() === make.toLowerCase());
}

export function getAllMakes(): string[] {
  return [...new Set(vehicleDatabase.map(v => v.make))].sort();
}
