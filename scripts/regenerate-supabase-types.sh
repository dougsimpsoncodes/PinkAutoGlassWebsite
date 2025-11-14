#!/bin/bash
# Script to regenerate Supabase TypeScript types after schema changes

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Supabase Type Generation${NC}"
echo "========================================"
echo ""

# Check if SUPABASE_PROJECT_ID is set
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo -e "${RED}Error: SUPABASE_PROJECT_ID not set${NC}"
  echo ""
  echo "Please set your Supabase project ID:"
  echo "  export SUPABASE_PROJECT_ID=your-project-ref"
  echo ""
  echo "You can find this in your Supabase Dashboard > Settings > General > Project ID"
  exit 1
fi

# Check if user is logged in to Supabase CLI
echo "Checking Supabase CLI authentication..."
if ! supabase projects list &> /dev/null; then
  echo -e "${YELLOW}Not logged in to Supabase CLI${NC}"
  echo "Running: supabase login"
  supabase login
fi

echo ""
echo "Generating TypeScript types from database schema..."
echo "Project: $SUPABASE_PROJECT_ID"
echo ""

# Generate types
supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_ID" \
  --schema public \
  > src/types/supabase.ts

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ Types generated successfully!${NC}"
  echo ""
  echo "Generated file: src/types/supabase.ts"
  echo ""

  # Show a preview of the enum types
  echo "Preview of time_preference enum:"
  grep -A 3 "time_preference" src/types/supabase.ts || echo "(enum not found in types)"

  echo ""
  echo -e "${GREEN}Next steps:${NC}"
  echo "1. Review the generated types in src/types/supabase.ts"
  echo "2. Commit the updated types to git"
  echo "3. Verify that timeWindow validation uses 'anytime' correctly"
else
  echo ""
  echo -e "${RED}❌ Failed to generate types${NC}"
  echo ""
  echo "Common issues:"
  echo "- Incorrect project ID"
  echo "- Not logged in to Supabase CLI (run: supabase login)"
  echo "- Database migration not yet applied"
  exit 1
fi
