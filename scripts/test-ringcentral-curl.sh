#!/bin/bash

# Load environment variables
export $(grep -v '^#' .env.local | xargs)

echo "Testing RingCentral JWT Authentication with cURL..."
echo ""
echo "Client ID: $RINGCENTRAL_CLIENT_ID"
echo "From: $RINGCENTRAL_PHONE_NUMBER"
echo "Server: https://platform.ringcentral.com"
echo ""

curl -u "$RINGCENTRAL_CLIENT_ID:$RINGCENTRAL_CLIENT_SECRET" \
  -X POST "https://platform.ringcentral.com/restapi/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=$RINGCENTRAL_JWT_TOKEN"

echo ""
