# EventLeaf Database - Quick Start Guide

Get your EventLeaf database up and running in 5 minutes! 🚀

## Prerequisites

- Docker & Docker Compose installed
- Terminal access

## 5-Minute Setup

### Step 1: Create Environment Configuration (1 minute)

```bash
cd /path/to/EventLeaf
cp .env.example .env
```

The `.env` file is already configured with defaults and is ready to use!

### Step 2: Start the Database (1 minute)

**Option A: Using Docker Compose (Recommended)**

```bash
docker-compose up -d
```

**Option B: Using Makefile**

```bash
make db-start
```

**Option C: Using the Management Script**

```bash
./db/manage.sh start
```

### Step 3: Wait for Health Check (1 minute)

```bash
docker-compose ps
```

You should see both services with status `healthy` or `running`:
```
NAME                  STATUS
eventleaf-postgres    Up 2 minutes (healthy)
eventleaf-pgadmin     Up 2 minutes
```

### Step 4: Verify the Setup (1 minute)

**Access pgAdmin:**
- URL: http://localhost:5050
- Email: `admin@eventleaf.local`
- Password: `admin`

**Or test via terminal:**

```bash
docker-compose exec postgres psql \
  -U eventleaf_user \
  -d eventleaf_db \
  -c "SELECT COUNT(*) as user_count FROM users;"
```

Expected output: `user_count` should show `5` (from sample data)

### Step 5: Start Developing (1 minute)

Connect your application with these credentials:

```
Host: localhost
Port: 5432
Database: eventleaf_db
Username: eventleaf_user
Password: eventleaf_password
```

## Common Next Steps

### Connect from Node.js
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'eventleaf_user',
  password: 'eventleaf_password',
  host: 'localhost',
  port: 5432,
  database: 'eventleaf_db'
});
```

### Connect from Python
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="eventleaf_db",
    user="eventleaf_user",
    password="eventleaf_password",
    port=5432
)
```

### Access PostgreSQL Shell
```bash
make db-shell
# Or
./db/manage.sh shell
# Or
docker-compose exec postgres psql -U eventleaf_user -d eventleaf_db
```

## Essential Commands

### View Service Status
```bash
make db-status
```

### Restart Services
```bash
make db-restart
```

### View Logs
```bash
make db-logs
```

### Create Backup
```bash
make db-backup
# Creates: db/backup_YYYYMMDD_HHMMSS.sql
```

### Restore from Backup
```bash
make db-restore
```

### Run Any SQL Query
```bash
make db-query QUERY='SELECT * FROM events;'
```

### Reset Database (Warning: Deletes Data)
```bash
make db-reset
```

## Stop Services

When done developing:

```bash
docker-compose down
```

## Troubleshooting

### Services won't start?
```bash
docker-compose logs postgres
```

### Database connection refused?
```bash
# Wait a bit longer and check health
docker-compose ps
# Services need ~10 seconds to be fully ready
```

### Want to start fresh?
```bash
docker-compose down -v
docker-compose up -d
```

## What's Been Set Up

✅ PostgreSQL 15 database (`eventleaf_db`)
✅ Sample schema with 10+ tables
✅ Pre-populated sample data (5 users, 3 venues, 3 events)
✅ pgAdmin for visual database management
✅ UUID support and automatic timestamps
✅ Full-text search ready
✅ Eco-attributes system for sustainability tracking

## Schema Overview

### Core Tables
- **users** - Organizers and attendees
- **events** - Event listings with eco-friendly flags
- **venues** - Physical locations
- **tickets** - Individual tickets (with QR codes)

### Supporting Tables
- **eco_attributes** - Sustainability practices library
- **event_eco_attributes** - Links events to eco features
- **check_ins** - Attendance tracking
- **event_reviews** - User ratings and feedback
- **event_attendees** - Attendance records
- **user_favorites** - Bookmarked events

## Sample Data Included

The database comes pre-populated with:

**Users:**
- John Organizer (organizer)
- Jane Attendee (attendee)
- Bob Manager (organizer)
- Alice Smith (attendee)
- Charlie Admin (admin/organizer)

**Events:**
- Earth Day 2024 (eco-friendly)
- Tech Conference 2024 (eco-friendly with LEED venue)
- Local Music Night (conventional)

**Venues:**
- Green Park Amphitheater (eco-certified)
- Eco Convention Center (LEED certified)
- Downtown Community Hall

## Next Steps for Your Team

### Frontend Developers
1. Verify database connectivity from backend
2. Review [db/SCHEMA_DOCUMENTATION.md](db/SCHEMA_DOCUMENTATION.md) for data structure
3. Plan UI components based on table structure

### Backend Developers
1. Set up ORM (Prisma, Sequelize, TypeORM, etc.)
2. Create models based on [db/SCHEMA_DOCUMENTATION.md](db/SCHEMA_DOCUMENTATION.md)
3. Implement API endpoints for CRUD operations

### Database Administrators
1. Review `db/schema.sql` for customizations
2. Set up monitoring
3. Plan backup strategy

## Database Files

```
db/
├── schema.sql              # Complete schema definition
├── seed.sql                # Sample data
├── manage.sh               # Management script
├── README.md               # Detailed documentation
└── SCHEMA_DOCUMENTATION.md # Full schema reference
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5432 already in use | Change `DB_PORT` in `.env` |
| pgAdmin won't load | Clear browser cache, use incognito mode |
| Can't connect from app | Verify `.env` settings, check firewall |
| Data disappeared | You likely stopped containers with `docker-compose down` (use `down` not `down -v`) |

## Getting Help

1. Check logs: `docker-compose logs postgres`
2. Review docs: `DB_SETUP.md` or `db/SCHEMA_DOCUMENTATION.md`
3. Check connection: `docker-compose exec postgres pg_isready`
4. Verify sample data: Look at `db/seed.sql`

## Ready to Go! 🚀

Your database is now ready for development. Start building EventLeaf!

For detailed information, see:
- [DB_SETUP.md](DB_SETUP.md) - Complete setup guide
- [db/SCHEMA_DOCUMENTATION.md](db/SCHEMA_DOCUMENTATION.md) - Full schema reference
- [db/README.md](db/README.md) - Database operations guide
