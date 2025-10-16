# Database Setup Required

## Missing RPC Function: `fn_get_reference_number`

### Current Status
The application code calls `fn_get_reference_number(p_id)` but this function does not exist in the Supabase database, causing warnings in the logs:
```
Reference number fetch failed: Could not find the function public.fn_get_reference_number(p_id) in the schema cache
```

### Impact
- **Non-blocking**: The application has a fallback that generates reference numbers from the lead ID
- **Functional**: Bookings work correctly without this function
- **User-facing**: Users receive reference numbers in format `REF-{LEADID_FIRST_8_CHARS}`

### Fallback Behavior
Located in `src/app/api/booking/submit/route.ts:284`:
```typescript
referenceNumber: referenceNumber || leadId.slice(0, 8).toUpperCase()
```

### Recommended Implementation
Create a PostgreSQL function in Supabase that generates user-friendly reference numbers:

```sql
CREATE OR REPLACE FUNCTION public.fn_get_reference_number(p_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reference_number TEXT;
  v_created_at TIMESTAMP;
BEGIN
  -- Get the created_at timestamp for the lead
  SELECT created_at INTO v_created_at
  FROM public.leads
  WHERE id = p_id;

  IF v_created_at IS NULL THEN
    RETURN NULL;
  END IF;

  -- Generate reference number format: PAG-YYMMDD-XXXX
  -- Where XXXX is the last 4 chars of the UUID
  v_reference_number := 'PAG-' ||
    TO_CHAR(v_created_at, 'YYMMDD') || '-' ||
    UPPER(SUBSTRING(p_id::TEXT FROM 1 FOR 8));

  RETURN v_reference_number;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.fn_get_reference_number(UUID) TO anon;
```

### Alternative: Store Reference Number in Database
Instead of generating on-the-fly, you could:
1. Add a `reference_number` column to the `leads` table
2. Generate the reference number in the `fn_insert_lead` RPC
3. Return it directly from the insert operation

This would be more efficient and ensure consistency.

### Priority
**Medium** - The fallback works fine for MVP, but a proper reference number format would be better for customer support and tracking.

---

## Other Database Notes

### Current RPC Functions (Working)
- ✅ `fn_insert_lead` - Handles lead insertions with RLS enforcement
- ✅ `fn_add_media` - Registers uploaded media files (optional, gracefully handles missing)

### Database Enum Values (Confirmed)
- `service_type`: `'repair' | 'replacement'`
- Code has been updated to use these correct values throughout

### Security Status
- ✅ RLS (Row Level Security) is properly configured
- ✅ API routes use anon key with RPC pattern
- ✅ No service role key exposure in public-facing code
