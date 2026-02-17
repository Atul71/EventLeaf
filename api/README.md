# EventLeaf API (Go)

Event posting endpoint with Green verification logic.

## Setup

1. From project root: `cp .env.example .env` and `docker-compose up -d`
2. `cd api && go mod tidy && go run ./cmd/server`

## Swagger UI

Open **http://localhost:3000/swagger/index.html** to test the API interactively.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/events` | Create event, verify Green criteria |
| GET | `/api/v1/eco-attributes` | List eco attributes (for event creation) |
| GET | `/health` | Health check |

## Green Criteria

Event is **Green** when:
1. **Venue**: If selected, must be eco-certified (`is_eco_certified = true`)
2. **Sustainability**: At least 2 of: Paperless Ticketing, Digital Check-in, Waste Reduction Program, Carbon Neutral Transport, Tree Planting Offset
