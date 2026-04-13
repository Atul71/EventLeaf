# EventLeaf Database Configuration

This directory contains all database-related files for the EventLeaf project.

## Directory Structure

```
db/
├── schema.sql       # PostgreSQL schema definition with all tables
├── seed.sql         # Sample data for development
└── README.md        # This file
```

## Files Overview

### schema.sql

Complete PostgreSQL database schema for EventLeaf including:

**Tables:**
- `users` - User accounts and profiles
- `venues` - Event venue information
- `events` - Event listings
- `eco_attributes` - Sustainability practice definitions
- `event_eco_attributes` - Event-to-eco-attribute relationships
- `tickets` - Individual event tickets
- `check_ins` - Attendance records
- `event_reviews` - User reviews and ratings
- `event_attendees` - Event attendance tracking
- `user_favorites` - Bookmarked events

**Features:**
- UUID v4 primary keys for global uniqueness
- Foreign key constraints for referential integrity
- Automatic timestamp management via triggers
- Indexes on frequently queried columns
- Data validation at the database level
- Default values and constraints

### seed.sql

Sample development data automatically loaded on database initialization:

**Sample Data:**
- 5 users (4 with defined roles + 1 admin)
- 3 Gainesville anchor venues plus ~30 additional demo venues (BE-102–style names + extras; mix of eco-certified and standard)
- Many published demo events (original 3 plus ~35 city/venue variety for Discover)
- 2 sample tickets
- Eco-attribute associations

This data is useful for:
- Local development and testing
- UI/UX demonstration
- API testing without creating test data manually

## Auto-Loading During Docker Initialization

The Docker Compose configuration (`api/docker-compose.yml`) automatically loads these files in order:

1. `schema.sql` - Creates all database structure (includes `eco_attributes` rows)
2. `seed.sql` - Inserts sample users, **3 venues**, sample events, and tickets

This runs **once** when the Postgres data volume is first created. Start the stack from the `api/` folder:

```bash
docker compose up -d
```

### Venues missing or seed never ran?

If `GET /api/v1/venues` returns `[]` but the API connects OK, apply the seed against the running container:

```bash
# macOS / Linux (from api/)
chmod +x scripts/apply-seed.sh && ./scripts/apply-seed.sh
```

```powershell
# Windows PowerShell (from api/)
.\scripts\apply-seed.ps1
```

To **reset everything** (wipes data) and re-run schema + seed on next start:

```bash
docker compose down -v
docker compose up -d
```

Ensure your Go app `.env` uses the same `DB_PORT` as the host port mapped in Compose. On Windows, if **another PostgreSQL** is installed, it often uses **5432**; use **`DB_PORT=5433`** in `.env` and recreate Compose so Docker maps **5433→5432** (see repo root `.env.example`).

## Creating Backups

### Export Schema Only
```bash
docker-compose exec postgres pg_dump \
  -U eventleaf_user \
  -d eventleaf_db \
  --schema-only \
  > db/schema_backup.sql
```

### Export Complete Database
```bash
docker-compose exec postgres pg_dump \
  -U eventleaf_user \
  -d eventleaf_db \
  > db/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup
```bash
docker-compose exec -T postgres psql \
  -U eventleaf_user \
  -d eventleaf_db \
  < db/backup_20240212_120000.sql
```

## Modifying the Schema

### Add a New Table

1. Edit `schema.sql` and add your table definition
2. Restart the database:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

### Add New Sample Data

1. Add INSERT statements to `seed.sql`
2. Restart the database:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

### Update Existing Table

For development:
```bash
docker-compose exec postgres psql \
  -U eventleaf_user \
  -d eventleaf_db \
  -c "ALTER TABLE table_name ADD COLUMN new_column TYPE;"
```

## SQL Queries for Common Tasks

### Get Event Statistics
```sql
SELECT 
    e.title,
    v.name AS venue,
    COUNT(t.id) AS tickets_sold,
    COUNT(DISTINCT c.id) AS attendees,
    e.is_eco_friendly
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN tickets t ON e.id = t.event_id
LEFT JOIN check_ins c ON t.id = c.ticket_id
GROUP BY e.id, e.title, v.name, e.is_eco_friendly;
```

### List Eco-Friendly Events
```sql
SELECT 
    e.title,
    e.event_date,
    v.name AS venue,
    array_agg(ea.name) AS eco_features
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN event_eco_attributes eea ON e.id = eea.event_id
LEFT JOIN eco_attributes ea ON eea.eco_attribute_id = ea.id
WHERE e.is_eco_friendly = true
GROUP BY e.id, e.title, e.event_date, v.name;
```

### User Attendance History
```sql
SELECT 
    u.first_name,
    u.last_name,
    e.title,
    c.checked_in_at
FROM check_ins c
JOIN tickets t ON c.ticket_id = t.id
JOIN users u ON t.user_id = u.id
JOIN events e ON t.event_id = e.id
ORDER BY c.checked_in_at DESC;
```

## Connection Details

**Local Development:**
```
Host: localhost
Port: 5432
Database: eventleaf_db
User: eventleaf_user
Password: eventleaf_password
```

**From Docker Container:**
```
Host: postgres
Port: 5432
Database: eventleaf_db
User: eventleaf_user
Password: eventleaf_password
```

## Environment Variables

The database uses environment variables from `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventleaf_db
DB_USER=eventleaf_user
DB_PASSWORD=eventleaf_password
```

Copy `.env.example` to `.env` and update as needed.

## Design Decisions

### UUID Primary Keys
- Global uniqueness across systems
- Better for distributed systems
- Security through obscurity
- Industry standard for modern apps

### Cascade Deletes
- User deletion cascades to their created content
- Event deletion removes all related tickets
- Maintains referential integrity automatically

### Soft vs Hard Deletes
- Using hard deletes (actual removal) for simplicity
- Consider soft deletes (status field) for production
- Add `deleted_at` column and timestamp triggers if needed

### Index Strategy
- Indexed on foreign keys for join performance
- Indexed on commonly filtered columns (status, dates)
- Indexed on email for lookups

## Performance Optimization Tips

### Query Optimization
1. Use EXPLAIN ANALYZE before optimizing
2. Monitor slow query log
3. Add indexes for WHERE and JOIN conditions
4. Use partial indexes for filtered subsets

### Connection Pooling
Use PgBouncer for efficient connection management:
```bash
docker-compose exec postgres apt-get install -y pgbouncer
```

### Regular Maintenance
```sql
-- Analyze table statistics
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Reindex if necessary
REINDEX DATABASE eventleaf_db;
```

## Version Control

- **schema.sql** - Always version controlled
- **seed.sql** - Version controlled (development data)
- **.env** - Do NOT commit (use .env.example instead)
- Database backups - Store separately if sensitive

## Additional Resources

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://databasedesign.io/)
- [SQL Query Optimization Guide](https://sqltuning.com/)
