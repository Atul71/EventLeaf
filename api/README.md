# EventLeaf Backend

EventLeaf is an event-management platform backend built in Go. It supports user authentication, event creation and discovery with eco-scoring, venue management, saved events, iCalendar export, and optional Google Calendar sync.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Go |
| HTTP framework | Gin |
| Database | PostgreSQL via pgx/v5 |
| Auth | JWT stored in an HttpOnly cookie |
| Docs | Swagger UI (`/swagger/index.html`) |

---

## Features

### Authentication

Cookie-based JWT sessions. On successful login or signup a `Set-Cookie` header with an `HttpOnly` JWT is returned (7-day TTL). The cookie name defaults to `eventleaf_session` and is read automatically by the browser on every subsequent request.

- `POST /api/v1/login` — email + password → sets session cookie
- `POST /api/v1/signup` — username / email / password + role flags → sets session cookie
- `POST /api/v1/logout` — clears session cookie
- `GET /api/v1/me` — returns the signed-in user's profile
- `PATCH /api/v1/me` — partial profile update (name, phone, bio, avatar, eco preference)

### Event Management

Full lifecycle from draft to published. Create, list, and retrieve events with eco-metadata. Organizers can list all their events (drafts + published) and publish a draft in one call.

- `POST /api/v1/events` — create event, evaluate Green criteria, optionally sync to Google Calendar
- `PUT /api/v1/events/:id` — update an existing draft event
- `GET /api/v1/events` — list all published public events (paginated)
- `GET /api/v1/events/:id` — get event by UUID (draft/private events require the organizer's session)
- `POST /api/v1/events/:id/publish` — publish a draft event
- `GET /api/v1/organizer/events` — list all events owned by the signed-in organizer
- `GET /api/v1/me/events` — alias for the organizer list

### Green Metrics & Eco-Scoring

Composite sustainability score (0–100) derived from venue eco-certification, event type, and selected eco-attributes. Events scoring ≥ 70 are classified as eco-friendly.

- **GreenMetrics model** — `carbon_footprint_reduction`, `energy_efficiency_score`, `waste_reduction_potential`, `transportation_impact_score`, `overall_sustainability_score`, `is_eco_friendly`, `metrics_breakdown`, `sustainability_tips`
- **Green criteria** — requires an eco-certified venue (when a venue is provided) plus at least two qualifying sustainability attributes (Paperless Ticketing, Digital Check-in, Waste Reduction Program, Carbon Neutral Transport, Tree Planting Offset)
- `GET /api/v1/events/:id/metrics` — returns the full GreenMetrics object for an event
- `GET /api/v1/eco-attributes` — lists all available eco-attributes (use `id` values in `eco_attribute_ids` when creating events)

### Paperless Scheduling (iCalendar Export)

- `GET /api/v1/events/:id/calendar.ics` — downloads a standards-compliant RFC 5545 `.ics` file (TZID from `GOOGLE_CALENDAR_TIMEZONE`, default `America/New_York`)
- The `calendar_ics_path` field in the create/publish response points directly to this endpoint

### Venue Management

Full CRUD for venues with eco-certification data.

- `POST /api/v1/venues` — create venue
- `GET /api/v1/venues` — list venues (paginated)
- `GET /api/v1/venues/:id` — get venue by UUID
- `PUT /api/v1/venues/:id` — update venue (partial body)
- `DELETE /api/v1/venues/:id` — delete venue

### Saved Events (Favourites)

Authenticated users can bookmark published public events.

- `GET /api/v1/me/saved-events` — list bookmarked events (full objects, paginated)
- `GET /api/v1/me/saved-event-ids` — list only the UUIDs of bookmarked events
- `POST /api/v1/me/saved-events/:eventId` — add bookmark — `204 No Content`
- `DELETE /api/v1/me/saved-events/:eventId` — remove bookmark — `204 No Content`

### Ticketing & Check-In

Authenticated users can buy tickets for published events and view their own tickets. Organizers can check in attendees at event entry.

- `POST /api/v1/events/:id/tickets` — buy ticket(s) for an event
- `GET /api/v1/me/tickets` — list tickets for the signed-in user
- `POST /api/v1/events/:id/check-in` — organizer check-in by ticket number or QR value

### Organizer Analytics / Impact History

Organizers can fetch event-level sustainability history for dashboard/trend views.

- `GET /api/v1/organizer/analytics` — list organizer analytics records (supports pagination)

### Payments (Mock Gateway)

Development-only mock card processing endpoint used by ticketing flows and demos.

- `POST /api/v1/payments` — validates card payload and returns mock transaction result

### Google Calendar Sync (optional)

When `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` are set, published events are automatically synced to the configured Google Calendar. Sync failures are reported in `calendar_sync_error` without failing the HTTP create/publish response.


---

## API Endpoints

Base URL: `http://localhost:3000`. All versioned routes are prefixed with `/api/v1`.

### Health & Docs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Liveness check — returns `{ "status": "ok" }` |
| `GET` | `/swagger/index.html` | None | Swagger UI (interactive API docs) |

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/login` | None | Sign in — sets HttpOnly JWT cookie (7-day TTL); returns `ok`, `email`, `is_organizer`, `redirect_path` |
| `POST` | `/api/v1/signup` | None | Create account with `username`, `email`, `password`, `is_organizer`, `is_eco_conscious` |
| `POST` | `/api/v1/logout` | None | Clears the session cookie |

### Payments (mock)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/payments` | None | Mock card payment processing endpoint used for demos and local development |

### Events (public / optional auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/events` | None | List published public events (`limit` default 50 max 100, `offset` default 0) |
| `GET` | `/api/v1/events/:id` | Optional | Get event by UUID — draft/private events are only visible to their organizer |
| `GET` | `/api/v1/events/:id/metrics` | Optional | Get `GreenMetrics` for an event |
| `GET` | `/api/v1/events/:id/calendar.ics` | Optional | Download RFC 5545 `.ics` file; draft events require the organizer's session |

### Events (organizer — JWT required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/events` | Required | Create event; `organizer_id` must match the signed-in user |
| `PUT` | `/api/v1/events/:id` | Required | Update a draft event owned by the signed-in organizer |
| `POST` | `/api/v1/events/:id/publish` | Required | Publish a draft event and trigger Google Calendar sync |
| `GET` | `/api/v1/organizer/events` | Required | List all events (draft + published) for the signed-in organizer (`limit` default 100 max 500) |
| `GET` | `/api/v1/organizer/analytics` | Required | List sustainability/impact history analytics for the signed-in organizer |
| `GET` | `/api/v1/me/events` | Required | Alias for `GET /organizer/events` |
| `POST` | `/api/v1/events/:id/tickets` | Required | Buy one or more tickets for an event |
| `POST` | `/api/v1/events/:id/check-in` | Required | Organizer check-in endpoint by `ticket_number` or `qr_code_value` |

### Eco Attributes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/eco-attributes` | None | List all eco-attributes — use returned `id` values in `eco_attribute_ids` when creating events |

### Venues

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/venues` | None | Create a venue |
| `GET` | `/api/v1/venues` | None | List venues (`limit` default 20 max 500, `offset` default 0) |
| `GET` | `/api/v1/venues/:id` | None | Get a venue by UUID |
| `PUT` | `/api/v1/venues/:id` | None | Update a venue (partial JSON body) |
| `DELETE` | `/api/v1/venues/:id` | None | Delete a venue — `204` on success, `404` if not found |

### Current User / Profile (JWT required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/me` | Required | Get the signed-in user's full profile |
| `PATCH` | `/api/v1/me` | Required | Partial update: `first_name`, `last_name`, `phone` (10 digits), `bio`, `profile_image_url` (max 500 chars), `is_eco_conscious` |
| `GET` | `/api/v1/me/tickets` | Required | List tickets owned by the signed-in user |

### Saved Events / Favourites (JWT required)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/me/saved-events` | Required | List bookmarked published events (`limit` default 100 max 500) |
| `GET` | `/api/v1/me/saved-event-ids` | Required | List only the UUIDs of bookmarked events (newest first) — returns `{ "event_ids": [...] }` |
| `POST` | `/api/v1/me/saved-events/:eventId` | Required | Bookmark a published public event — `204 No Content` |
| `DELETE` | `/api/v1/me/saved-events/:eventId` | Required | Remove a bookmark — `204 No Content` |

### Bootstrap (dev / seeding)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/bootstrap/organizer-id` | None | Returns the first organizer UUID in the database — dev helper before auth is wired |

---

## Key Request / Response Shapes

### `POST /api/v1/events` — request body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | max 255 |
| `description` | string | yes | |
| `organizer_id` | UUID | yes | must match the signed-in user |
| `venue_id` | UUID | no | if set, must exist in `venues`; used for Green check and ICS location |
| `event_date` | string | yes | `YYYY-MM-DD` |
| `event_start_time` | string | yes | `HH:MM:SS` |
| `event_end_time` | string | yes | `HH:MM:SS`, must be after start |
| `eco_summary` | string | no | |
| `ticket_price` | number | yes | ≥ 0 |
| `total_capacity` | integer | yes | > 0 |
| `status` | string | no | default `draft`; use `published` to trigger Google Calendar sync |
| `visibility` | string | no | default `public` |
| `category` | string | no | |
| `eco_attribute_ids` | UUID[] | no | IDs from `GET /eco-attributes` |

### `POST /api/v1/events` — response (`201`)

```json
{
  "event": { "id": "...", "title": "...", "status": "published", "..." },
  "is_green": true,
  "sustainability_score": 82.5,
  "metrics": { "energy_efficiency_score": 85, "..." },
  "green_criteria_met": ["Eco-certified venue", "..."],
  "green_criteria_not_met": [],
  "calendar_ics_path": "/api/v1/events/<id>/calendar.ics",
  "calendar_sync_error": ""
}
```

### `GET /api/v1/events/:id/metrics` — response (`200`)

```json
{
  "event_id": "...",
  "carbon_footprint_reduction": 120.5,
  "energy_efficiency_score": 85.0,
  "waste_reduction_potential": 70.0,
  "transportation_impact_score": 75.0,
  "overall_sustainability_score": 76.67,
  "is_eco_friendly": true,
  "metrics_breakdown": {
    "digital_ticketing_savings": 15.0,
    "paperless_checkin_savings": 20.0,
    "venue_eco_certification_score": 90.0,
    "public_transit_access_score": 80.0,
    "event_attendee_count": 500,
    "selected_eco_attributes": ["Paperless Ticketing", "Digital Check-in"]
  },
  "sustainability_tips": ["Use public transit", "Go digital"]
}
```

### `POST /api/v1/events/:id/check-in` — request body

At least one of `ticket_number` or `qr_code_value` is required. `qr_code_value` format is `eventleaf:ticket:<ticket_uuid>`.

```json
{
  "ticket_number": "EL-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "qr_code_value": "eventleaf:ticket:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "check_in_method": "manual",
  "notes": "Main gate"
}
```

### `POST /api/v1/events/:id/check-in` — response (`200`)

```json
{
  "checked_in": true,
  "already_used": false,
  "ticket_number": "EL-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "event_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "checked_in_at": "2026-04-29T22:00:00Z",
  "message": "Ticket checked in successfully"
}
```

### Error shape

All error responses use:

```json
{ "error": "message" }
```

---

## Running Locally

```bash
cd api
go run ./cmd/server
```

---

## Testing

Run the full backend test suite:

```bash
cd api
go test ./... -v
```

Run tests for a specific package:

```bash
go test ./internal/models -v
go test ./internal/service -v
go test ./internal/handler -v
```

### Green Metrics Model (`internal/models/green_metrics_test.go`)

**`TestGreenMetricsValidate`** — 10 cases covering:
- Valid metrics with all scores in range
- `EnergyEfficiencyScore` too high (> 100) and negative (< 0)
- `WasteReductionPotential` negative
- `TransportationImpactScore` over 100
- `OverallSustainabilityScore` over 100
- `CarbonFootprintReduction` negative
- `EventAttendeeCount` negative
- Boundary: all scores at zero
- Boundary: all scores at maximum

**`TestCalculateOverallScore`** — 5 cases: equal scores, different scores, decimal values, zeros, maximum.

**`TestDetermineEcoFriendly`** — 5 cases for the ≥ 70 threshold: above, exactly at, just below, zero, and maximum.

**`TestGreenMetricsJSONMarshalUnmarshal`** — roundtrip test verifying `event_id` (UUID), nested `metrics_breakdown`, `selected_eco_attributes` array, `sustainability_tips`, and `is_eco_friendly` survive JSON serialization.

### Green Verification Service (`internal/service/green_verification_test.go`)

**`TestVerifyGreenCriteria`** — 5 cases:
- No venue + two qualifying flags → green
- Venue provided but not eco-certified → not green
- Eco-certified venue but only one qualifying flag → not green
- Eco-certified venue + two qualifying flags → green
- Unrecognised attribute names do not count toward the flag threshold

### Event Handler (`internal/handler/event_handler_test.go`)

- `TestCreateEvent_BadJSON` — malformed JSON body → `400`
- `TestGetEventCalendarICS_InvalidID` — non-UUID path param → `400`
- `TestGetEventCalendarICS_NotFound` — unknown UUID → `404`
- `TestGetEventCalendarICS_OK` — published event → `200` with `Content-Type: text/calendar` and `BEGIN:VCALENDAR` body
- `TestListEcoAttributes_OK` — stub returns one attribute → `200` with correct JSON array

### Venue Handler (`internal/handler/venue_handler_test.go`)

- `TestCreateVenue_BadJSON` — malformed JSON → `400`
- `TestGetVenue_InvalidID` — bad UUID → `400`
- `TestGetVenue_NotFound` — unknown UUID → `404`
- `TestGetVenue_OK` — found venue → `200` with correct JSON
- `TestListVenues_OK` — stub returns one venue → `200`
- `TestUpdateVenue_InvalidID` — bad UUID → `400`
- `TestDeleteVenue_NotFound` — repo returns `"venue not found"` error → `404`
- `TestDeleteVenue_NoContent` — successful delete → `204`

### Favorite Handler (`internal/handler/favorite_handler_test.go`)

- `TestAddSavedEvent_Unauthorized` — no auth context → `401`
- `TestAddSavedEvent_InvalidEventID` — bad UUID → `400`
- `TestAddSavedEvent_NotPublished` — draft event → `404`; repository `Add` is not called
- `TestAddSavedEvent_OK` — published event + auth → `204`; verifies correct user and event IDs passed to repo
- `TestListSavedEventIDs_OK` — returns `{ "event_ids": [...] }` with correct UUIDs
- `TestListSavedEvents_RepoError` — repo error → `500`

### iCalendar Service (`internal/service/ics_test.go`)

- `TestBuildEventICS` — happy path with venue: verifies `BEGIN:VCALENDAR` / `END:VCALENDAR` envelope, event title, UID (`<id>@eventleaf`), and venue location
- `TestBuildEventICS_nilEvent` — nil event → returns error
- `TestBuildEventICS_defaultTimeZone` — empty timezone string → falls back to `America/New_York`
- `TestEventStartEndInZone` — parses `event_date` + `event_start_time` / `event_end_time` into the correct hours in the target timezone
- `TestEscapeICSText` — properly escapes `;` → `\;`, `,` → `\,`, and `\n` → `\n`
- `TestWriteFolded` — long property values are folded at 75 characters with a leading space on continuation lines (RFC 5545 §3.1)

### Google Calendar Service (`internal/service/google_calendar_service_test.go`)

- `TestNewGoogleCalendarService_DisabledWithoutCredentials` — empty credentials → `IsEnabled()` returns `false`
- `TestGoogleCalendarService_SyncPublishedEvent_NotConfigured` — calling sync when disabled → returns error
- `TestGoogleCalendarService_eventDateTimes` — converts `event_date` + start/end time strings to RFC3339 strings in the configured timezone; verifies start < end

### Repository (`internal/repository/google_calendar_repository_test.go`)

- `TestNullIfEmpty` — empty string maps to `nil`; non-empty string passes through unchanged

---

## Project Structure

```
cmd/
└── server/
    └── main.go                     # Route registration, middleware wiring, Swagger mount
internal/
├── auth/
│   └── jwt.go                      # JWT token creation and parsing
├── config/
│   └── config.go                   # Loads configuration from environment variables
├── db/
│   └── db.go                       # PostgreSQL connection pool (pgx/v5)
├── handler/
│   ├── auth_handler.go             # Login, signup, logout, me, update-me
│   ├── bootstrap_handler.go        # Dev helper: first organizer UUID
│   ├── event_handler.go            # Event CRUD, metrics, ICS download, eco-attributes list
│   ├── favorite_handler.go         # Saved events: add, remove, list
│   ├── interfaces.go               # Repository/service interfaces used by handlers
│   └── venue_handler.go            # Venue CRUD
├── middleware/
│   ├── auth_middleware.go          # RequireAuth: enforces JWT cookie; 401 if missing/invalid
│   └── optional_auth.go            # OptionalAuth: attaches user context if cookie present
├── models/
│   ├── eco_attribute.go            # EcoAttribute struct
│   ├── event.go                    # Event, CreateEventRequest, CreateEventResponse
│   ├── green_metrics.go            # GreenMetrics + MetricsDetails + validation helpers
│   └── venue.go                    # Venue, CreateVenueRequest, UpdateVenueRequest
├── repository/
│   ├── eco_attribute_repository.go # Eco-attribute DB queries
│   ├── event_repository.go         # Event DB queries (create, list, publish, saved)
│   ├── favorite_repository.go      # Saved-event DB queries
│   ├── google_calendar_repository.go # Google Calendar mapping persistence
│   ├── user_repository.go          # User auth and profile DB queries
│   └── venue_repository.go         # Venue DB queries
└── service/
    ├── google_calendar_service.go  # Google Calendar OAuth + event sync
    ├── green_verification.go       # Green criteria check + GreenMetrics calculation
    └── ics.go                      # RFC 5545 iCalendar (.ics) builder
```
