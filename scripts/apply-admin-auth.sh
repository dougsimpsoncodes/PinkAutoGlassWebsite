#!/bin/bash
# Script to apply validateAdminApiKey to admin routes

# List of admin route files that need the auth check
ADMIN_ROUTES=(
  "src/app/api/admin/roi/route.ts"
  "src/app/api/admin/google-ads/recommendations/route.ts"
  "src/app/api/admin/google-ads/save-recommendations/route.ts"
  "src/app/api/admin/google-ads/analyze/route.ts"
  "src/app/api/admin/google-ads/upload/route.ts"
  "src/app/api/admin/recording/[id]/route.ts"
  "src/app/api/admin/migrate/route.ts"
  "src/app/api/admin/attribution/match-calls/route.ts"
  "src/app/api/admin/sync/google-ads/route.ts"
  "src/app/api/admin/sync/google-search-console/route.ts"
  "src/app/api/admin/sync/ringcentral/route.ts"
  "src/app/api/admin/sync/microsoft-ads/route.ts"
  "src/app/api/admin/funnel/route.ts"
  "src/app/api/admin/debug/env/route.ts"
  "src/app/api/admin/debug/calls-count/route.ts"
  "src/app/api/admin/debug/calls-probe/route.ts"
  "src/app/api/admin/migrate-vehicles/route.ts"
  "src/app/api/admin/google-ads/token-check/route.ts"
  "src/app/api/admin/sync/omega/route.ts"
)

echo "Adding validateAdminApiKey to ${#ADMIN_ROUTES[@]} admin routes..."

for file in "${ADMIN_ROUTES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Skipping $file (not found)"
    continue
  fi

  # Check if already has the import
  if grep -q "validateAdminApiKey" "$file"; then
    echo "⏭️  Skipping $file (already has validateAdminApiKey)"
    continue
  fi

  echo "Processing $file..."

  # Create backup
  cp "$file" "$file.tmp"

  # Add import if not present
  if ! grep -q "from '@/lib/api-auth'" "$file"; then
    # Add import after the last import statement
    awk '
      /^import/ { last_import=NR; lines[NR]=$0; next }
      last_import && NR==last_import+1 {
        print lines[last_import]
        print "import { validateAdminApiKey } from '\''@/lib/api-auth'\'';"
        print $0
        last_import=0
        next
      }
      { if (last_import) print lines[last_import]; last_import=0; print }
    ' "$file.tmp" > "$file"
    cp "$file" "$file.tmp"
  fi

  # Add auth check after function declaration
  # Look for: export async function GET(req: NextRequest)
  # or: export async function POST(req: NextRequest)
  awk '
    /export async function (GET|POST|PUT|DELETE|PATCH)\(req: NextRequest\)/ {
      print $0
      getline
      # If next line is not already the auth check
      if ($0 !~ /validateAdminApiKey/) {
        print "  // Defense-in-depth: API key validation (in addition to Basic Auth in middleware)"
        print "  const authError = validateAdminApiKey(req);"
        print "  if (authError) return authError;"
        print ""
      }
      print $0
      next
    }
    { print }
  ' "$file.tmp" > "$file"

  rm "$file.tmp"
  echo "✅ Updated $file"
done

echo ""
echo "✅ Done! Updated ${#ADMIN_ROUTES[@]} admin routes with validateAdminApiKey"
