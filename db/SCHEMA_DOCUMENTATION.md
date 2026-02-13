# EventLeaf Database Schema Diagram & Documentation

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EventLeaf Database Schema                    │
└─────────────────────────────────────────────────────────────────────┘

                              USERS
                        ┌─────────────────┐
                        │ id (PK, UUID)   │
                        │ email (UNIQUE)  │
                        │ password_hash   │
                        │ first_name      │
                        │ last_name       │
                        │ phone           │
                        │ is_organizer    │
                        │ is_eco_conscious│
                        │ bio             │
                        │ created_at      │
                        │ updated_at      │
                        └────────┬────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
          (FK) │          (FK)  │          (FK)  │
                │                │                │
                ▼                ▼                ▼
        ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
        │   VENUES     │   │    EVENTS    │  │   TICKETS    │
        ├──────────────┤   ├──────────────┤  ├──────────────┤
        │ id (PK, UUID)│   │ id (PK, UUID)│  │ id (PK, UUID)│
        │ name         │   │ title        │  │ user_id (FK) │
        │ address      │   │ description  │  │ event_id(FK) │
        │ city         │   │ organizer_id │  │ ticket_number│
        │ state        │   │ venue_id(FK) │  │ ticket_type  │
        │ zip_code     │   │ event_date   │  │ purchase_date│
        │ capacity     │   │ event_time   │  │ status       │
        │ is_eco_cert  │   │ is_eco_friendly
        │ contact_info │   │ ticket_price │  │ price_paid   │
        │ created_at   │   │ total_cap    │  │ created_at   │
        │ updated_at   │   │ available    │  │ updated_at   │
        └──────────────┘   │ status       │  └──────┬───────┘
                           │ visibility   │         │
                           │ created_at   │         │ (FK)
                           │ updated_at   │         │
                           └───────┬──────┘         ▼
                                   │        ┌──────────────┐
                                   │        │   CHECK_INS  │
                                   │        ├──────────────┤
                                   │        │ id (PK, UUID)│
                                   │        │ ticket_id(FK)│
                                   │        │ event_id (FK)│
                                   │        │ checked_in_at│
                                   │        │ check_method │
                                   │        │ checked_in_by│
                                   │        │ notes        │
                                   │        └──────────────┘
                                   │
                          (Junction Table)
                                   │
                           ┌───────▼────────┐
                           │EVENT_ECO_ATTRS │
                           ├────────────────┤
                           │event_id (FK)   │
                           │eco_attr_id(FK) │
                           │added_at        │
                           └────────┬───────┘
                                    │
                                    │ (FK)
                                    │
                           ┌────────▼────────┐
                           │ ECO_ATTRIBUTES  │
                           ├─────────────────┤
                           │ id (PK, UUID)   │
                           │ name (UNIQUE)   │
                           │ category        │
                           │ description     │
                           │ icon_url        │
                           │ created_at      │
                           └─────────────────┘

Additional Tables:
                    ┌─────────────────────┐
                    │  EVENT_REVIEWS      │
                    ├─────────────────────┤
                    │ id (PK, UUID)       │
                    │ user_id (FK)        │
                    │ event_id (FK)       │
                    │ rating (1-5)        │
                    │ eco_rating (1-5)    │
                    │ review_text         │
                    │ created_at          │
                    │ updated_at          │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │  EVENT_ATTENDEES    │
                    ├─────────────────────┤
                    │ id (PK, UUID)       │
                    │ event_id (FK)       │
                    │ user_id (FK)        │
                    │ attendance_status   │
                    │ added_at            │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │  USER_FAVORITES     │
                    ├─────────────────────┤
                    │ id (PK, UUID)       │
                    │ user_id (FK)        │
                    │ event_id (FK)       │
                    │ created_at          │
                    └─────────────────────┘
