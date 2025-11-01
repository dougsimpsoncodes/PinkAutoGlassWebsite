# Google Ads API Setup Guide

This guide will walk you through setting up Google Ads API access for Pink Auto Glass to pull campaign performance data and track ROI.

## Overview

We need to connect to the Google Ads API to:
- Pull daily campaign performance (impressions, clicks, cost, conversions)
- Track which campaigns drive phone calls
- Calculate ROI by connecting ad spend to revenue
- Automate daily reporting

## Prerequisites

- Google Ads account with admin access
- Google Cloud Console access
- Your Google Ads Customer ID (10-digit number, format: XXX-XXX-XXXX)

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top → "New Project"
3. Project name: `pink-auto-glass-ads-api`
4. Click "Create"
5. Wait for the project to be created (takes ~30 seconds)

## Step 2: Enable Google Ads API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Ads API"
3. Click on "Google Ads API"
4. Click "Enable"
5. Wait for the API to be enabled

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Configure Consent Screen"
3. Choose "External" (unless you have a Google Workspace account)
4. Click "Create"

### Configure OAuth Consent Screen:
- App name: `Pink Auto Glass Analytics`
- User support email: Your email
- Developer contact email: Your email
- Click "Save and Continue"

### Add Scopes:
- Click "Add or Remove Scopes"
- Search for "Google Ads API"
- Check the box for `https://www.googleapis.com/auth/adwords`
- Click "Update"
- Click "Save and Continue"

### Add Test Users (important!):
- Click "Add Users"
- Add your Google account email (the one that has access to Google Ads)
- Click "Save and Continue"

### Finish:
- Review the summary
- Click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Client ID

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: `Pink Auto Glass Web Client`
5. Authorized redirect URIs:
   - Click "Add URI"
   - Enter: `http://localhost:3000/api/auth/google/callback`
   - Click "Add URI"
   - Enter: `https://developers.google.com/oauthplayground`
6. Click "Create"
7. **IMPORTANT**: Copy the Client ID and Client Secret - you'll need these!

## Step 5: Get Refresh Token

Now we need to get a refresh token using OAuth Playground:

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your Client ID and Client Secret from Step 4
5. Close the settings

### Authorize the API:
1. In the left panel, find "Google Ads API v17"
2. Check the box for `https://www.googleapis.com/auth/adwords`
3. Click "Authorize APIs"
4. Sign in with your Google account (the one with Google Ads access)
5. Click "Advanced" → "Go to Pink Auto Glass Analytics (unsafe)"
6. Click "Continue"
7. Review permissions and click "Continue"

### Exchange Authorization Code:
1. You'll be redirected back to OAuth Playground
2. Click "Exchange authorization code for tokens"
3. **IMPORTANT**: Copy the "Refresh token" - you'll need this!

## Step 6: Get Google Ads Developer Token

1. Go to [Google Ads](https://ads.google.com/)
2. Click on "Tools & Settings" (wrench icon)
3. Under "Setup", click "API Center"
4. If you don't have a developer token:
   - Click "Create Token"
   - Fill out the application form
   - Note: Basic access is usually approved automatically for read-only access
5. Copy your Developer Token

## Step 7: Get Your Customer ID

1. In Google Ads, look at the top right corner
2. You'll see a 10-digit number (format: XXX-XXX-XXXX)
3. This is your Customer ID
4. **Remove the dashes** - we need it as: XXXXXXXXXX

## Step 8: Add Credentials to .env.local

Add these environment variables to your `.env.local` file:

```bash
# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CUSTOMER_ID=your_customer_id_here (10 digits, no dashes)
```

## What You Need to Provide

Please provide the following:

1. **Client ID** (from Step 4) - starts with something like `123456789-abc...apps.googleusercontent.com`
2. **Client Secret** (from Step 4) - starts with `GOCSPX-...`
3. **Refresh Token** (from Step 5) - starts with `1//...`
4. **Developer Token** (from Step 6) - format varies
5. **Customer ID** (from Step 7) - 10 digits, no dashes

## Troubleshooting

### "Access Not Configured" Error
- Make sure you enabled the Google Ads API in Step 2
- Wait a few minutes after enabling - it can take time to propagate

### "Invalid Grant" Error
- Your refresh token may have expired
- Go back to Step 5 and generate a new refresh token

### "Developer Token Invalid" Error
- Make sure your developer token is approved
- Basic access is usually sufficient for read-only operations

### "Customer Not Found" Error
- Verify your Customer ID is correct (10 digits, no dashes)
- Make sure the Google account you authorized has access to this customer

## Next Steps

Once you provide the credentials, I'll:
1. Add them to `.env.local`
2. Create the Google Ads sync API endpoint
3. Test the connection and pull sample data
4. Create the ROI dashboard that combines Google Ads + RingCentral data

## Questions?

If you get stuck at any step, let me know where you're having trouble and I'll help troubleshoot!
