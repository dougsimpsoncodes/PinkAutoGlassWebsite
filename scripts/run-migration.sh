#!/bin/bash
set -e

echo "==================================================================================="
echo "Pink Auto Glass - Database Schema Migration Script"
echo "==================================================================================="
echo ""

# Print migration file path
MIGRATION_FILE="/Users/dougsimpson/Projects/pinkautoglasswebsite/supabase/migrations/2025-08-20_align_leads_schema.sql"
echo "Migration file location:"
echo "  $MIGRATION_FILE"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ ERROR: Migration file not found at expected location"
    exit 1
fi

echo "✅ Migration file exists"
echo ""

# Display migration instructions
echo "==================================================================================="
echo "MANUAL STEP REQUIRED"
echo "==================================================================================="
echo ""
echo "1. Open your Supabase Dashboard at: https://supabase.com/dashboard"
echo "2. Navigate to your Pink Auto Glass project"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of the migration file:"
echo "   $MIGRATION_FILE"
echo "5. Run the migration SQL"
echo "6. Verify the migration completed successfully"
echo ""
echo "Press ENTER when you have completed the migration..."
read -r

echo ""
echo "==================================================================================="
echo "Testing API Endpoint"
echo "==================================================================================="
echo ""

# Sample payload for testing
SAMPLE_PAYLOAD='{
  "service_type": "repair",
  "mobile_service": true,
  "first_name": "John",
  "last_name": "Smith",
  "phone": "(555) 123-4567",
  "email": "john.smith@example.com",
  "vehicle_year": 2020,
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "address": "123 Main Street",
  "city": "Denver",
  "state": "CO",
  "zip": "80202",
  "preferred_date": "tomorrow",
  "time_preference": "morning",
  "notes": "Small chip in passenger side",
  "sms_consent": true,
  "terms_accepted": true,
  "privacy_acknowledgment": true,
  "source": "test_script",
  "referral_code": "TEST2024"
}'

echo "Testing POST /api/booking/submit with sample payload..."
echo ""

# Make the API call
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$SAMPLE_PAYLOAD" \
  http://localhost:3000/api/booking/submit)

# Extract HTTP status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "Response Status: $HTTP_STATUS"
echo "Response Body:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"
echo ""

# Check if successful
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ SUCCESS: API endpoint returned 200 OK"
    echo "✅ Migration and API integration test completed successfully!"
else
    echo "❌ ERROR: API endpoint returned status $HTTP_STATUS"
    echo "❌ Please check the server logs and verify the migration was applied correctly"
    exit 1
fi

echo ""
echo "==================================================================================="
echo "Migration Test Complete"
echo "==================================================================================="
echo ""
echo "Next steps:"
echo "1. Regenerate TypeScript types from Supabase: npx supabase gen types typescript"
echo "2. Update any remaining type mismatches in the frontend"
echo "3. Test the complete booking flow in the browser"
echo ""