```

## Table Details

### USERS
**Purpose:** Store user account information for organizers and attendees

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email format validated |
| password_hash | VARCHAR(255) | NOT NULL | Should be bcrypt or similar |
| first_name | VARCHAR(100) | NOT NULL | |
| last_name | VARCHAR(100) | NOT NULL | |
| phone | VARCHAR(20) | | Optional |
| is_organizer | BOOLEAN | DEFAULT false | Distinguishes organizers from attendees |
| is_eco_conscious | BOOLEAN | DEFAULT false | User preference for eco-friendly events |
| bio | TEXT | | User biography |
| profile_image_url | VARCHAR(500) | | URL to profile picture |
| created_at | TIMESTAMP | DEFAULT NOW | Auto-set |
| updated_at | TIMESTAMP | DEFAULT NOW | Updated by trigger |

**Indexes:**
- email (for login lookups)
- is_organizer (for filtering)

---

### VENUES
**Purpose:** Store physical venue information for events

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| name | VARCHAR(255) | NOT NULL | Venue name |
| description | TEXT | | Venue description |
| address | VARCHAR(500) | NOT NULL | Street address |
| city | VARCHAR(100) | NOT NULL | City name |
| state | VARCHAR(2) | | US state code |
| zip_code | VARCHAR(10) | | Postal code |
| country | VARCHAR(100) | DEFAULT 'USA' | Country |
| latitude | DECIMAL(10,8) | | For mapping |
| longitude | DECIMAL(11,8) | | For mapping |
| capacity | INTEGER | > 0 CHECK | Maximum attendee capacity |
| contact_email | VARCHAR(255) | | Venue contact |
| contact_phone | VARCHAR(20) | | Venue phone |
| website_url | VARCHAR(500) | | Venue website |
| is_eco_certified | BOOLEAN | DEFAULT false | Has environmental certification |
| eco_certifications | TEXT[] | | Array of certification names |
| has_public_transit | BOOLEAN | DEFAULT false | Public transport access |
| has_parking | BOOLEAN | DEFAULT false | Parking availability |
| has_accessible_facilities | BOOLEAN | DEFAULT false | ADA compliant |
| created_by | UUID | NOT NULL FK | Reference to user who added venue |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | Updated by trigger |

**Indexes:**
- city (for location searches)
- is_eco_certified (for eco-venue filtering)

---

### EVENTS
**Purpose:** Store event information with eco-friendly attributes

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| title | VARCHAR(255) | NOT NULL | Event name |
| description | TEXT | NOT NULL | Event description |
| organizer_id | UUID | NOT NULL FK → USERS | Event creator |
| venue_id | UUID | FK → VENUES | NULL if virtual |
| event_date | DATE | >= CURRENT_DATE | Event day |
| event_start_time | TIME | NOT NULL | Start time |
| event_end_time | TIME | > start_time | End time |
| is_eco_friendly | BOOLEAN | DEFAULT false | Sustainability flag |
| eco_summary | TEXT | | Description of eco practices |
| ticket_price | DECIMAL(10,2) | >= 0 | Price per ticket |
| total_capacity | INTEGER | > 0 | Max attendees |
| available_tickets | INTEGER | >= 0 | Remaining tickets |
| status | VARCHAR(50) | DEFAULT 'draft' | draft, published, cancelled, completed |
| visibility | VARCHAR(50) | DEFAULT 'public' | public, private, invite_only |
| image_url | VARCHAR(500) | | Event poster/image |
| event_url | VARCHAR(500) | | Event website |
| category | VARCHAR(100) | | music, sports, conference, etc. |
| has_digital_ticketing | BOOLEAN | DEFAULT true | Digital tickets only |
| has_paperless_checkin | BOOLEAN | DEFAULT true | QR code check-in |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | Updated by trigger |

**Indexes:**
- organizer_id (find events by organizer)
- venue_id (find events at venue)
- event_date (timeline queries)
- is_eco_friendly (filter eco events)
- status (find published/active events)

---

### ECO_ATTRIBUTES
**Purpose:** Predefined list of sustainability practices and features

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| name | VARCHAR(200) | UNIQUE, NOT NULL | Eco-feature name |
| category | VARCHAR(50) | NOT NULL | Type of attribute |
| description | TEXT | | Details |
| icon_url | VARCHAR(500) | | For UI display |
| created_at | TIMESTAMP | DEFAULT NOW | |

**Categories:**
- sustainability_practice (Paperless, waste reduction)
- venue_feature (parking, transit access)
- transportation (carbon offset, carpool)

---

### EVENT_ECO_ATTRIBUTES (Junction Table)
**Purpose:** Link events to multiple eco-friendly attributes

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| event_id | UUID | NOT NULL FK, PRIMARY KEY | |
| eco_attribute_id | UUID | NOT NULL FK, PRIMARY KEY | |
| added_at | TIMESTAMP | DEFAULT NOW | When linked |

---

### TICKETS
**Purpose:** Individual ticket records for event attendees

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| user_id | UUID | NOT NULL FK | Ticket owner |
| event_id | UUID | NOT NULL FK | Associated event |
| ticket_number | VARCHAR(100) | UNIQUE, NOT NULL | QR code value |
| ticket_type | VARCHAR(50) | DEFAULT 'general' | general, vip, early_bird |
| purchase_date | TIMESTAMP | DEFAULT NOW | When purchased |
| status | VARCHAR(50) | DEFAULT 'active' | active, used, refunded, cancelled |
| price_paid | DECIMAL(10,2) | >= 0 | Price at time of purchase |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | Updated by trigger |

**Indexes:**
- user_id (find user's tickets)
- event_id (find event's ticket sales)
- ticket_number (QR code lookup)
- status (find redeemable tickets)

---

### CHECK_INS
**Purpose:** Track event attendance via QR code or manual entry

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| ticket_id | UUID | NOT NULL FK | Ticket being scanned |
| event_id | UUID | NOT NULL FK | Event reference |
| checked_in_at | TIMESTAMP | DEFAULT NOW | When attended |
| check_in_method | VARCHAR(50) | NOT NULL | 'qr_scan' or 'manual' |
| checked_in_by | UUID | FK | Staff member who checked in |
| notes | TEXT | | Additional notes |

**Indexes:**
- ticket_id (find check-in for ticket)
- event_id (find all check-ins for event)
- checked_in_at (timeline analysis)

---

### EVENT_REVIEWS
**Purpose:** User reviews and ratings for events

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| user_id | UUID | NOT NULL FK | Review author |
| event_id | UUID | NOT NULL FK | Reviewed event |
| rating | INTEGER | 1-5 | Overall satisfaction |
| eco_rating | INTEGER | 1-5 | Sustainability rating |
| review_text | TEXT | | Review content |
| created_at | TIMESTAMP | DEFAULT NOW | |
| updated_at | TIMESTAMP | DEFAULT NOW | |

**Constraint:** UNIQUE(user_id, event_id) - One review per user per event

---

### EVENT_ATTENDEES
**Purpose:** Track who attended each event

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| event_id | UUID | NOT NULL FK | Event |
| user_id | UUID | NOT NULL FK | Attendee |
| attendance_status | VARCHAR(50) | DEFAULT 'registered' | registered, attended, no_show |
| added_at | TIMESTAMP | DEFAULT NOW | When registered |

**Constraint:** UNIQUE(event_id, user_id)

---

### USER_FAVORITES
**Purpose:** Users can bookmark events for later

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | |
| user_id | UUID | NOT NULL FK | User |
| event_id | UUID | NOT NULL FK | Favorited event |
| created_at | TIMESTAMP | DEFAULT NOW | |

**Constraint:** UNIQUE(user_id, event_id)

## Key Design Decisions

### Primary Keys
- **UUID v4** for all tables ensures:
  - Global uniqueness across databases
  - Security through obscurity
  - Better for distributed systems
  - Replication friendly

### Foreign Key Strategy
- Cascade deletes for user content (user deletion removes their events)
- Set NULL for optional relationships (event without venue)
- Cascade deletes for details (event deletion removes tickets)

### Performance Considerations
- Strategic indexes on foreign keys and filter columns
- Composite indexes on frequently joined columns
- Partial indexes could be added for large tables

### Data Integrity
- Constraints at DB level for critical rules
- NOT NULL for required fields
- CHECK constraints for valid ranges
- UNIQUE constraints for natural keys

### Timestamp Management
- Auto-populated `created_at` on insert
- Auto-updated `updated_at` via trigger on any UPDATE
- Used for audit trails and sorting

## Sample Queries

### Find upcoming eco-friendly events
```sql
SELECT e.*, v.name as venue_name, array_agg(ea.name) as eco_attrs
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN event_eco_attributes eea ON e.id = eea.event_id
LEFT JOIN eco_attributes ea ON eea.eco_attribute_id = ea.id
WHERE e.is_eco_friendly = true
  AND e.event_date >= CURRENT_DATE
  AND e.status = 'published'
