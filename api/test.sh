#!/bin/bash
# Test script for EventLeaf API
# Prerequisites: Docker running, Go installed, API running (go run ./cmd/server)

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "=== 1. Health check ==="
curl -s "$BASE_URL/health" | jq . 2>/dev/null || curl -s "$BASE_URL/health"
echo ""

echo "=== 2. Get eco attributes ==="
ECO_RESP=$(curl -s "$BASE_URL/api/v1/eco-attributes")
echo "$ECO_RESP" | jq . 2>/dev/null || echo "$ECO_RESP"
echo ""

# Get IDs from eco attributes (first 2 that match our Green criteria)
ECO_IDS=$(echo "$ECO_RESP" | jq -r '[.[] | select(.name == "Paperless Ticketing" or .name == "Digital Check-in") | .id] | .[0:2] | @json' 2>/dev/null)
if [ -z "$ECO_IDS" ] || [ "$ECO_IDS" = "null" ]; then
  ECO_IDS='[]'
fi

echo "=== 3. Get user and venue IDs (requires DB access) ==="
echo "Run these to get IDs:"
echo "  docker exec -it eventleaf-postgres psql -U eventleaf_user -d eventleaf_db -t -c \"SELECT id FROM users LIMIT 1;\""
echo "  docker exec -it eventleaf-postgres psql -U eventleaf_user -d eventleaf_db -t -c \"SELECT id FROM venues WHERE is_eco_certified = true LIMIT 1;\""
echo ""

echo "=== 4. Create event (replace USER_ID, VENUE_ID, ECO_IDS) ==="
echo "Example:"
echo 'curl -X POST '"$BASE_URL"'/api/v1/events -H "Content-Type: application/json" -d '\''{
  "title": "Test Green Event",
  "description": "Testing",
  "organizer_id": "USER_UUID_HERE",
  "venue_id": "VENUE_UUID_HERE",
  "event_date": "2025-04-22",
  "event_start_time": "10:00:00",
  "event_end_time": "18:00:00",
  "ticket_price": 15,
  "total_capacity": 100,
  "eco_attribute_ids": []
}'\'''
echo ""
