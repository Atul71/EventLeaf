# EventLeaf Database Setup Guide

## Overview

This guide covers the database schema, Docker setup, and local development environment for EventLeaf.

## Database Schema

The EventLeaf platform uses PostgreSQL with the following core tables:

### Core Tables

1. **users** - User accounts (organizers and attendees)
   - Stores authentication credentials, profile information
   - Tracks organizer status and eco-consciousness preference

2. **venues** - Event venues
   - Location information with coordinates
   - Capacity and amenities
   - Eco-certification tracking
   - Public transit and accessibility features

3. **events** - Event listings
   - Core event information (title, description, date/time)
   - Links to organizer and venue
   - Ticket pricing and availability
   - Eco-friendly flag and summary
   - Event status (draft, published, cancelled, completed)

4. **eco_attributes** - Predefined sustainability practices
   - Categorized eco features (sustainability practices, venue features, transportation)
   - Used to tag events with environmental characteristics

5. **event_eco_attributes** - Links events to eco attributes (junction table)
   - Many-to-many relationship for flexible sustainability labeling

### Supporting Tables

6. **tickets** - Individual tickets purchased for events
   - Links users to events
   - Unique QR code per ticket
   - Status tracking (active, used, refunded, cancelled)

7. **check_ins** - Attendance tracking
   - Records when attendees check in
   - Supports QR scan and manual check-ins
   - Tracks who performed the check-in

8. **event_reviews** - User reviews and ratings
   - Overall event rating and eco-rating
   - Supports sustainability feedback

9. **event_attendees** - Attendance list
   - Tracks registered and attended users
   - Attendance status (registered, attended, no_show)

10. **user_favorites** - Bookmarked events
    - Allows users to save events for later

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Git
- PostgreSQL client tools (optional, for direct database access)

### Setup Steps

1. **Clone the repository and navigate to the project directory**
   ```bash
   cd /path/to/EventLeaf
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start PostgreSQL and pgAdmin**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start a PostgreSQL 15 container with the schema automatically loaded
   - Seed sample data for development
   - Start pgAdmin for database management

4. **Verify the setup**
   ```bash
   docker-compose ps
   ```

   You should see two healthy containers running:
   - `eventleaf-postgres`
   - `eventleaf-pgadmin`

## Database Connection

### For Local Applications

```env
Host: localhost
Port: 5432 (or your custom DB_PORT)
Database: eventleaf_db
Username: eventleaf_user
Password: eventleaf_password
```

### For Docker Containers

```env
Host: postgres
Port: 5432
Database: eventleaf_db
Username: eventleaf_user
Password: eventleaf_password
```

## pgAdmin Access

- **URL**: http://localhost:5050
- **Email**: admin@eventleaf.local
- **Password**: admin

**To connect to the database in pgAdmin:**
1. Right-click on "Servers" → "Register" → "Server"
2. Set connection name (e.g., "EventLeaf")
3. On Connection tab:
   - Host: postgres
   - Port: 5432
   - Username: eventleaf_user
   - Password: eventleaf_password

## Common Commands

### View Database Logs
```bash
docker-compose logs postgres
```

### Access PostgreSQL directly
```bash
docker-compose exec postgres psql -U eventleaf_user -d eventleaf_db
```

### Restart Services
```bash
docker-compose restart
```

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove Volumes (warning: deletes data)
```bash
docker-compose down -v
```

### View Running Containers
```bash
docker-compose ps
```

### Rebuild Containers
```bash
docker-compose up --build
```

## Schema Highlights

### Key Features

1. **UUID Primary Keys** - Using UUID v4 for globally unique identifiers
2. **Timestamps** - All tables track creation and update times
3. **Foreign Keys** - Referential integrity with appropriate cascade rules
4. **Indexes** - Strategic indexes for performance optimization on frequently queried columns
5. **Triggers** - Automatic `updated_at` timestamp updates
6. **Constraints** - Data validation at the database level

### Eco-Friendly Features

The schema includes specialized support for sustainability:
- `eco_attributes` table with categorized environmental practices
- `event_eco_attributes` for flexible tagging of events
- `is_eco_certified` flag on venues
- `eco_rating` for attendee feedback on sustainability

### Data Validation Examples

- Email format validation on users
- Date constraints (event dates >= current date)
- Time validation (end time > start time)
- Positive capacity and ticket price validation
- Rating ranges (1-5)

## Sample Data

The `db/seed.sql` file provides sample data including:
- 5 sample users (organizers and attendees)
- 3 sample venues with various eco-certifications
- 3 sample events (2 eco-friendly, 1 regular)
- Sample tickets and eco-attribute links

All sample data is automatically loaded when the database initializes.

## Customization

### Change Database Credentials

Edit `.env` file before running `docker-compose up`:
```env
DB_USER=your_username
DB_PASSWORD=your_secure_password
DB_NAME=your_db_name
```

### Custom Port

```env
DB_PORT=5433
PGADMIN_PORT=5051
```

### Disable pgAdmin

Edit `docker-compose.yml` and comment out or remove the `pgadmin` service.

## Troubleshooting

### Database won't start
```bash
docker-compose logs postgres
```

### Permission denied errors
```bash
# Fix permissions
docker-compose down -v
docker-compose up --build
```

### Connection refused
- Ensure containers are running: `docker-compose ps`
- Wait for health check to pass (takes ~10s)
- Verify ports aren't already in use

### Can't connect to pgAdmin
- Clear browser cache
- Use incognito/private mode
- Verify pgAdmin container is running

## Schema Updates

To add new tables or modify the schema:

1. Update `db/schema.sql`
2. Drop and recreate containers:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

## Production Considerations

This setup is for **local development only**. For production:
- Use managed database services (AWS RDS, Azure Database, etc.)
- Implement proper backup strategies
- Use SSL/TLS for connections
- Implement connection pooling
- Set up monitoring and alerting
- Use strong passwords
- Implement row-level security policies
- Consider data encryption at rest

## Next Steps

1. Connect your backend application using the connection details above
2. Set up ORM mappings (Sequelize, TypeORM, Prisma, etc.)
3. Implement API routes for CRUD operations
4. Set up migrations for schema changes
5. Add authentication and authorization

## Questions or Issues?

Check the database logs:
```bash
docker-compose logs -f postgres
```

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
