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

echo "==> Finding project..."
PROJECT=$(curl -sS -H "Authorization: Bearer $TOKEN" \
  "$API/v9/projects?teamId=$TEAM_SLUG&search=preservan" | \
  python3 -c "import sys,json; ps=json.load(sys.stdin).get('projects',[]); p=next((x for x in ps if 'preservan' in x.get('name','').lower()), ps[0] if ps else None); print(json.dumps(p))")

PROJECT_ID=$(echo "$PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
PROJECT_NAME=$(echo "$PROJECT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))")

if [ -z "$PROJECT_ID" ]; then
  echo "Project not found. Linking..."
  npx --yes vercel@latest link --token "$TOKEN" --yes
  PROJECT_ID=$(cat .vercel/project.json | python3 -c "import sys,json; print(json.load(sys.stdin)['projectId'])")
fi

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
set_env "NEXT_PUBLIC_APP_URL" "${NEXT_PUBLIC_APP_URL:-https://can.preservan.com}"

echo "==> Disabling deployment protection on production..."
curl -sS -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "$API/v1/projects/$PROJECT_ID" \
  -d '{"ssoProtection":{"deploymentType":"preview"}}' >/dev/null || true

echo "==> Deploying..."
npx --yes vercel@latest deploy --prod --token "$TOKEN" --yes

echo "==> Done. Check https://preservan-can.vercel.app"
