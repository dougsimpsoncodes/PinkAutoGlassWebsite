#!/usr/bin/env bash
set -euo pipefail

# Google Ads OAuth credential diagnose helper
# - Validates presence of required env vars
# - Tests refresh-token exchange against Google OAuth token endpoint
# - Prints a human-readable diagnosis and next steps
#
# Usage:
#   chmod +x scripts/google-ads-credential-diagnose.sh
#   ./scripts/google-ads-credential-diagnose.sh               # uses current env
#   ./scripts/google-ads-credential-diagnose.sh .env.local    # loads from file first

ENV_FILE="${1:-}"

load_env_file() {
  local file="$1"
  [ -z "$file" ] && return 0
  if [ ! -f "$file" ]; then
    echo "[warn] Env file not found: $file" >&2
    return 0
  fi
  # Shell-safe loader: only export lines like KEY=VALUE (no spaces around =). Ignores comments and empty lines.
  # Note: quotes in values are supported.
  while IFS='=' read -r key value; do
    # Trim whitespace
    key="${key%%[[:space:]]*}"
    value="${value##[[:space:]]}"
    # Skip blanks/comments
    [[ -z "$key" || "$key" =~ ^# ]] && continue
    # Allow quoted values
    if [[ "$value" =~ ^\".*\"$ || "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi
    export "$key"="$value"
  done < "$file"
  echo "[info] Loaded env from $file"
}

need() { command -v "$1" >/dev/null 2>&1 || return 1; }

print_var() {
  local name="$1"; local val="${!name-}"
  if [ -n "$val" ]; then
    echo "  - $name: SET"
  else
    echo "  - $name: MISSING"
  fi
}

diagnose() {
  local client_id="${GOOGLE_ADS_CLIENT_ID-}"
  local client_secret="${GOOGLE_ADS_CLIENT_SECRET-}"
  local refresh_token="${GOOGLE_ADS_REFRESH_TOKEN-}"

  echo "[check] Required environment variables:"
  print_var GOOGLE_ADS_CLIENT_ID
  print_var GOOGLE_ADS_CLIENT_SECRET
  print_var GOOGLE_ADS_REFRESH_TOKEN
  print_var GOOGLE_ADS_DEVELOPER_TOKEN
  print_var GOOGLE_ADS_CUSTOMER_ID
  print_var GOOGLE_ADS_LOGIN_CUSTOMER_ID

  if [ -z "$client_id" ] || [ -z "$client_secret" ] || [ -z "$refresh_token" ]; then
    echo "[fail] Missing required Google Ads OAuth variables. Set them and re-run." >&2
    exit 1
  fi

  echo "[info] Testing refresh-token exchange with Google..."
  local body
  body="client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token&refresh_token=${refresh_token}"

  local resp
  set +e
  resp=$(curl -sS -X POST https://oauth2.googleapis.com/token \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data "$body")
  local code=$?
  set -e

  if [ $code -ne 0 ]; then
    echo "[fail] Curl failed contacting Google token endpoint." >&2
    echo "$resp"
    exit 2
  fi

  # If jq present, pretty print
  if need jq; then
    echo "$resp" | jq . || true
  else
    echo "$resp"
  fi

  if echo "$resp" | grep -q 'access_token'; then
    echo "[ok] Token exchange succeeded. Credentials are valid."
    echo "Next: Ensure GOOGLE_ADS_LOGIN_CUSTOMER_ID is set (MCC), ids are no-dash, and retry the API."
    exit 0
  fi

  # Extract error if present
  local err
  err=$(echo "$resp" | (jq -r '.error // empty' 2>/dev/null || true))
  local desc
  desc=$(echo "$resp" | (jq -r '.error_description // empty' 2>/dev/null || true))

  echo "[diagnosis]"
  echo "  error: ${err:-unknown}"
  echo "  description: ${desc:-n/a}"

  case "$err" in
    invalid_client)
      echo "- client_id/client_secret are not recognized for this refresh token (mismatch or rotated secret)." ;;
    unauthorized_client)
      echo "- OAuth client type/permissions invalid for this flow, or refresh token belongs to a different client." ;;
    invalid_grant)
      echo "- Refresh token expired/revoked, or issued for a different client, or consent screen in Testing (7-day expiry)." ;;
    *) ;;
  esac

  echo
  echo "[next-steps] Minimal fix: regenerate only the refresh token using the SAME client_id/secret via OAuth Playground"
  echo "  - OAuth Playground → Gear → Use your own credentials (enter client_id/secret)"
  echo "  - Enable: Access type: offline, Force prompt: consent"
  echo "  - Scope: https://www.googleapis.com/auth/adwords → Authorize → Exchange → copy refresh_token"
  echo "  - Update GOOGLE_ADS_REFRESH_TOKEN in Vercel and re-test"
}

main() {
  load_env_file "$ENV_FILE"
  diagnose
}

main "$@"

