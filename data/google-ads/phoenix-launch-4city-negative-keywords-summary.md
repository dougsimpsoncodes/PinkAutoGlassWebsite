# Phoenix 4-City Launch-Only Negative Keyword Summary

Source baseline: `data/google-ads/phoenix-negative-keywords-upload.csv`
Output: `data/google-ads/phoenix-launch-4city-negative-keywords-upload.csv`

Purpose
- This is the stricter alternate list for a launch restricted to only four cities:
  Phoenix, Scottsdale, Mesa, Tempe.
- Unlike the broader Phoenix baseline, this file ALSO blocks currently served-but-not-launching Phoenix-metro cities.

Added launch-only city negatives
- chandler (Phrase + Broad)
- gilbert (Phrase + Broad)
- glendale (Phrase + Broad)
- peoria (Phrase + Broad)
- surprise (Phrase + Broad)
- goodyear (Phrase + Broad)
- avondale (Phrase + Broad)
- buckeye (Phrase + Broad)
- fountain hills (Phrase + Broad)
- queen creek (Phrase + Broad)
- apache junction (Phrase + Broad)
- cave creek (Phrase + Broad)
- maricopa (Phrase + Broad)
- el mirage (Phrase + Broad)
- litchfield park (Phrase + Broad)
- ahwatukee (Phrase + Broad)

Notes
- Use this ONLY if you want keyword traffic for those cities suppressed in addition to geo targeting.
- If you are using option A (geo targeting only), keep this file as a fallback, not the default.

Counts
- Base Phoenix list rows: 279
- Added launch-only geo rows: 32
- Final rows: 311
