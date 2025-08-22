# Database Structure Review & Alignment Instructions

## Objective
Perform a comprehensive review of the Pink Auto Glass website to ensure complete alignment between frontend expectations and backend database structure. Identify all missing elements, inconsistencies, and required fixes.

## Review Scope

### 1. Database Schema Analysis
**Task:** Examine all database-related files to understand the current structure.

**Files to check:**
- `/supabase/schema.sql` - Main database schema
- `/supabase/migrations/*.sql` - All migration files  
- `/db/*.sql` - Any additional database files
- `.env` and `.env.local` - Database connection configurations

**What to document:**
- [ ] List all tables and their columns
- [ ] Identify primary keys and foreign key relationships
- [ ] Note all indexes and constraints
- [ ] Document all stored procedures/functions
- [ ] List all RLS (Row Level Security) policies
- [ ] Note any triggers or automated processes
- [ ] Identify any enums or custom types

### 2. Frontend Data Requirements
**Task:** Analyze what data the frontend expects to send/receive.

**Files to check:**
- `/src/app/book/page.tsx` - Main booking form
- `/src/components/book/*.tsx` - All booking form components
- `/src/types/*.ts` - TypeScript type definitions
- `/src/lib/booking-schema.ts` - Validation schemas
- `/src/app/api/*/route.ts` - All API endpoints

**What to document:**
- [ ] All form fields and their data types
- [ ] Required vs optional fields
- [ ] Field validation rules (regex patterns, min/max values)
- [ ] Expected API request/response formats
- [ ] File upload expectations (photos, documents)
- [ ] Any hardcoded data or enums used

### 3. API Endpoint Analysis
**Task:** Review all API endpoints for data flow.

**Files to check:**
- `/src/app/api/booking/submit/route.ts` - Booking submission
- `/src/app/api/booking/track/route.ts` - Order tracking
- Any other API routes

**What to document:**
- [ ] Request payload structure for each endpoint
- [ ] Response format for each endpoint
- [ ] Database queries being executed
- [ ] Data transformations (snake_case vs camelCase)
- [ ] Authentication/authorization requirements
- [ ] Rate limiting implementation
- [ ] Error handling patterns

### 4. Data Files & Static Content
**Task:** Identify all static data files used by the frontend.

**Look for:**
- Vehicle databases (years, makes, models)
- Service type definitions
- Pricing information
- Location/coverage area data
- Business hours/availability
- State/province lists
- Any other reference data

**What to document:**
- [ ] List all data files that exist
- [ ] List all data files referenced but missing
- [ ] Note the expected structure of missing files
- [ ] Identify where each data file is imported/used

### 5. Database-Frontend Field Mapping
**Task:** Create a detailed mapping of field names between layers.

**Create a table showing:**
```
| Frontend Field | API Field | Database Column | Data Type | Required | Notes |
|---------------|-----------|-----------------|-----------|----------|-------|
| serviceType   | service_type | service_type | enum | Yes | Mismatch in enum values |
| firstName     | first_name | first_name | varchar | Yes | |
| vehicleYear   | vehicle_year | vehicle_year | integer | Yes | |
```

### 6. Identify Misalignments

**Check for:**
- [ ] Field name inconsistencies (camelCase vs snake_case)
- [ ] Data type mismatches
- [ ] Missing database columns for frontend fields
- [ ] Database columns not used by frontend
- [ ] Enum value mismatches
- [ ] Validation rule conflicts
- [ ] Required field discrepancies

### 7. Security & Performance Review

**Analyze:**
- [ ] RLS policies - Do they allow required operations?
- [ ] SQL injection vulnerabilities
- [ ] Missing indexes for common queries
- [ ] N+1 query problems
- [ ] Unnecessary data exposure
- [ ] Rate limiting gaps
- [ ] File upload security

### 8. Missing Functionality

**Identify:**
- [ ] Features in frontend with no backend support
- [ ] Database tables with no frontend interface
- [ ] Incomplete CRUD operations
- [ ] Missing data relationships
- [ ] Unimplemented business logic

## Output Format

### 1. Executive Summary
Brief overview of critical issues found and their impact.

### 2. Critical Issues (Build-Breaking)
List issues that prevent the application from building or running.

### 3. High Priority Issues (Functionality-Breaking)
Issues that prevent core features from working.

### 4. Medium Priority Issues (Feature Gaps)
Missing or incomplete features.

### 5. Low Priority Issues (Improvements)
Performance, security, or UX improvements.

### 6. Detailed Findings
For each issue provide:
- **Issue:** Clear description
- **Location:** Specific files and line numbers
- **Impact:** What breaks or doesn't work
- **Fix Required:** Specific steps to resolve

### 7. Implementation Plan
Ordered list of fixes with:
1. Task description
2. Files to modify
3. Estimated complexity (Simple/Medium/Complex)
4. Dependencies on other tasks

### 8. Code Snippets
Provide ready-to-use code for critical fixes.

## Example Issues to Look For

1. **Missing Vehicle Database**
   - Frontend imports from '@/data/vehicles'
   - File doesn't exist
   - Causes build failure

2. **Service Type Enum Mismatch**
   - Frontend: 'repair' | 'replacement'
   - Backend: 'windshield_repair' | 'windshield_replacement'
   - Causes validation errors

3. **Photo Upload Disconnect**
   - Frontend collects photos
   - Backend API doesn't process them
   - Media tables not migrated

4. **RLS Policy Conflicts**
   - Multiple policies for same operation
   - May block anonymous submissions

5. **Missing UTM Tracking**
   - Frontend sends UTM parameters
   - Database tables lack these columns

## Commands to Run

```bash
# Find all database-related files
find . -name "*.sql" -type f

# Find all API routes
find ./src/app/api -name "route.ts"

# Find all type definitions
find ./src -name "*.ts" -path "*/types/*"

# Search for database imports
grep -r "supabase" ./src --include="*.ts" --include="*.tsx"

# Find all form components
find ./src/components -name "*.tsx" | grep -E "(form|input|booking)"

# Look for data file imports
grep -r "from.*data" ./src --include="*.ts" --include="*.tsx"
```

## Deliverables

1. **DATABASE_REVIEW_REPORT.md** - Complete analysis report
2. **DATABASE_FIX_PLAN.md** - Step-by-step fix implementation plan
3. **Missing files list** - All files that need to be created
4. **SQL migration scripts** - Ready to apply database changes
5. **Code fixes** - TypeScript/JavaScript code updates needed

## Priority Matrix

Use this to categorize issues:

| Impact ↓ / Effort → | Low Effort | Medium Effort | High Effort |
|---------------------|------------|---------------|-------------|
| **Critical**        | Fix Now    | Fix Now       | Fix ASAP    |
| **High**            | Fix ASAP   | Plan Sprint   | Evaluate    |
| **Medium**          | Quick Win  | Backlog       | Defer       |
| **Low**             | If Time    | Defer         | Ignore      |

---

**Note:** Start with build-breaking issues first, then functionality-breaking issues, then feature gaps. Document everything clearly so fixes can be implemented systematically.