GROUP BY e.id, v.name
ORDER BY e.event_date;
```

### Get event attendance statistics
```sql
SELECT 
    e.title,
    COUNT(DISTINCT t.user_id) as tickets_sold,
    COUNT(DISTINCT c.id) as attendees,
    ROUND(COUNT(DISTINCT c.id)::numeric / nullif(COUNT(DISTINCT t.user_id), 0) * 100, 1) as attendance_rate
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id
LEFT JOIN check_ins c ON t.id = c.ticket_id
WHERE e.event_date < CURRENT_DATE
GROUP BY e.id, e.title
ORDER BY e.event_date DESC;
```

### Find eco-friendly venues by city
```sql
SELECT name, city, capacity, is_eco_certified, eco_certifications, has_public_transit
FROM venues
WHERE city = 'Gainesville'
  AND is_eco_certified = true
ORDER BY capacity;
```

## Future Enhancements

### Potential Additional Tables
- `event_sponsors` - Sponsorship relationships
- `notifications` - User notifications
- `analytics` - Event metrics and KPIs
- `audit_logs` - Activity tracking
- `promotions` - Vouchers and discounts

### Soft Deletes
Consider adding `deleted_at` column for audit trails rather than hard deletes.

### Partitioning
For large event tables, consider time-based partitioning by event_date.

### Full-Text Search
Add GIN indexes for full-text search on event descriptions.
