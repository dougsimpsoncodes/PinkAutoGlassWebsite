#!/usr/bin/env bash
set -euo pipefail

# Verify Stale Data Fix
# This script deploys to production and verifies both endpoints return fresh data

# CONFIG
BASE_URL="https://pinkautoglass.com"
ADMIN_USER="admin"
ADMIN_PASS="Pink!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Stale Data Fix - Deploy & Verify"
echo "================================================"
echo ""

# Check dependencies
need() {
  command -v "$1" >/dev/null 2>&1 || {
    echo -e "${RED}Missing $1. Install it and re-run.${NC}"
    exit 1
  }
}

need vercel
need curl

if ! command -v jq >/dev/null 2>&1; then
  echo -e "${YELLOW}jq not found; output will not be pretty-printed.${NC}"
  JQ="cat"
else
  JQ="jq"
fi

echo -e "${YELLOW}Step 1: Deploying to Vercel (production)...${NC}"
DEPLOY_URL=$(vercel deploy --prod --yes 2>&1 | grep -o 'https://[^ ]*' | head -1 || echo "")

if [ -z "$DEPLOY_URL" ]; then
  echo -e "${RED}Failed to get deployment URL. Check vercel output above.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Deployed: $DEPLOY_URL${NC}"
echo ""

echo -e "${YELLOW}Step 2: Waiting 30 seconds for deployment to propagate...${NC}"
sleep 30
echo ""

echo "================================================"
echo "  Testing /api/admin/calls (Supabase Client)"
echo "================================================"
CALLS_JSON=$(curl -sS -u "$ADMIN_USER:$ADMIN_PASS" "$BASE_URL/api/admin/calls?limit=5" 2>&1)

if echo "$CALLS_JSON" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Endpoint returned 200 OK${NC}"
  echo ""
  echo "$CALLS_JSON" | $JQ . 2>/dev/null || echo "$CALLS_JSON"
  echo ""

  MOST_RECENT=$(echo "$CALLS_JSON" | jq -r '.mostRecentStartTime // empty' 2>/dev/null || echo "")
  TOTAL=$(echo "$CALLS_JSON" | jq -r '.total // empty' 2>/dev/null || echo "")

  echo -e "${GREEN}mostRecentStartTime: ${MOST_RECENT:-MISSING}${NC}"
  echo -e "${GREEN}total: ${TOTAL:-MISSING}${NC}"
else
  echo -e "${RED}✗ Endpoint failed or returned error${NC}"
  echo "$CALLS_JSON"
fi

echo ""
echo "================================================"
echo "  Testing /api/admin/debug/calls-probe (Direct PostgREST)"
echo "================================================"
PROBE_JSON=$(curl -sS -u "$ADMIN_USER:$ADMIN_PASS" "$BASE_URL/api/admin/debug/calls-probe" 2>&1)

if echo "$PROBE_JSON" | grep -q '"ok":true'; then
  echo -e "${GREEN}✓ Probe endpoint returned 200 OK${NC}"
  echo ""
  echo "$PROBE_JSON" | $JQ . 2>/dev/null || echo "$PROBE_JSON"
  echo ""

  PROBE_RECENT=$(echo "$PROBE_JSON" | jq -r '.restMostRecentStart // empty' 2>/dev/null || echo "")
  PROBE_COUNT=$(echo "$PROBE_JSON" | jq -r '.restCount // empty' 2>/dev/null || echo "")

  echo -e "${GREEN}restMostRecentStart: ${PROBE_RECENT:-MISSING}${NC}"
  echo -e "${GREEN}restCount: ${PROBE_COUNT:-MISSING}${NC}"
else
  echo -e "${RED}✗ Probe endpoint failed or returned error${NC}"
  echo "$PROBE_JSON"
fi

echo ""
echo "================================================"
echo "  COMPARISON SUMMARY"
echo "================================================"

if [[ -n "${MOST_RECENT:-}" && -n "${PROBE_RECENT:-}" ]]; then
  echo ""
  echo "Supabase Client Route (/api/admin/calls):"
  echo "  - mostRecentStartTime: $MOST_RECENT"
  echo "  - total: ${TOTAL:-unknown}"
  echo ""
  echo "Direct PostgREST Probe (/api/admin/debug/calls-probe):"
  echo "  - restMostRecentStart: $PROBE_RECENT"
  echo "  - restCount: ${PROBE_COUNT:-unknown}"
  echo ""

  # Compare dates
  if [[ "$MOST_RECENT" == "$PROBE_RECENT" ]]; then
    echo -e "${GREEN}✓✓✓ SUCCESS! Both endpoints return the same most recent timestamp${NC}"
    echo -e "${GREEN}The stale data issue appears to be RESOLVED.${NC}"
  else
    echo -e "${RED}✗✗✗ MISMATCH! Endpoints return different timestamps${NC}"
    echo -e "${RED}The issue may NOT be fully resolved yet.${NC}"
    echo ""
    echo "This tells us:"
    echo "  - If probe has newer data: Issue is in Supabase JS client"
    echo "  - If both same old data: Issue is database/connection level"
  fi

  # Check if data is recent (within last 24 hours)
  if [[ -n "$PROBE_RECENT" ]]; then
    PROBE_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${PROBE_RECENT%.*}" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    HOURS_AGO=$(( (NOW_EPOCH - PROBE_EPOCH) / 3600 ))

    if [ $HOURS_AGO -lt 24 ]; then
      echo -e "${GREEN}✓ Data is recent (${HOURS_AGO} hours old)${NC}"
    else
      echo -e "${YELLOW}⚠ Data is ${HOURS_AGO} hours old - may still be stale${NC}"
    fi
  fi
else
  echo -e "${RED}One or both timestamps missing. Check responses above.${NC}"
fi

echo ""
echo "================================================"
echo "  Next Steps"
echo "================================================"
echo ""
echo "1. Visit the admin dashboard: $BASE_URL/admin/dashboard/calls"
echo "2. Click the Refresh button"
echo "3. Verify the call count matches restCount: ${PROBE_COUNT:-unknown}"
echo "4. Check that most recent call is from: ${PROBE_RECENT:-unknown}"
echo ""
echo "If verified, you can remove the debug probe endpoint:"
echo "  rm src/app/api/admin/debug/calls-probe/route.ts"
echo "  git add -A && git commit -m 'chore: remove debug probe' && git push"
echo ""
echo "================================================"
echo "Done!"
echo "================================================"
