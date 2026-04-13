#!/usr/bin/env bash
# Re-apply db/seed.sql to an already-running Postgres container (users, venues, events when missing).
# Usage: cd api && chmod +x scripts/apply-seed.sh && ./scripts/apply-seed.sh
# Requires: Docker Compose v2 — start DB first: docker compose up -d
set -euo pipefail
API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$API_DIR"

DB_USER="${DB_USER:-eventleaf_user}"
DB_NAME="${DB_NAME:-eventleaf_db}"

docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$API_DIR/db/seed.sql"
echo "Seed applied."
