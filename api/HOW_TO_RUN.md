# How to Run the EventLeaf API

## Prerequisites

### 1. Install Go (if not already installed)

**Check if Go is installed:**
```bash
go version
```

If not installed, download and install from [golang.org](https://golang.org/dl/)

**For macOS (using Homebrew):**
```bash
brew install go
```

**Verify installation:**
```bash
go version  # Should show Go 1.23 or later
```

### 2. Install Docker & Docker Compose

**Check if Docker is installed:**
```bash
docker --version
docker-compose --version
```

If not installed, download from [Docker's website](https://www.docker.com/products/docker-desktop)

### 3. Install PostgreSQL Client Tools (optional but recommended)

For macOS:
```bash
brew install postgresql
```

## Setup Steps

### Step 1: Clone/Navigate to the Project

```bash
cd /Users/pritika/Documents/UF/Projects/EventLeaf
```

### Step 2: Set Up Environment Variables

Navigate to the API directory and create a `.env` file:

```bash
cd api
cp .env.example .env  # If .env.example exists
```

Or manually create `.env` in the root EventLeaf directory (parent of `api/`):

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=eventleaf_user
DB_PASSWORD=eventleaf_password
DB_NAME=eventleaf_db

# API Configuration
APP_PORT=3000
APP_ENV=development
```

> **Note:** The `.env` file should be in `/Users/pritika/Documents/UF/Projects/EventLeaf/.env` (parent directory of `api/`)

### Step 3: Start the Database

```bash
# Navigate to the api directory
cd api

# Start PostgreSQL with Docker Compose
docker-compose up -d
```

**Verify Database is Running:**
```bash
docker-compose ps
# Should show: postgres (eventleaf-postgres) is Up
```

**Check Database Connection:**
```bash
psql -h localhost -U eventleaf_user -d eventleaf_db -c "SELECT version();"
# Enter password: eventleaf_password
# Should show PostgreSQL version
```

### Step 4: Download Go Dependencies

```bash
# Make sure you're in the api directory
cd /Users/pritika/Documents/UF/Projects/EventLeaf/api

# Download and install dependencies
go mod download
go mod tidy
```

### Step 5: Build the API Server

```bash
# Build the application
go build -o eventleaf-server ./cmd/server

# Or run directly without building
go run ./cmd/server/main.go
```

### Step 6: Run the API Server

**Option A: Run the built executable**
```bash
./eventleaf-server
```

**Option B: Run directly with Go**
```bash
go run ./cmd/server/main.go
```

**Expected Output:**
```
2026/03/24 10:30:45 Server starting on port 3000
```

Server will be available at: `http://localhost:3000`

## Verify the API is Running

### Check Health Endpoint

```bash
curl -X GET http://localhost:3000/health
# Response: {"status":"ok"}
```

### Access Swagger API Documentation

Visit: `http://localhost:3000/swagger/index.html`

This provides an interactive interface to test all API endpoints including the new green metrics endpoint.

## Test the Green Metrics Endpoint

### 1. List Available Eco Attributes

```bash
curl -X GET http://localhost:3000/api/v1/eco-attributes
```

Response:
```json
[
  {"id": "...", "name": "Paperless Ticketing", "category": "sustainability_practice"},
  {"id": "...", "name": "Digital Check-in", "category": "sustainability_practice"},
  ...
]
```

### 2. Create a Test Event

```bash
curl -X POST http://localhost:3000/api/v1/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Green Event",
    "description": "Testing the green metrics endpoint",
    "organizer_id": "12345678-1234-1234-1234-123456789012",
    "event_date": "2026-06-15",
    "event_start_time": "09:00:00",
    "event_end_time": "17:00:00",
    "ticket_price": 50.00,
    "total_capacity": 300,
    "eco_attribute_ids": [
      "eco-attr-id-1",
      "eco-attr-id-2"
    ]
  }'
```

Save the `event_id` from the response.

### 3. Get Green Metrics for Your Event

```bash
curl -X GET http://localhost:3000/api/v1/events/{event-id}/green-metrics
```

Replace `{event-id}` with the ID from step 2.

## Database Management

### View Database Logs

```bash
docker-compose logs postgres
```

### Connect to Database CLI

```bash
docker-compose exec postgres psql -U eventleaf_user -d eventleaf_db
```

Inside psql:
```sql
-- View tables
\dt

-- View events
SELECT id, title, is_eco_friendly FROM events LIMIT 5;

-- View eco attributes
SELECT * FROM eco_attributes;

-- Exit
\q
```

### Reset Database (Delete All Data)

```bash
# Stop and remove containers
docker-compose down -v

# Restart fresh
docker-compose up -d
```

## Stop the API Server

**If running in foreground (Ctrl+C):**
```bash
Ctrl+C
```

**If running in background:**
```bash
# Find the process
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Stop the Database

```bash
docker-compose down
```

Or just stop without removing volumes:
```bash
docker-compose stop
```

## Troubleshooting

### Issue: "command not found: go"

**Solution:** Install Go from [golang.org](https://golang.org/dl/) or using Homebrew:
```bash
brew install go
```

Verify:
```bash
go version
```

### Issue: "Port 3000 already in use"

**Solution:** Find and kill the process:
```bash
lsof -i :3000
kill -9 <PID>
```

Or change the port in `.env`:
```bash
APP_PORT=3001
```

### Issue: "Database connection refused"

**Solution:** Ensure PostgreSQL container is running:
```bash
docker-compose ps
docker-compose logs postgres
```

Or restart:
```bash
docker-compose down
docker-compose up -d
```

### Issue: "Module not found" errors

**Solution:** Update Go modules:
```bash
go mod download
go mod tidy
```

### Issue: "table does not exist"

**Solution:** Verify schema was created:
```bash
docker-compose exec postgres psql -U eventleaf_user -d eventleaf_db -c "\dt"
```

If no tables, check the schema initialization:
```bash
docker-compose logs postgres
```

Or manually create schema:
```bash
docker-compose exec postgres psql -U eventleaf_user -d eventleaf_db -f /docker-entrypoint-initdb.d/01-schema.sql
```

## Performance Tips

### Running the API with Hot Reload (Development)

Install `air` for hot reloading:
```bash
go install github.com/cosmtrek/air@latest
```

Then run:
```bash
air
```

This automatically restarts the server when you change source files.

### Running in Background

```bash
# Run in background
nohup go run ./cmd/server/main.go > api.log 2>&1 &

# View logs
tail -f api.log

# Kill background process
kill %1
```

### Using Make (if Makefile exists)

```bash
make run
make build
make clean
```

Check [Makefile](./Makefile) for available commands.

## Project Structure

```
EventLeaf/
├── api/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go           # Entry point
│   ├── internal/
│   │   ├── config/               # Configuration management
│   │   ├── db/                   # Database connection
│   │   ├── handler/              # HTTP handlers
│   │   │   └── event_handler.go  # ← Includes GetEventGreenMetrics
│   │   ├── models/               # Data models
│   │   │   └── green_metrics.go  # ← New green metrics models
│   │   ├── repository/           # Data access layer
│   │   └── service/              # Business logic
│   │       └── green_metrics.go  # ← New metrics calculation
│   ├── db/
│   │   ├── schema.sql            # Database schema
│   │   └── seed.sql              # Sample data
│   ├── docker-compose.yml        # Docker configuration
│   ├── go.mod                    # Go modules
│   ├── go.sum                    # Module checksums
│   └── Makefile                  # Build tasks
├── ui/                           # Frontend (React/TypeScript)
└── .env                          # Environment variables
```

## Quick Start Commands Summary

```bash
# Navigate to project
cd /Users/pritika/Documents/UF/Projects/EventLeaf

# Create .env file
echo "DB_HOST=localhost
DB_PORT=5432
DB_USER=eventleaf_user
DB_PASSWORD=eventleaf_password
DB_NAME=eventleaf_db
APP_PORT=3000" > .env

# Start database
cd api
docker-compose up -d

# Install dependencies
go mod download

# Run server
go run ./cmd/server/main.go

# In another terminal, test the endpoint
curl http://localhost:3000/health
```

## Next Steps

1. **Explore the API Documentation**: Visit `http://localhost:3000/swagger/index.html`
2. **Create Test Data**: Use the API to create events and venues
3. **Test Green Metrics**: Call the `GET /api/v1/events/{id}/green-metrics` endpoint
4. **Review Documentation**:
   - [GREEN_METRICS_ENDPOINT.md](./GREEN_METRICS_ENDPOINT.md) - Detailed endpoint documentation
   - [QUICK_START_GREEN_METRICS.md](./QUICK_START_GREEN_METRICS.md) - Quick start guide with examples
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Implementation details

## Getting Help

For more information:
- Check the main [README.md](./README.md)
- Review [QUICKSTART_DB.md](./db/QUICKSTART_DB.md) for database setup
- Check Docker logs: `docker-compose logs -f`
- Check application logs: Search for "error" in console output
