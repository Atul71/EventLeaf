# EventLeaf Backend

EventLeaf is an event-management platform backend built in Go. It powers sustainability-focused features — green metrics scoring with eco-certification badges and paperless scheduling via downloadable iCalendar files — alongside supporting database mappings, API endpoints, and comprehensive unit tests.

---

## Features

### Green Metrics Calculation & Eco-Certification

Enables event organizers to measure and showcase the sustainability impact of their events through a composite scoring system.

**Key components:**

- **GreenMetrics Model** (`internal/models/green_metrics.go`) — Data structure for sustainability scoring with validation and helper methods. Scores are constrained to a 0–100 range with full boundary-condition handling.
- **Green Verification Service** (`internal/service/green_verification.go`) — Calculates composite metrics from venue eco-attributes, event type, and attendee engagement. Produces an overall sustainability score from energy efficiency, waste reduction, and transportation impact components.
- **Green Metrics Endpoint** (`internal/handler/event_handler.go`) — `GET /api/v1/events/:id/metrics` returns comprehensive green metrics including carbon footprint reduction, energy efficiency score, waste reduction potential, transportation impact, and eco-friendly classification.
- **Database Integration** (`internal/repository/event_repository.go`) — Maps events to venue eco-certifications, transit accessibility, and ticket distribution methods.

**Highlights:**

- Validates all scores within the 0–100 range with comprehensive error handling
- Calculates an overall sustainability score from energy, waste, and transportation components
- Auto-classifies events as eco-friendly (score ≥ 70) with a supporting badge
- Provides actionable sustainability tips based on the metrics breakdown
- Includes detailed metrics breakdown covering digital ticketing savings, paperless check-in impact, venue certification, and transit accessibility
- Full JSON serialization with proper UUID and nested object handling

### Paperless Scheduling (iCalendar Export)

Provides paperless scheduling via a downloadable iCalendar file, with optional Google Calendar sync for published events.

**Key components:**

- **ICS Builder** — Generates standards-compliant `.ics` files containing event UID, title, location, start/end times, and description.
- **Calendar Endpoint** — `GET /api/v1/events/:id/calendar.ics` serves the generated iCalendar file for direct download or calendar-app import.
- **Google Calendar Sync** — Optionally syncs published events to Google Calendar when configured.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/events/:id/metrics` | Returns green metrics and eco-certification for an event |
| `GET` | `/api/v1/events/:id/calendar.ics` | Downloads an iCalendar file for the event |

---

## Testing

Run the full backend test suite:

```bash
go test ./... -v
```

Run only the model-level tests:

```bash
go test ./internal/models -v
```

### Green Metrics Tests

**Model validation** — 10 test cases covering score-range validation, boundary conditions, negative values, and exceeding-max guards.

**Score calculations** — 5 test cases verifying correct averaging of component scores, equal-score edge cases, and decimal precision.

**Eco-friendly determination** — 5 test cases for the ≥ 70 threshold, including exact-boundary behavior and flag toggling.

**JSON marshaling** — Comprehensive roundtrip test ensuring all fields (including UUIDs, nested details, and arrays) survive serialization and deserialization.

**Service tests** — Happy-path metric generation, high-eco-attribute scoring, default timezone fallback, venue certification weighting, transit accessibility factoring, digital ticketing savings, and paperless check-in impact.

**Handler tests** — 200 OK with full metrics envelope, 404 for missing events, 400 for malformed UUIDs.

**Repository tests** — Eco-attribute retrieval, null-attribute handling, and venue metric aggregation.

**Integration tests** — End-to-end workflows for metric creation and retrieval, eco-friendly badge threshold crossing, and database persistence consistency.

### iCalendar (ICS) Tests

- `BuildEventICS` happy path — produces a valid ICS envelope containing UID, title, and location
- `BuildEventICS` nil event — returns an error
- `BuildEventICS` default timezone — falls back correctly when the timezone field is empty
- `eventStartEndInZone` — correctly parses start and end times into the target timezone
- `escapeICSText` — properly escapes semicolons, commas, and newlines per the ICS spec

---

## Project Structure

```
internal/
├── handler/
│   └── event_handler.go        # HTTP handlers (metrics, calendar)
├── models/
│   └── green_metrics.go        # GreenMetrics data model & validation
├── repository/
│   └── event_repository.go     # DB queries for eco-attributes & venues
└── service/
    └── green_verification.go   # Green metrics calculation logic
```
