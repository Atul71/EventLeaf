# EventLeaf Backend API Reference

Go version in **`go.mod`**, HTTP server **Gin**, database **PostgreSQL** via **pgx/v5**. Interactive docs: **Swagger UI** at `GET /swagger/index.html` when the server is running.

---

## Base URL and versioning

| Item | Value |
|------|--------|
| Default host | `http://localhost:3000` (override with `APP_PORT` in `.env`) |
| API prefix | `/api/v1` |
| Example base | `http://localhost:3000/api/v1` |

---

## Configuration (environment)

Load `.env` from the **repository root** (parent of `api/`). Key variables:

| Variable | Purpose |
|----------|---------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL DSN for the API |
| `APP_PORT` | HTTP listen port (default `3000`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` | Optional: sync **published** events to Google Calendar |
| `GOOGLE_CALENDAR_ID` | Target calendar (often `primary`) |
| `GOOGLE_CALENDAR_TIMEZONE` | IANA zone (default `America/New_York`); used for ICS and Google event times |

**Authentication:** current routes do not enforce JWT or sessions; `organizer_id` and related IDs are supplied in JSON bodies as documented.

---

## Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness check |

**Response** `200`:

```json
{ "status": "ok" }
```

---

## Events

### Create event

| Method | Path | Content-Type |
|--------|------|----------------|
| `POST` | `/api/v1/events` | `application/json` |

**Body (`CreateEventRequest`):**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `title` | string | yes | max 255 |
| `description` | string | yes | |
| `organizer_id` | UUID | yes | must exist in `users` |
| `venue_id` | UUID | no | if set, must exist in `venues`; used for Green check and ICS location |
| `event_date` | string | yes | `YYYY-MM-DD` |
| `event_start_time` | string | yes | `HH:MM:SS` |
| `event_end_time` | string | yes | must be after start |
| `eco_summary` | string | no | |
| `ticket_price` | number | yes | ≥ 0 |
| `total_capacity` | integer | yes | > 0 |
| `status` | string | no | default `draft`; use `published` for Google sync |
| `visibility` | string | no | default `public` |
| `category` | string | no | |
| `eco_attribute_ids` | UUID[] | no | IDs from `GET /eco-attributes` |

**Green criteria (business logic):**

1. If `venue_id` is set, the venue must be **eco-certified** (`is_eco_certified`).
2. At least **two** sustainability attributes from: Paperless Ticketing, Digital Check-in, Waste Reduction Program, Carbon Neutral Transport, Tree Planting Offset.

**Responses:**

- `201` — `CreateEventResponse`: includes `event`, `is_green`, `green_criteria_met`, `green_criteria_not_met`, optional `calendar_sync_error`, `calendar_ics_path`.
- `400` — invalid JSON or validation failure.
- `404` — `venue_id` not found.
- `500` — database or eco-attribute lookup failure.

**Paperless scheduling:**

- **`calendar_ics_path`** — relative path to download an `.ics` file for this event.
- If Google credentials are configured and `status` is **`published`**, the server attempts to sync to Google Calendar; failures are reported in **`calendar_sync_error`** without failing the HTTP create.

---

### Download event as iCalendar (.ics)

| Method | Path | Produces |
|--------|------|----------|
| `GET` | `/api/v1/events/:id/calendar.ics` | `text/calendar` |

**Path:** `:id` — event UUID.

**Response:**

- `200` — RFC 5545 ICS document; headers include `Content-Disposition: attachment` and `Content-Type: text/calendar; charset=utf-8`.
- `400` — invalid UUID.
- `404` — event not found.
- `500` — build error.

Times are emitted with `TZID` from `GOOGLE_CALENDAR_TIMEZONE` (default America/New_York).

---

## Eco attributes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/eco-attributes` | List all eco attributes (use `id` values when creating events) |

**Response** `200`: JSON array of `{ "id", "name", "category" }`.

**Errors:** `500` on database failure.

---

## Venues

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/venues` | Create venue |
| `GET` | `/api/v1/venues` | List venues (`limit`, `offset` query; default limit 20, max 100) |
| `GET` | `/api/v1/venues/:id` | Get venue by ID |
| `PUT` | `/api/v1/venues/:id` | Update venue (partial JSON body) |
| `DELETE` | `/api/v1/venues/:id` | Delete venue |

**Create body** — see `models.CreateVenueRequest` in code (name, address, city, capacity, `created_by` UUID, eco flags, etc.).

**List query:** `limit` (1–100, default 20), `offset` (≥ 0, default 0).

**Delete:** `204` on success; `404` if venue missing (`venue not found`); `400` invalid UUID.

---

## Error shape

Most errors return JSON:

```json
{ "error": "message" }
```

---

## Database schema

Canonical DDL: `api/db/schema.sql`. Optional one-time patch for older databases: `api/db/patch_add_google_calendar_mappings.sql`.

---

## Running locally

```bash
cd api
go run ./cmd/server
```

Run tests:

```bash
cd api
go test ./...
```

---

## Related files

| File | Role |
|------|------|
| `cmd/server/main.go` | Route registration, middleware, Swagger |
| `internal/handler/*.go` | HTTP handlers |
| `internal/repository/*.go` | SQL access |
| `internal/service/*.go` | Green verification, ICS builder, Google Calendar client |
| `internal/models/*.go` | Request/response structs |
| `docs/docs.go` | Swagger spec (regenerate with `swag` if you change annotations) |
