#!/usr/bin/env bash
set -euo pipefail
BOUNDARY="---------------------------$(date +%s%N)"
JSON='{"data":{"serviceType":"repair","firstName":"Test","lastName":"User","email":"test@example.com","phoneE164":"+15555550123","address":"123 Main St","city":"Phoenix","state":"AZ","zip":"85001","vehicleYear":2024,"vehicleMake":"Toyota","vehicleModel":"Camry","termsAccepted":true,"privacyAcknowledgment":true,"clientId":"web","sessionId":"abc123","firstTouch":{"utm_source":"ad"},"lastTouch":{"utm_source":"direct"}}}'
FILEPATH="package.json"
{
  printf -- "--%s\r\n" "$BOUNDARY"
  printf 'Content-Disposition: form-data; name="data"\r\n'
  printf 'Content-Type: application/json\r\n\r\n'
  printf '%s\r\n' "$JSON"
  printf -- "--%s\r\n" "$BOUNDARY"
  printf 'Content-Disposition: form-data; name="file1"; filename="%s"\r\n' "$(basename "$FILEPATH")"
  printf 'Content-Type: application/octet-stream\r\n\r\n'
  cat "$FILEPATH"
  printf '\r\n--%s--\r\n' "$BOUNDARY"
} | curl -sS -X POST "$STAGING_BASE_URL/api/booking/submit" -H "Content-Type: multipart/form-data; boundary=$BOUNDARY" --data-binary @-
