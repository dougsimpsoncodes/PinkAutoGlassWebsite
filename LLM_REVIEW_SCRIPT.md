# RingCentral JWT Authentication Issue - Expert Advice Needed

## Problem
Getting persistent "Invalid assertion signature" error (OAU-345) when authenticating RingCentral SDK with JWT credentials.

## Error Details
```
error: "invalid_request"
error_description: "Invalid assertion signature"
errorCode: "OAU-345"
```

## Configuration
- **App Type**: REST API (not Demonstration App)
- **Auth Flow**: JWT (selected during app creation)
- **Scopes**: SMS, Read Messages
- **JWT Authorization**: "All apps created by developers within my organization"
- **Environment**: Production (https://platform.ringcentral.com)
- **SDK**: @ringcentral/sdk (npm package)

## What We've Tried
1. ✅ Created production REST API app in RingCentral Developer Console
2. ✅ Generated JWT credential from Organization → Credentials tab
3. ✅ Verified JWT is authorized for "All apps created by developers within my organization"
4. ✅ Using correct Client ID, Client Secret, and JWT token in code
5. ❌ Still getting signature validation error

## Authentication Code
```javascript
const { SDK } = require('@ringcentral/sdk');

const rcClient = new SDK({
  server: 'https://platform.ringcentral.com',
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

await rcClient.login({ jwt: process.env.RINGCENTRAL_JWT_TOKEN });
```

## Question
Why would a JWT credential authorized for "All apps created by developers within my organization" still fail with "Invalid assertion signature" when used with an app in that organization?

Is there a cryptographic linking step we're missing between the JWT and the specific app? Should the JWT be created from within the app's Credentials tab instead of the Organization Credentials tab?

## JWT Token Structure (decoded header)
```json
{
  "kid": "87624598d05944db86bf5ca978047608",
  "typ": "JWT",
  "alg": "RS256"
}
```

The JWT has a proper `kid` (key ID) and is signed with RS256. Token expires in 2094 (exp: 3909251627).

## What We Need
1. **Root cause** - Why is the signature failing?
2. **Solution** - How to properly link JWT to app?
3. **Alternative** - Should we use password auth instead?
