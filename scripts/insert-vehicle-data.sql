-- Insert vehicle makes and models
-- Generated from vehicle-data-curated.json

BEGIN;

-- Toyota
INSERT INTO public.vehicle_makes (id, make) VALUES (1, 'Toyota') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, '4Runner') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Avalon') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'C-HR') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Camry') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Celica') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Corolla') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Corolla Cross') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Crown') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Echo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'FJ Cruiser') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'GR Corolla') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'GR86') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Grand Highlander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Highlander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Land Cruiser') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Matrix') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Mirai') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Prius') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Prius C') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Prius Prime') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Prius V') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'RAV4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'RAV4 Prime') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Sequoia') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Sienna') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Supra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Tacoma') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Tundra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Venza') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (1, 'Yaris') ON CONFLICT (make_id, model) DO NOTHING;

-- Honda
INSERT INTO public.vehicle_makes (id, make) VALUES (2, 'Honda') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Accord') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Accord Crosstour') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'CR-V') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'CR-Z') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Civic') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Civic Si') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Civic Type R') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Clarity') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Element') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Fit') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'HR-V') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Insight') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Odyssey') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Passport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Pilot') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'Ridgeline') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (2, 'S2000') ON CONFLICT (make_id, model) DO NOTHING;

-- Ford
INSERT INTO public.vehicle_makes (id, make) VALUES (3, 'Ford') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Bronco') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Bronco Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'C-Max') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Crown Victoria') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Edge') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Ecosport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Escape') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Excursion') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Expedition') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Explorer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Explorer Sport Trac') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'F-150') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'F-250') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'F-350') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Fiesta') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Five Hundred') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Flex') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Focus') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Freestar') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Freestyle') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Fusion') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'GT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Maverick') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Mustang') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Mustang Mach-E') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Ranger') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Taurus') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Taurus X') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Thunderbird') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (3, 'Transit Connect') ON CONFLICT (make_id, model) DO NOTHING;

-- Chevrolet
INSERT INTO public.vehicle_makes (id, make) VALUES (4, 'Chevrolet') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Avalanche') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Aveo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Blazer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Bolt EUV') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Bolt EV') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Camaro') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Captiva Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Cavalier') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'City Express') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Cobalt') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Colorado') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Corvette') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Cruze') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Equinox') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Express') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'HHR') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Impala') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Malibu') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Monte Carlo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Silverado 1500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Silverado 2500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Silverado 3500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Sonic') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Spark') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'SS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'SSR') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Suburban') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Tahoe') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Trailblazer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Traverse') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Trax') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Uplander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (4, 'Volt') ON CONFLICT (make_id, model) DO NOTHING;

-- Nissan
INSERT INTO public.vehicle_makes (id, make) VALUES (5, 'Nissan') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, '350Z') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, '370Z') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Altima') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Armada') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Ariya') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Cube') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Frontier') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'GT-R') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Juke') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Kicks') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Leaf') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Maxima') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Murano') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Pathfinder') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Quest') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Rogue') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Rogue Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Sentra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Titan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Versa') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Versa Note') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Xterra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (5, 'Z') ON CONFLICT (make_id, model) DO NOTHING;

-- Hyundai
INSERT INTO public.vehicle_makes (id, make) VALUES (6, 'Hyundai') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Accent') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Azera') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Elantra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Elantra GT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Entourage') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Equus') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Genesis') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Genesis Coupe') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Ioniq') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Ioniq 5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Ioniq 6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Kona') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Nexo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Palisade') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Santa Cruz') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Santa Fe') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Santa Fe Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Sonata') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Tucson') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Veloster') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (6, 'Venue') ON CONFLICT (make_id, model) DO NOTHING;

-- Kia
INSERT INTO public.vehicle_makes (id, make) VALUES (7, 'Kia') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Amanti') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Borrego') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Cadenza') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Carnival') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'EV6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'EV9') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Forte') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Forte Koup') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'K5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'K900') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Niro') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Niro EV') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Optima') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Rio') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Rondo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Sedona') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Seltos') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Sorento') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Soul') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Spectra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Sportage') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Stinger') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (7, 'Telluride') ON CONFLICT (make_id, model) DO NOTHING;

