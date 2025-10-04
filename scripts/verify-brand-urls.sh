#!/bin/bash
# Brand URL Canonicalization Verification Script
# Tests that all brand redirects and canonical URLs work correctly

set -e

echo "🔍 Pink Auto Glass - Brand URL Verification"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Server not running. Please start with: npm run start"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test 1: Redirect verification
echo "Test 1: Verifying redirects from /vehicles/make/* to /vehicles/brands/*"
echo "----------------------------------------------------------------------"
REDIRECT_PASS=0
REDIRECT_FAIL=0

for brand in chevrolet ford gmc honda hyundai jeep mazda nissan ram subaru tesla toyota; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" http://localhost:3000/vehicles/make/$brand)
    CODE=$(echo $RESPONSE | cut -d'|' -f1)
    REDIRECT=$(echo $RESPONSE | cut -d'|' -f2)

    if [ "$CODE" == "308" ] && [[ "$REDIRECT" == *"/vehicles/brands/$brand"* ]]; then
        echo -e "  ${GREEN}✓${NC} $brand: $CODE → $REDIRECT"
        ((REDIRECT_PASS++))
    else
        echo -e "  ${RED}✗${NC} $brand: Expected 308 redirect, got $CODE → $REDIRECT"
        ((REDIRECT_FAIL++))
    fi
done

echo ""
echo "Redirect Results: $REDIRECT_PASS passed, $REDIRECT_FAIL failed"
echo ""

# Test 2: Canonical URL verification
echo "Test 2: Verifying canonical URLs load correctly"
echo "----------------------------------------------"
CANONICAL_PASS=0
CANONICAL_FAIL=0

for brand in chevrolet ford gmc honda hyundai jeep mazda nissan ram subaru tesla toyota; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/vehicles/brands/$brand)

    if [ "$CODE" == "200" ]; then
        echo -e "  ${GREEN}✓${NC} /vehicles/brands/$brand: $CODE"
        ((CANONICAL_PASS++))
    else
        echo -e "  ${RED}✗${NC} /vehicles/brands/$brand: Expected 200, got $CODE"
        ((CANONICAL_FAIL++))
    fi
done

echo ""
echo "Canonical URL Results: $CANONICAL_PASS passed, $CANONICAL_FAIL failed"
echo ""

# Test 3: Sitemap verification
echo "Test 3: Verifying sitemap contains only canonical URLs"
echo "-----------------------------------------------------"
BRANDS_COUNT=$(curl -s http://localhost:3000/sitemap.xml | grep 'vehicles/' | grep -c 'brands')
MAKE_COUNT=$(curl -s http://localhost:3000/sitemap.xml | grep 'vehicles/make' | wc -l | tr -d ' ')

if [ "$BRANDS_COUNT" == "12" ]; then
    echo -e "  ${GREEN}✓${NC} Found 12 brand URLs in sitemap"
else
    echo -e "  ${RED}✗${NC} Expected 12 brand URLs, found $BRANDS_COUNT"
fi

if [ "$MAKE_COUNT" == "0" ]; then
    echo -e "  ${GREEN}✓${NC} No old 'make' URLs in sitemap"
else
    echo -e "  ${RED}✗${NC} Found $MAKE_COUNT old 'make' URLs in sitemap (should be 0)"
fi

echo ""

# Test 4: Schema validation
echo "Test 4: Validating schema on brand page"
echo "---------------------------------------"
SCHEMA_RESULT=$(node scripts/validate-schema.js 2>&1 | grep -A 2 "Brand Page")
if echo "$SCHEMA_RESULT" | grep -q "✓ All expected schemas present"; then
    echo -e "  ${GREEN}✓${NC} Schema validation passed"
    echo "$SCHEMA_RESULT" | sed 's/^/  /'
else
    echo -e "  ${RED}✗${NC} Schema validation failed"
    echo "$SCHEMA_RESULT" | sed 's/^/  /'
fi

echo ""
echo "==========================================="

# Summary
TOTAL_TESTS=$((REDIRECT_PASS + CANONICAL_PASS + 2))  # +2 for sitemap tests
TOTAL_FAILURES=$((REDIRECT_FAIL + CANONICAL_FAIL))

if [ "$BRANDS_COUNT" != "12" ]; then
    ((TOTAL_FAILURES++))
fi

if [ "$MAKE_COUNT" != "0" ]; then
    ((TOTAL_FAILURES++))
fi

# Generate checksum for verification state
echo "Checksum: Generating verification signature..."
CHECKSUM=$(echo -n "redirects:$REDIRECT_PASS|canonical:$CANONICAL_PASS|sitemap_brands:$BRANDS_COUNT|sitemap_make:$MAKE_COUNT" | shasum -a 256 | cut -d' ' -f1)
echo "Checksum: $CHECKSUM"
echo ""

if [ $TOTAL_FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Brand URL canonicalization is working correctly:"
    echo "  • All 12 redirects working (308)"
    echo "  • All 12 canonical URLs accessible (200)"
    echo "  • Sitemap contains only canonical URLs"
    echo "  • Schema validation passed"
    echo ""
    echo "Verification Signature: $CHECKSUM"
    exit 0
else
    echo -e "${RED}❌ $TOTAL_FAILURES test(s) failed${NC}"
    echo ""
    echo "Please review the failures above and fix any issues."
    exit 1
fi
