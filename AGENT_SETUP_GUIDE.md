# Pink Auto Glass - Agent/Developer Setup Guide

## Project Overview
**Pink Auto Glass** is a lead generation website for mobile auto glass repair and replacement services in Denver, Colorado. The site features a streamlined 3-step booking form, mobile-first design, and integration with Supabase for data management.

## Quick Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Access to Supabase project (or ability to create one)
- Git for version control

### 2. Initial Setup
```bash
# Clone the repository (if not already done)
git clone [repository-url]
cd pinkautoglasswebsite

# Install dependencies
npm install

# Check current branch
git branch -a
# Note: We have a fix/canonical-alignment branch with latest security improvements
```

### 3. Environment Configuration
```bash
# Create .env.local file with these required variables:
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EOF
```

**Current Production Values (if authorized):**
- URL: `https://fypzafbsfrrlrrufzkol.supabase.co`
- Key: Available in existing .env.local

### 4. Database Setup

#### A. Apply the Canonical Migration
The database uses a secure RPC-based architecture. Apply this migration to your Supabase project:

```sql
-- Location: supabase/migrations/2025-08-21_canonical.sql
-- This creates:
-- 1. leads table with proper structure
-- 2. media table for photo uploads
-- 3. Secure RPC functions (fn_insert_lead, fn_add_media)
-- 4. Row Level Security policies
-- 5. Service type enum ('repair', 'replacement')
```

**To Apply:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/2025-08-21_canonical.sql`
3. Run the migration

#### B. Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create new bucket called `uploads`
3. Set to PRIVATE (not public)

### 5. Start Development Server
```bash
# Standard development
npm run dev

# With network access (for mobile testing)
npm run dev -- --hostname 0.0.0.0
```

### 6. Test the Setup
```bash
# Test JSON booking submission
curl -X POST http://localhost:3000/api/booking/submit \
  -H "Content-Type: application/json" \
  -d @tmp/sample-booking.json

# Expected response when working:
# {"leadId":"uuid-here","files":[]}
```

## Project Structure

```
pinkautoglasswebsite/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── page.tsx            # Homepage (lead-gen focused)
│   │   ├── book/              # Booking flow (3 steps)
│   │   │   └── page.tsx       # Main booking page
│   │   └── api/               # API endpoints
│   │       └── booking/
│   │           └── submit/    # Booking submission endpoint
│   ├── components/
│   │   ├── book/              # Booking form components
│   │   │   ├── service-vehicle.tsx    # Step 1: Service & Vehicle
│   │   │   ├── contact-location.tsx   # Step 2: Contact & Location
│   │   │   └── review-submit.tsx      # Step 3: Review & Submit
│   │   ├── header.tsx         # Global header with logo
│   │   └── footer.tsx         # Global footer
│   ├── lib/
│   │   ├── booking-schema.ts  # Zod validation schemas
│   │   └── supabase.ts        # Supabase client config
│   └── data/
│       └── vehicles.ts        # Vehicle database for dropdowns
├── public/
│   ├── pink-logo-horizontal.png  # Main logo
│   └── hero-bg.jpg              # Hero background
├── supabase/
│   └── migrations/            # Database migrations
└── tmp/                       # Test files and scripts
```

## Key Technical Decisions

### 1. Security Architecture
- **NO SERVICE ROLE KEYS** in API routes
- All database operations through SECURITY DEFINER RPC functions
- Row Level Security (RLS) prevents direct table access
- Anonymous users can only execute specific functions

### 2. Data Flow
```
Frontend (camelCase) → API → RPC Functions → Database (snake_case)
```
- Frontend uses camelCase (JavaScript convention)
- Database uses snake_case (SQL convention)
- Transformation happens in RPC functions

### 3. Service Types
- Frontend/Backend: `'repair'` or `'replacement'`
- Database enum: `service_type` with same values
- Aligned throughout the stack

### 4. File Uploads
- Multipart form data support
- Files stored in Supabase Storage (`uploads` bucket)
- Media records tracked in `media` table
- Path format: `leads/{leadId}/{uuid}-{filename}`

## Common Tasks

### Adding a New Field to Booking Form
1. Update TypeScript type in `src/types/booking.ts`
2. Update Zod schema in `src/lib/booking-schema.ts`
3. Add field to relevant component in `src/components/book/`
4. Update database migration if needed
5. Modify RPC function to handle new field

### Testing Booking Submission
```bash
# With sample data
curl -X POST http://localhost:3000/api/booking/submit \
  -H "Content-Type: application/json" \
  -d @tmp/sample-booking.json