-- Jeep
INSERT INTO public.vehicle_makes (id, make) VALUES (8, 'Jeep') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Cherokee') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Commander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Compass') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Gladiator') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Grand Cherokee') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Grand Wagoneer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Liberty') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Patriot') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Renegade') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Wagoneer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (8, 'Wrangler') ON CONFLICT (make_id, model) DO NOTHING;

-- Ram
INSERT INTO public.vehicle_makes (id, make) VALUES (9, 'Ram') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, '1500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, '1500 Classic') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, '2500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, '3500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, 'C/V') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, 'Dakota') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, 'ProMaster') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (9, 'ProMaster City') ON CONFLICT (make_id, model) DO NOTHING;

-- GMC
INSERT INTO public.vehicle_makes (id, make) VALUES (10, 'GMC') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Acadia') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Canyon') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Envoy') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Hummer EV') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Jimmy') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Safari') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Savana') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Sierra 1500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Sierra 2500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Sierra 3500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Terrain') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Yukon') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (10, 'Yukon XL') ON CONFLICT (make_id, model) DO NOTHING;

-- Subaru
INSERT INTO public.vehicle_makes (id, make) VALUES (11, 'Subaru') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Ascent') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'B9 Tribeca') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'BRZ') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Baja') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Crosstrek') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Forester') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Impreza') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Legacy') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Outback') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Solterra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'Tribeca') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'WRX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (11, 'XV Crosstrek') ON CONFLICT (make_id, model) DO NOTHING;

-- Volkswagen
INSERT INTO public.vehicle_makes (id, make) VALUES (12, 'Volkswagen') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Arteon') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Atlas') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Atlas Cross Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Beetle') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'CC') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Eos') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'GLI') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'GTI') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Golf') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Golf R') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Golf SportWagen') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'ID.4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Jetta') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Passat') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Phaeton') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'R32') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Rabbit') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Routan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Taos') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Tiguan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (12, 'Touareg') ON CONFLICT (make_id, model) DO NOTHING;

-- Mazda
INSERT INTO public.vehicle_makes (id, make) VALUES (13, 'Mazda') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-30') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-50') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-9') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'CX-90') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'MAZDA2') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'MAZDA3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'MAZDA5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'MAZDA6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'MX-5 Miata') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'RX-8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (13, 'Tribute') ON CONFLICT (make_id, model) DO NOTHING;

-- Dodge
INSERT INTO public.vehicle_makes (id, make) VALUES (14, 'Dodge') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Avenger') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Caliber') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Challenger') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Charger') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Dart') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Durango') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Grand Caravan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Hornet') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Journey') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Magnum') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Neon') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Nitro') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Ram 1500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Ram 2500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Ram 3500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Stratus') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (14, 'Viper') ON CONFLICT (make_id, model) DO NOTHING;

-- Chrysler
INSERT INTO public.vehicle_makes (id, make) VALUES (15, 'Chrysler') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, '200') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, '300') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Aspen') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Crossfire') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Pacifica') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'PT Cruiser') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Sebring') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Town & Country') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (15, 'Voyager') ON CONFLICT (make_id, model) DO NOTHING;

-- BMW
INSERT INTO public.vehicle_makes (id, make) VALUES (16, 'BMW') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '1 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '2 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '3 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '4 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '5 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '6 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '7 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, '8 Series') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'i3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'i4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'i7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'i8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'iX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M2') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'M8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X1') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X2') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'X7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'XM') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'Z3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (16, 'Z4') ON CONFLICT (make_id, model) DO NOTHING;

-- Mercedes-Benz
INSERT INTO public.vehicle_makes (id, make) VALUES (17, 'Mercedes-Benz') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'A-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'B-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'C-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'CL-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'CLA-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'CLK-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'CLS-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'E-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'EQB') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'EQE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'EQS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'G-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GL-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLA-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLB-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLC-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLE-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLK-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'GLS-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'M-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'Maybach') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'Metris') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'R-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'S-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'SL-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'SLK-Class') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'SLS AMG') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (17, 'Sprinter') ON CONFLICT (make_id, model) DO NOTHING;

