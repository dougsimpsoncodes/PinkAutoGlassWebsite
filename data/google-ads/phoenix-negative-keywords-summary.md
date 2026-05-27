# Phoenix Negative Keyword Trim Summary

Source baseline: `data/google-ads/negative-keywords-upload.csv`
Output: `data/google-ads/phoenix-negative-keywords-upload.csv`

What I verified
- Arizona service area on the site is broader Phoenix metro, not just 4 cities.
- Verified served cities from `src/app/arizona/page.tsx`:
  Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale, Peoria, Surprise, Goodyear, Avondale, Buckeye, Fountain Hills, Queen Creek, Apache Junction, Cave Creek, Maricopa, El Mirage, Litchfield Park, Ahwatukee.

What I changed
- Removed Denver/Colorado-specific geo negatives and street-address negatives from the Denver list.
- Kept generic non-service, competitor, DIY, jobs, parts-only, and wrong-vehicle negatives.
- Added Phoenix-market out-of-service local negatives for Arizona cities/regions not in the verified service area.
- Added a few nearby out-of-state spillover metros likely to leak if match types expand.

Counts
- Original rows: 279
- Removed Denver-specific geo/address rows: 37
- Final rows: 279

Removed Denver-specific examples
- gunnison auto glass
- pikes peak
- a+ glass salida
- cheyenne
- wyoming
- laramie
- gillette
- lincoln ne
- charlotte
- lodi
- cincinnati
- mckinney
- el paso
- keene
- brevard
- virginia beach
- belton
- loveland
- longmont
- grand junction

Added Phoenix out-of-service geos
- tucson (Broad)
- oro valley (Phrase)
- marana (Phrase)
- casas adobes (Phrase)
- flagstaff (Broad)
- sedona (Broad)
- prescott (Broad)
- prescott valley (Phrase)
- cottonwood (Broad)
- camp verde (Phrase)
- show low (Phrase)
- payson (Broad)
- lake havasu (Phrase)
- lake havasu city (Phrase)
- bullhead city (Phrase)
- kingman (Broad)
- yuma (Broad)
- sierra vista (Phrase)
- nogales (Broad)
- douglas az (Phrase)
- casa grande (Phrase)
- coolidge az (Phrase)
- florence az (Phrase)
- winslow az (Phrase)
- globe az (Phrase)
- safford az (Phrase)
- bisbee az (Phrase)
- verde valley (Phrase)

Added nearby spillover geos
- las vegas (Broad)
- henderson nv (Phrase)
- mesquite nv (Phrase)
- st george ut (Phrase)
- albuquerque (Broad)
- farmington nm (Phrase)
- el centro ca (Phrase)
- palm springs (Broad)
- indio ca (Phrase)

Recommendation
- Use this as the Phoenix baseline shared negative list.
- Keep geo targeting itself restricted to the launch zone you chose.
- Do NOT add negatives for Chandler/Gilbert/Glendale/etc. unless you want to permanently suppress broader Phoenix-metro demand, because the site currently represents those as served areas.
