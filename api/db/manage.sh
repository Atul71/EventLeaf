#!/bin/bash

# EventLeaf Database Setup and Management Script
# This script simplifies database operations for local development

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eventleaf_db}"
DB_USER="${DB_USER:-eventleaf_user}"
DB_PASSWORD="${DB_PASSWORD:-eventleaf_password}"

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    print_success "Docker is installed"
}

check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env file created"
        else
            print_error ".env.example not found"
            exit 1
        fi
    fi
}

# Main commands
start_services() {
    print_header "Starting EventLeaf Database Services"
    
    check_docker
    check_env_file
    
    echo "Starting Docker Compose services..."
    docker-compose up -d
    
    echo "Waiting for services to be healthy..."
    sleep 5
    
    # Check if postgres is healthy
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U $DB_USER -d $DB_NAME &> /dev/null; then
            print_success "PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start within 30 seconds"
            docker-compose logs postgres
            exit 1
        fi
        echo "Waiting... ($i/30)"
        sleep 1
    done
    
    print_success "All services started successfully"
    print_success "PostgreSQL: localhost:$DB_PORT"
    print_success "pgAdmin: http://localhost:5050 (admin@eventleaf.local / admin)"
}

stop_services() {
    print_header "Stopping EventLeaf Database Services"
    
    if docker-compose ps | grep -q running; then
        docker-compose down
        print_success "Services stopped"
    else
        print_warning "No running services"
    fi
}

restart_services() {
    print_header "Restarting EventLeaf Database Services"
    
    docker-compose restart
    print_success "Services restarted"
}

reset_database() {
    print_header "Resetting Database"
    
    print_warning "This will delete all data and recreate the database"
    read -p "Are you sure? (type 'yes' to confirm): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_warning "Reset cancelled"
        return
    fi
    
    docker-compose down -v
    print_success "Data volumes removed"
    
    docker-compose up -d
    
    # Wait for database to be ready
    echo "Waiting for database to initialize..."
    sleep 5
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U $DB_USER &> /dev/null; then
            print_success "Database reset and ready"
            return
        fi
        echo "Waiting... ($i/30)"
        sleep 1
    done
}

backup_database() {
    print_header "Backing Up Database"
    
    if ! docker-compose ps | grep -q postgres; then
        print_error "PostgreSQL is not running. Start services first."
        exit 1
    fi
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="db/backup_${TIMESTAMP}.sql"
    
    echo "Creating backup to $BACKUP_FILE..."
    
    docker-compose exec -T postgres pg_dump \
        -U $DB_USER \
        -d $DB_NAME \
        > "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "Database backed up to $BACKUP_FILE"
    else
        print_error "Backup failed"
        exit 1
    fi
}

restore_database() {
    print_header "Restoring Database from Backup"
    
    if [ -z "$1" ]; then
        echo "Available backups:"
        ls -lh db/backup_*.sql 2>/dev/null || echo "No backups found"
        echo ""
        read -p "Enter backup file name (or path): " backup_file
    else
        backup_file="$1"
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_warning "This will overwrite the current database"
    read -p "Are you sure? (type 'yes' to confirm): " confirmation
    
    if [ "$confirmation" != "yes" ]; then
        print_warning "Restore cancelled"
        return
    fi
    
    if ! docker-compose ps | grep -q postgres; then
        print_error "PostgreSQL is not running. Start services first."
        exit 1
    fi
    
    echo "Restoring from $backup_file..."
    
    docker-compose exec -T postgres psql \
        -U $DB_USER \
        -d $DB_NAME \
        < "$backup_file"
    
    if [ $? -eq 0 ]; then
        print_success "Database restored successfully"
    else
        print_error "Restore failed"
        exit 1
    fi
}

view_logs() {
    print_header "Database Logs"
    docker-compose logs -f postgres
}

run_query() {
    if [ -z "$1" ]; then
        print_error "Please provide a SQL query"
        exit 1
    fi
    
    if ! docker-compose ps | grep -q postgres; then
        print_error "PostgreSQL is not running"
        exit 1
    fi
    
    docker-compose exec -T postgres psql \
        -U $DB_USER \
        -d $DB_NAME \
        -c "$1"
}

access_shell() {
    print_header "Accessing PostgreSQL Shell"
    
    if ! docker-compose ps | grep -q postgres; then
        print_error "PostgreSQL is not running"
        exit 1
    fi
    
    docker-compose exec postgres psql \
        -U $DB_USER \
        -d $DB_NAME
}

show_status() {
    print_header "Service Status"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    docker-compose ps
    
    echo ""
    if docker-compose ps | grep -q "postgres.*healthy"; then
        print_success "PostgreSQL is healthy"
    elif docker-compose ps | grep -q postgres; then
        print_warning "PostgreSQL is running but health status unknown"
    else
        print_warning "PostgreSQL is not running"
    fi
}

list_backups() {
    print_header "Available Backups"
    
    if ls db/backup_*.sql 1> /dev/null 2>&1; then
        ls -lh db/backup_*.sql | awk '{print $9, "(" $5 ")"}'
    else
        print_warning "No backups found in db/ directory"
    fi
}

show_help() {
    cat << EOF
${BLUE}EventLeaf Database Management Script${NC}

Usage: $0 <command> [options]

Commands:
    ${GREEN}start${NC}           Start PostgreSQL and pgAdmin services
    ${GREEN}stop${NC}            Stop all services
    ${GREEN}restart${NC}         Restart all services
    ${GREEN}reset${NC}           Reset database (deletes all data)
    ${GREEN}backup${NC}          Create a database backup
    ${GREEN}restore${NC} [file]  Restore database from backup
    ${GREEN}logs${NC}            View PostgreSQL logs
    ${GREEN}query${NC} <sql>     Execute a SQL query
    ${GREEN}shell${NC}           Access PostgreSQL interactive shell
    ${GREEN}status${NC}          Show service status
    ${GREEN}backups${NC}         List available backups
    ${GREEN}help${NC}            Show this help message

Examples:
    # Start services
    $0 start
    
    # Create a backup
    $0 backup
    
    # Run a query
    $0 query "SELECT * FROM users;"
    
    # Access PostgreSQL shell
    $0 shell
    
    # View logs
    $0 logs

Configuration (from .env file):
    DB_HOST: $DB_HOST
    DB_PORT: $DB_PORT
    DB_NAME: $DB_NAME
    DB_USER: $DB_USER

For more information, see DB_SETUP.md

EOF
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    reset)
        reset_database
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    logs)
        view_logs
        ;;
    query)
        run_query "$2"
        ;;
    shell)
        access_shell
        ;;
    status)
        show_status
        ;;
    backups)
        list_backups
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
        fi
        ;;
esac
