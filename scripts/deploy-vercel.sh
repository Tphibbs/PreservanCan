#!/usr/bin/env bash
# Deploy PreservanCan to Vercel using VERCEL_TOKEN4
set -euo pipefail

TOKEN="${VERCEL_TOKEN4:-${VERECL_TOKEN4:-${VERCEL_TOKEN:-}}}"

if [ -z "$TOKEN" ]; then
  echo "ERROR: VERCEL_TOKEN4 is not set."
  echo "Add VERCEL_TOKEN4 to Cursor Cloud Agent secrets, then re-run."
  exit 1
fi

cd /workspace
set -a && source .env.local && set +a

API="https://api.vercel.com"
TEAM_SLUG="preserv-hq"
PRESERVAN_CAN_PROJECT_ID="prj_hwLsDOSuzguqBicwxpNnkdPDGypL"

echo "==> Finding project..."
PROJECT_ID="$PRESERVAN_CAN_PROJECT_ID"
PROJECT_NAME="preservan-can"

mkdir -p .vercel
echo "{\"orgId\":\"team_RbcqNupy8blVwds5KP8BCRDq\",\"projectId\":\"$PROJECT_ID\"}" > .vercel/project.json

echo "Project: $PROJECT_NAME ($PROJECT_ID)"

set_env() {
  local key="$1" val="$2"
  echo "  env: $key"
  curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "$API/v10/projects/$PROJECT_ID/env" \
    -d "{\"key\":\"$key\",\"value\":\"$val\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\",\"development\"]}" >/dev/null
}

echo "==> Setting env vars..."
set_env "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL"
set_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
set_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
set_env "NEXT_PUBLIC_APP_URL" "${NEXT_PUBLIC_APP_URL:-https://preservan-can.vercel.app}"

echo "==> Disabling deployment protection on production..."
curl -sS -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$API/v1/projects/$PROJECT_ID" \
  -d '{"ssoProtection":{"deploymentType":"preview"}}' >/dev/null || true

echo "==> Deploying..."
npx --yes vercel@latest deploy --prod --token "$TOKEN" --yes --scope preserv-hq

echo "==> Done. Check https://preservan-can.vercel.app"