# With file upload
./tmp/sample-upload.sh
```

### Debugging Database Issues
```sql
-- Check if RPC functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('fn_insert_lead', 'fn_add_media');

-- Check recent leads
SELECT id, created_at, first_name, last_name, service_type 
FROM leads 
ORDER BY created_at DESC 
LIMIT 10;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Current Status & Known Issues

### ✅ Completed
- Homepage redesign with lead-gen focus
- 3-step booking form (reduced from 5)
- Horizontal Pink Auto Glass logo
- Universal hamburger menu
- Database security hardening
- Multipart file upload support
- Service type alignment

### ⚠️ In Progress
- Applying canonical migration to production
- Testing booking endpoints with live data

### ❌ TODO
- Create missing pages (services, about, locations, vehicles)
- Implement order tracking functionality
- Add email/SMS notifications
- Analytics integration
- Payment processing

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Test locally
npm run dev

# Commit with descriptive message
git add -A
git commit -m "feat: description of change"

# Push and create PR
git push -u origin feature/your-feature-name
```

### 2. Database Changes
1. Create migration file in `supabase/migrations/`
2. Test on local/staging Supabase project
3. Document changes in PR
4. Apply to production after approval

### 3. Testing Checklist
- [ ] Desktop browser (Chrome, Safari, Firefox)
- [ ] Mobile browser (iOS Safari, Chrome Android)
- [ ] Form submission works
- [ ] File upload works
- [ ] Data saves to database
- [ ] No console errors
- [ ] Lighthouse score > 90

## Troubleshooting

### "Could not find function" Error
- Migration not applied to database
- Check Supabase URL matches your project
- Restart dev server after database changes

### Build Errors
- Run `npm install` to ensure dependencies
- Check `src/data/vehicles.ts` exists
- Verify all imports are correct

### Form Not Submitting
- Check browser console for errors
- Verify API endpoint is running
- Ensure required fields are filled
- Check network tab for API response

### Mobile Testing Issues
- Use `npm run dev -- --hostname 0.0.0.0`
- Access via computer's IP address
- Ensure devices on same network

## Support & Resources

### Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)

### Project Files
- `DATABASE_REVIEW_INSTRUCTIONS.md` - Database audit guide
- `SECURITY_DEPLOYMENT_GUIDE.md` - Security implementation
- `SITE_MAP.html` - Visual site structure

### Contact
- Project Lead: [Contact Info]
- Technical Issues: Create GitHub issue
- Emergency: Check `CLAUDE.md` for instructions

## Quick Commands Reference

```bash
# Development
npm run dev                        # Start dev server on port 3000
npm run build                      # Build for production
npm run lint                       # Run linter
npm run test                       # Run Playwright tests

# Database
psql $DATABASE_URL                 # Connect to database
npx supabase migration new         # Create new migration
npx supabase db push               # Apply migrations

# API Testing - JSON submission
./tmp/sample-booking-json.sh       # Submit JSON booking
# Or directly:
curl -X POST http://localhost:3000/api/booking/submit \
  -H "Content-Type: application/json" \
  -d @tmp/sample-booking.json

# API Testing - Multipart with file upload
./tmp/sample-upload.sh              # Submit with file
# Or directly:
curl -X POST http://localhost:3000/api/booking/submit \
  -F "payload=@tmp/sample-booking.json" \
  -F "file=@tmp/test-image.jpg;type=image/jpeg"

# Response format:
# { "ok": true, "id": "uuid", "referenceNumber": "REF-XXX", "files": [...] }
```

## Security Notes

⚠️ **NEVER**:
- Commit `.env.local` or `.env` files
- Use service role key in client code
- Expose sensitive data in console logs
- Disable RLS policies in production

✅ **ALWAYS**:
- Use environment variables for secrets
- Validate input with Zod schemas
- Use RPC functions for database operations
- Test on staging before production

---

**Last Updated:** August 2025
**Version:** 1.0.0
**Status:** Active Development