.PHONY: help db-start db-stop db-restart db-reset db-backup db-restore db-logs db-query db-shell db-status

# EventLeaf Database Management Makefile
# Makes database operations convenient with simple commands

# Default target - show help
.DEFAULT_GOAL := help

help:
	@echo "EventLeaf Database Management"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Database Targets:"
	@echo "  db-start       Start PostgreSQL and pgAdmin services"
	@echo "  db-stop        Stop all services"
	@echo "  db-restart     Restart services"
	@echo "  db-reset       Reset database (⚠️  deletes all data)"
	@echo "  db-status      Show service status"
	@echo ""
	@echo "Backup & Restore:"
	@echo "  db-backup      Create database backup"
	@echo "  db-restore     Restore from backup"
	@echo ""
	@echo "Access:"
	@echo "  db-shell       Access PostgreSQL interactive shell"
	@echo "  db-logs        View PostgreSQL logs"
	@echo ""
	@echo "Database Tools:"
	@echo "  db-query       Execute SQL query (make db-query QUERY='SELECT * FROM users;')"
	@echo ""
	@echo "Examples:"
	@echo "  make db-start"
	@echo "  make db-backup"
	@echo "  make db-query QUERY='SELECT COUNT(*) FROM events;'"
	@echo ""

db-start:
	@echo "Starting EventLeaf database services..."
	@docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@docker-compose exec postgres pg_isready -U eventleaf_user -d eventleaf_db
	@echo "✓ Services started successfully"
	@echo ""
	@echo "Access points:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  pgAdmin:    http://localhost:5050"

db-stop:
	@echo "Stopping services..."
	@docker-compose down
	@echo "✓ Services stopped"

db-restart:
	@echo "Restarting services..."
	@docker-compose restart
	@echo "✓ Services restarted"

db-reset:
	@echo "⚠️  Resetting database will delete all data"
	@read -p "Continue? (y/n): " confirm && [ "$$confirm" = "y" ] || (echo "Cancelled"; exit 1)
	@docker-compose down -v
	@docker-compose up -d
	@echo "Waiting for database initialization..."
	@sleep 10
	@echo "✓ Database reset complete"

db-status:
	@echo "Service Status:"
	@docker-compose ps
	@echo ""
	@docker-compose ps | grep -q "postgres.*healthy" && echo "✓ PostgreSQL is healthy" || echo "⚠️  PostgreSQL status unknown"

db-backup:
	@echo "Creating database backup..."
	@mkdir -p db
	@docker-compose exec -T postgres pg_dump \
		-U eventleaf_user \
		-d eventleaf_db \
		> db/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup created successfully"
	@ls -lh db/backup_*.sql | tail -1

db-restore:
	@echo "Available backups:"
	@ls -lh db/backup_*.sql 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup filename: " backup && \
	read -p "Continue restore? (y/n): " confirm && \
	[ "$$confirm" = "y" ] && \
	docker-compose exec -T postgres psql \
		-U eventleaf_user \
		-d eventleaf_db \
		< $$backup && \
	echo "✓ Restore complete" || echo "Cancelled"

db-shell:
	@docker-compose exec postgres psql \
		-U eventleaf_user \
		-d eventleaf_db

db-logs:
	@docker-compose logs -f postgres

db-query:
	@if [ -z "$(QUERY)" ]; then \
		echo "Error: QUERY not provided"; \
		echo "Usage: make db-query QUERY='SELECT * FROM users;'"; \
		exit 1; \
	fi
	@docker-compose exec -T postgres psql \
		-U eventleaf_user \
		-d eventleaf_db \
		-c "$(QUERY)"
