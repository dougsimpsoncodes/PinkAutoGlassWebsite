#!/bin/bash
# Discount rescue flow impact analysis — reads prod via Supabase management API
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

echo "=== 1. Offer events by status since launch ==="
q "SELECT status, count(*) FROM automated_quote_notification_events
   WHERE event_type='quote_unbooked_15m_discount'
   GROUP BY status ORDER BY count DESC;"

echo "=== 2. Offers sent: timeline + channel ==="
q "SELECT date_trunc('hour', processed_at) AS hr, count(*) AS sent,
          count(*) FILTER (WHERE channels_sent::text LIKE '%sms%') AS via_sms,
          count(*) FILTER (WHERE channels_sent::text LIKE '%email%') AS via_email
   FROM automated_quote_notification_events
   WHERE event_type='quote_unbooked_15m_discount' AND status='sent'
   GROUP BY 1 ORDER BY 1;"

echo "=== 3. Quotes with discount offered → did they book? ==="
q "SELECT q.id IS NOT NULL AS has_quote,
          q.discount_offered_at IS NOT NULL AS offered,
          b.id IS NOT NULL AS booked,
          b.discount_pct IS NOT NULL AND b.discount_pct > 0 AS booked_with_discount,
          count(*)
   FROM automated_quotes q
   LEFT JOIN automated_quote_bookings b ON b.quote_id = q.id
   WHERE q.created_at >= '2026-06-10'
   GROUP BY 1,2,3,4 ORDER BY count DESC;"

echo "=== 4. Discount bookings detail (excluding tests) ==="
q "SELECT b.created_at, b.accepted_total_cents/100.0 AS accepted_usd,
          q.total_cents/100.0 AS original_usd, b.discount_pct,
          extract(epoch FROM (b.created_at - q.discount_offered_at))/60 AS mins_after_offer,
          coalesce(b.is_test,false) AS is_test
   FROM automated_quote_bookings b
   JOIN automated_quotes q ON q.id = b.quote_id
   WHERE b.discount_pct > 0
   ORDER BY b.created_at;"

echo "=== 5. Funnel comparison: 7 days pre vs post launch ==="
q "SELECT CASE WHEN q.created_at >= '2026-06-10 18:00+00' THEN 'post' ELSE 'pre' END AS period,
          count(*) AS quotes_priced,
          count(b.id) AS bookings,
          round(100.0*count(b.id)/nullif(count(*),0),1) AS book_rate_pct
   FROM automated_quotes q
   LEFT JOIN automated_quote_bookings b ON b.quote_id = q.id AND coalesce(b.is_test,false)=false
   WHERE q.created_at >= '2026-06-03' AND q.total_cents IS NOT NULL
     AND coalesce(q.is_test,false)=false
   GROUP BY 1;"

echo "=== 6. Rescue page visits (conversion_events) ==="
q "SELECT event_name, count(*), min(created_at), max(created_at)
   FROM conversion_events
   WHERE created_at >= '2026-06-10'
     AND (event_name ILIKE '%rescue%' OR event_name ILIKE '%discount%' OR page_path LIKE '/quote/book/%')
   GROUP BY 1;"

echo "=== 7. Offer expiry status of unconverted offers ==="
q "SELECT count(*) FILTER (WHERE discount_offered_at < now() - interval '24 hours') AS expired_unbooked,
          count(*) FILTER (WHERE discount_offered_at >= now() - interval '24 hours') AS still_live
   FROM automated_quotes q
   WHERE discount_offered_at IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM automated_quote_bookings b WHERE b.quote_id=q.id);"
