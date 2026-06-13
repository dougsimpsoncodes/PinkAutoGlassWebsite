#!/bin/bash
# Auto-quoter funnel analysis — quotes priced → contact captured → booked.
# Reads prod via Supabase management API (same pattern as analyze-discount-rescue.sh).
# Usage: ./scripts/analyze-quoter-funnel.sh
set -euo pipefail
TOKEN=$(cat ~/.supabase/access-token)
REF="fypzafbsfrrlrrufzkol"

q() {
  curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $TOKEN" \
    -H "User-Agent: pag-analysis" \
    -H "Content-Type: application/json" \
    -d "$(python3 -c "import json,sys; print(json.dumps({'query': sys.argv[1]}))" "$1")"
  echo
}

echo "=== 1. Daily funnel (tests excluded, Denver tz) ==="
q "SELECT (created_at AT TIME ZONE 'America/Denver')::date AS day,
     count(*) AS quotes_priced,
     count(*) FILTER (WHERE contact_submitted_at IS NOT NULL) AS contact_captured
   FROM automated_quotes
   WHERE coalesce(is_test,false)=false AND created_at >= now() - interval '21 days'
   GROUP BY 1 ORDER BY 1;"

echo "=== 2. Daily bookings + revenue (tests excluded) ==="
q "SELECT (created_at AT TIME ZONE 'America/Denver')::date AS day,
     count(*) AS bookings,
     count(*) FILTER (WHERE discount_pct>0) AS discount_bookings,
     round(sum(accepted_total_cents)/100.0,0) AS rev_usd
   FROM automated_quote_bookings
   WHERE coalesce(is_test,false)=false AND created_at >= now() - interval '21 days'
   GROUP BY 1 ORDER BY 1;"

echo "=== 3. Quote→book conversion rate, last 7d vs prior 7d ==="
q "WITH x AS (
     SELECT q.id,
       CASE WHEN q.created_at >= now() - interval '7 days' THEN 'last_7d'
            WHEN q.created_at >= now() - interval '14 days' THEN 'prior_7d' END AS bucket,
       (SELECT 1 FROM automated_quote_bookings b WHERE b.quote_id=q.id AND coalesce(b.is_test,false)=false LIMIT 1) AS booked
     FROM automated_quotes q
     WHERE coalesce(q.is_test,false)=false AND q.created_at >= now() - interval '14 days')
   SELECT bucket, count(*) AS quotes, count(booked) AS bookings,
     round(100.0*count(booked)/nullif(count(*),0),1) AS quote_to_book_pct,
     round(100.0*count(*) FILTER (WHERE booked IS NULL)/nullif(count(*),0),1) AS unbooked_pct
   FROM x WHERE bucket IS NOT NULL GROUP BY bucket ORDER BY bucket DESC;"

echo "=== 4. Discount-rescue bookings (incremental — historical 0% cohort) ==="
q "SELECT (b.created_at AT TIME ZONE 'America/Denver')::date AS day,
     b.discount_pct, b.accepted_total_cents/100.0 AS paid_usd,
     round(extract(epoch FROM (b.created_at - aq.created_at))/60.0,0) AS mins_quote_to_book
   FROM automated_quote_bookings b JOIN automated_quotes aq ON aq.id=b.quote_id
   WHERE coalesce(b.is_test,false)=false AND b.discount_pct>0
     AND b.created_at >= now() - interval '21 days'
   ORDER BY b.created_at;"