-- Audi
INSERT INTO public.vehicle_makes (id, make) VALUES (18, 'Audi') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A4 allroad') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A6 allroad') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'A8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'Q3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'Q4 e-tron') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'Q5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'Q7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'Q8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'R8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'RS3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'RS4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'RS5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'RS6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'RS7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S7') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'S8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'TT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'e-tron') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (18, 'e-tron GT') ON CONFLICT (make_id, model) DO NOTHING;

-- Lexus
INSERT INTO public.vehicle_makes (id, make) VALUES (19, 'Lexus') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'CT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'ES') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'GS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'GX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'HS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'IS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'LC') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'LFA') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'LS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'LX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'NX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'RC') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'RX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'RZ') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'SC') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'TX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (19, 'UX') ON CONFLICT (make_id, model) DO NOTHING;

-- Acura
INSERT INTO public.vehicle_makes (id, make) VALUES (20, 'Acura') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'ILX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'Integra') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'MDX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'NSX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'RDX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'RL') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'RLX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'RSX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'TL') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'TLX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'TSX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (20, 'ZDX') ON CONFLICT (make_id, model) DO NOTHING;

-- Infiniti
INSERT INTO public.vehicle_makes (id, make) VALUES (21, 'Infiniti') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'EX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'FX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'G') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'M') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'Q40') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'Q50') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'Q60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'Q70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX30') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX50') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX55') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX56') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (21, 'QX80') ON CONFLICT (make_id, model) DO NOTHING;

-- Cadillac
INSERT INTO public.vehicle_makes (id, make) VALUES (22, 'Cadillac') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'ATS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'CT4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'CT5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'CT6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'CTS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'DTS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'ELR') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'Escalade') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'Escalade ESV') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'Lyriq') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'SRX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'STS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'XLR') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'XT4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'XT5') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'XT6') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (22, 'XTS') ON CONFLICT (make_id, model) DO NOTHING;

-- Tesla
INSERT INTO public.vehicle_makes (id, make) VALUES (23, 'Tesla') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Cybertruck') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Model 3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Model S') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Model X') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Model Y') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (23, 'Roadster') ON CONFLICT (make_id, model) DO NOTHING;

-- Volvo
INSERT INTO public.vehicle_makes (id, make) VALUES (24, 'Volvo') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'C30') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'C40') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'C70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'S40') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'S60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'S80') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'S90') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'V40') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'V50') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'V60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'V70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'V90') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'XC40') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'XC60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'XC70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (24, 'XC90') ON CONFLICT (make_id, model) DO NOTHING;

-- Land Rover
INSERT INTO public.vehicle_makes (id, make) VALUES (25, 'Land Rover') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Defender') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Discovery') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Discovery Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Freelander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'LR2') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'LR3') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'LR4') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Range Rover') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Range Rover Evoque') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Range Rover Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (25, 'Range Rover Velar') ON CONFLICT (make_id, model) DO NOTHING;

-- Mitsubishi
INSERT INTO public.vehicle_makes (id, make) VALUES (26, 'Mitsubishi') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Eclipse') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Eclipse Cross') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Endeavor') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Galant') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Lancer') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Lancer Evolution') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Mirage') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Montero') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Outlander') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Outlander Sport') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'Raider') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (26, 'i-MiEV') ON CONFLICT (make_id, model) DO NOTHING;

-- Buick
INSERT INTO public.vehicle_makes (id, make) VALUES (27, 'Buick') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Cascada') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Enclave') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Encore') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Encore GX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Envision') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Envista') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'LaCrosse') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'LeSabre') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Lucerne') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Park Avenue') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Rainier') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Regal') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Rendezvous') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Terraza') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (27, 'Verano') ON CONFLICT (make_id, model) DO NOTHING;

-- Lincoln
INSERT INTO public.vehicle_makes (id, make) VALUES (28, 'Lincoln') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Aviator') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Corsair') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Continental') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'LS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'MKC') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'MKS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'MKT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'MKX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'MKZ') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Mark LT') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Navigator') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Nautilus') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Town Car') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (28, 'Zephyr') ON CONFLICT (make_id, model) DO NOTHING;

