#!/bin/bash

# Docker-based database backup script for Local PostgreSQL
# This script creates backups from the local PostgreSQL database using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user confirmation
confirm() {
    local prompt="$1"
    local default="${2:-N}"
    
    while true; do
        read -p "$prompt (y/N): " -n 1 -r
        echo
        
        if [[ -z "$REPLY" ]]; then
            REPLY="$default"
        fi
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            return 0
        elif [[ $REPLY =~ ^[Nn]$ ]]; then
            return 1
        else
            echo "Please answer y or n."
        fi
    done
}

# Function to load local PostgreSQL credentials from .env.db.docker
load_docker_credentials() {
    local docker_env_file="../.env.db.docker"
    
    if [ ! -f "$docker_env_file" ]; then
        print_error "Docker environment file not found: $docker_env_file"
        print_error "Please create .env.db.docker with your local PostgreSQL credentials"
        exit 1
    fi
    
    # Load Docker PostgreSQL credentials
    set -a
    source "$docker_env_file"
    set +a
    
    # Validate that we have local PostgreSQL settings
    if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then
        print_error "Missing required local PostgreSQL environment variables in $docker_env_file"
        print_error "Required: DB_USER, DB_PASSWORD, DB_HOST, DB_NAME"
        exit 1
    fi
    
    print_info "Using local PostgreSQL credentials:"
    print_info "  Host: $DB_HOST"
    print_info "  User: $DB_USER"
    print_info "  Database: $DB_NAME"
    print_info "  Port: ${DB_PORT:-5432}"
}

# Function to check if local PostgreSQL is running
check_postgres_running() {
    print_step "Checking if local PostgreSQL is running..."
    
    # Check if Docker container is running
    if ! docker-compose -f ../deployment/docker-compose.postgres.yml ps | grep -q "Up"; then
        print_error "Local PostgreSQL container is not running"
        print_info "Please start PostgreSQL first: cd ../deployment && ./start-postgres.sh"
        exit 1
    fi
    
    # Test connection
    if docker-compose -f ../deployment/docker-compose.postgres.yml exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        print_info "Local PostgreSQL is running and accessible"
    else
        print_error "Local PostgreSQL is not accessible"
        exit 1
    fi
}

# Function to create backup using Docker
create_backup() {
    print_step "Creating backup from local PostgreSQL..."
    
    # Create backup directory if it doesn't exist
    mkdir -p ./data
    
    # Generate timestamp for backup filename
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="db_backup_local_$TIMESTAMP.dump"
    
    print_info "Backup file: ./data/$BACKUP_FILE"
    
    # Create temporary environment file for Docker
    local temp_env_file="./temp_local.env"
    cat > "$temp_env_file" << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=${DB_PORT:-5432}
BACKUP_FILE=$BACKUP_FILE
EOF
    
    # Run backup using Docker
    print_info "Starting Docker backup container..."
    
    if docker-compose --env-file "$temp_env_file" -f docker-compose.backup.yml run --rm db-backup /bin/bash -c "
        echo 'Creating backup from local PostgreSQL...'
        
        # Wait for PostgreSQL to be ready
        until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME; do
            echo 'Waiting for PostgreSQL to be ready...'
            sleep 2
        done
        
        # Create the backup
        pg_dump \
            --host=\$DB_HOST \
            --port=\$DB_PORT \
            --username=\$DB_USER \
            --dbname=\$DB_NAME \
            --format=custom \
            --verbose \
            --file=/app/backup/data/\$BACKUP_FILE \
            --no-owner \
            --no-privileges
        
        if [ \$? -eq 0 ]; then
            echo 'Backup completed successfully!'
            
            # Create latest local backup symlink
            cd /app/backup/data
            ln -sf \$BACKUP_FILE latest_local_backup.dump
            echo 'Latest local backup symlink created'
            
            # Show backup size
            du -h \$BACKUP_FILE
        else
            echo 'Backup failed!'
            exit 1
        fi
    "; then
        print_info "Docker backup completed successfully!"
        
        # Clean up temporary env file
        rm -f "$temp_env_file"
        
        # Clean up old local backups (keep last 7 days)
        print_info "Cleaning up old local backups (keeping last 7 days)..."
        find ./data -name "db_backup_local_*.dump" -type f -mtime +7 -delete
        
        # Show backup info
        if [ -f "./data/$BACKUP_FILE" ]; then
            local backup_size=$(du -h "./data/$BACKUP_FILE" | cut -f1)
            print_info "Backup size: $backup_size"
            print_info "Backup location: ./data/$BACKUP_FILE"
        fi
        
    else
        print_error "Docker backup failed!"
        rm -f "$temp_env_file"
        exit 1
    fi
}

# Main function
main() {
    echo "========================================="
    echo "  Local PostgreSQL Docker Backup"
    echo "========================================="
    echo
    
    # Check prerequisites
    if ! command_exists docker; then
        print_error "Docker is required but not installed"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is required but not installed"
        exit 1
    fi
    
    # Load local PostgreSQL credentials
    load_docker_credentials
    
    # Check if PostgreSQL is running
    check_postgres_running
    
    # Confirm backup
    echo
    print_warning "This will create a backup from your local PostgreSQL database"
    if ! confirm "Proceed with backup from local PostgreSQL?"; then
        print_info "Backup cancelled"
        exit 0
    fi
    
    # Create backup
    create_backup
    
    echo
    print_info "Local PostgreSQL backup process completed!"
}

# Error handling
trap 'print_error "Backup failed at line $LINENO"' ERR

# Run main function
main "$@"