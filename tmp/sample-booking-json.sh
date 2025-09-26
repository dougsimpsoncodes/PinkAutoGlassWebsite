#!/bin/bash

# Sample JSON booking submission script for Pink Auto Glass API
# Usage: ./tmp/sample-booking-json.sh

# Set the API endpoint
API_URL="${API_URL:-http://localhost:3000}/api/booking/submit"

# Submit the booking
echo "Submitting booking to: $API_URL"
echo "---"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d @tmp/sample-booking.json \
  -w "\n\nHTTP Status: %{http_code}\n"

echo "---"
echo "Submission complete!"