-- Mini
INSERT INTO public.vehicle_makes (id, make) VALUES (29, 'Mini') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Clubman') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Convertible') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Countryman') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Coupe') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Hardtop') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Paceman') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (29, 'Roadster') ON CONFLICT (make_id, model) DO NOTHING;

-- Fiat
INSERT INTO public.vehicle_makes (id, make) VALUES (30, 'Fiat') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (30, '124 Spider') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (30, '500') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (30, '500 Abarth') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (30, '500L') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (30, '500X') ON CONFLICT (make_id, model) DO NOTHING;

-- Alfa Romeo
INSERT INTO public.vehicle_makes (id, make) VALUES (31, 'Alfa Romeo') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (31, '4C') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (31, 'Giulia') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (31, 'Stelvio') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (31, 'Tonale') ON CONFLICT (make_id, model) DO NOTHING;

-- Genesis
INSERT INTO public.vehicle_makes (id, make) VALUES (32, 'Genesis') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'Electrified G80') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'Electrified GV70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'G70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'G80') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'G90') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'GV60') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'GV70') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (32, 'GV80') ON CONFLICT (make_id, model) DO NOTHING;

-- Porsche
INSERT INTO public.vehicle_makes (id, make) VALUES (33, 'Porsche') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, '718 Boxster') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, '718 Cayman') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, '911') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Boxster') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Cayenne') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Cayman') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Macan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Panamera') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (33, 'Taycan') ON CONFLICT (make_id, model) DO NOTHING;

-- Jaguar
INSERT INTO public.vehicle_makes (id, make) VALUES (34, 'Jaguar') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'E-PACE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'F-PACE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'F-TYPE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'I-PACE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'S-Type') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'X-Type') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'XE') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'XF') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'XJ') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (34, 'XK') ON CONFLICT (make_id, model) DO NOTHING;

-- Maserati
INSERT INTO public.vehicle_makes (id, make) VALUES (35, 'Maserati') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'Ghibli') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'GranTurismo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'Grecale') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'Levante') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'MC20') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (35, 'Quattroporte') ON CONFLICT (make_id, model) DO NOTHING;

-- Aston Martin
INSERT INTO public.vehicle_makes (id, make) VALUES (36, 'Aston Martin') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'DB9') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'DB11') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'DBS') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'DBX') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'Rapide') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'Vanquish') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'Vantage') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (36, 'Virage') ON CONFLICT (make_id, model) DO NOTHING;

-- Bentley
INSERT INTO public.vehicle_makes (id, make) VALUES (37, 'Bentley') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Arnage') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Azure') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Bentayga') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Continental') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Flying Spur') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (37, 'Mulsanne') ON CONFLICT (make_id, model) DO NOTHING;

-- Rolls-Royce
INSERT INTO public.vehicle_makes (id, make) VALUES (38, 'Rolls-Royce') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Cullinan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Dawn') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Ghost') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Phantom') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Spectre') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (38, 'Wraith') ON CONFLICT (make_id, model) DO NOTHING;

-- Lamborghini
INSERT INTO public.vehicle_makes (id, make) VALUES (39, 'Lamborghini') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Aventador') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Gallardo') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Huracan') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Murcielago') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Revuelto') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (39, 'Urus') ON CONFLICT (make_id, model) DO NOTHING;

-- Ferrari
INSERT INTO public.vehicle_makes (id, make) VALUES (40, 'Ferrari') ON CONFLICT (make) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, '296 GTB') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, '458') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, '488') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, '599') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, '612') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'California') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'F12') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'F430') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'F8') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'FF') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'GTC4Lusso') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'LaFerrari') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'Portofino') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'Roma') ON CONFLICT (make_id, model) DO NOTHING;
INSERT INTO public.vehicle_models (make_id, model) VALUES (40, 'SF90') ON CONFLICT (make_id, model) DO NOTHING;

COMMIT;

-- Total: 40 makes, 594 models
