#!/usr/bin/env bash
# Start API + Postgres (and pgAdmin) with repo-root .env so DB_PORT (e.g. 5433) is honored.
# Usage: from repo root: ./api/scripts/dev-up.sh
#        or: cd api && ./scripts/dev-up.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
API_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — run: cp .env.example .env" >&2
  exit 1
fi

cd "$API_DIR"
docker compose --env-file "$ENV_FILE" up -d --build

echo ""
echo "Check API:  curl -s http://localhost:3000/health"
echo "Expected:   {\"status\":\"ok\"}"
echo "If Postgres failed to bind port: set DB_PORT=5433 in .env (when host 5432 is in use) and run this script again."
