#!/bin/bash

# Docker-based database restore script for Local PostgreSQL
# This script restores backups to the local PostgreSQL database using Docker

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

# Function to find backup file
find_backup_file() {
    local backup_file=""
    
    # Check if backup file was provided as argument
    if [ $# -eq 1 ]; then
        backup_file="$1"
        if [ ! -f "$backup_file" ]; then
            print_error "Backup file not found: $backup_file"
            exit 1
        fi
    elif [ -f "./data/latest_backup.dump" ]; then
        backup_file="./data/latest_backup.dump"
        print_info "Using latest backup file"
    else
        print_error "No backup file specified and no latest backup found"
        print_info "Usage: $0 [backup_file]"
        print_info "Available backups:"
        ls -la ./data/*.dump 2>/dev/null || print_warning "No backup files found"
        exit 1
    fi
    
    echo "$backup_file"
}

# Function to restore backup using Docker
restore_backup() {
    local backup_file="$1"
    
    print_step "Restoring backup to local PostgreSQL..."
    print_info "Backup file: $backup_file"
    
    # Get just the filename for Docker
    local backup_filename=$(basename "$backup_file")
    
    # Create temporary environment file for Docker
    local temp_env_file="./temp_local.env"
    cat > "$temp_env_file" << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=${DB_PORT:-5432}
BACKUP_FILE=$backup_filename
EOF
    
    # Warning about destructive operation
    print_warning "This will restore the database and may overwrite existing data in local PostgreSQL"
    if ! confirm "Are you sure you want to continue?"; then
        print_info "Restore cancelled"
        rm -f "$temp_env_file"
        exit 0
    fi
    
    # Run restore using Docker (connect to existing PostgreSQL container)
    print_info "Starting Docker restore process..."
    
    if docker-compose --env-file "$temp_env_file" -f docker-compose.backup.yml run --rm db-backup /bin/bash -c "
        echo 'Restoring backup to local PostgreSQL...'
        
        # Wait for PostgreSQL to be ready
        until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME; do
            echo 'Waiting for PostgreSQL to be ready...'
            sleep 2
        done
        
        # Restore the backup
        pg_restore \
            --host=\$DB_HOST \
            --port=\$DB_PORT \
            --username=\$DB_USER \
            --dbname=\$DB_NAME \
            --verbose \
            --clean \
            --if-exists \
            --no-owner \
            --no-privileges \
            /app/backup/data/\$BACKUP_FILE
        
        if [ \$? -eq 0 ]; then
            echo 'Restore completed successfully!'
            
            # Show table count
            psql postgresql://\$DB_USER:\$DB_PASSWORD@\$DB_HOST:\$DB_PORT/\$DB_NAME -c \"SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';\"
        else
            echo 'Restore failed!'
            exit 1
        fi
    "; then
        print_info "Docker restore completed successfully!"
        
        # Clean up temporary env file
        rm -f "$temp_env_file"
        
    else
        print_error "Docker restore failed!"
        rm -f "$temp_env_file"
        exit 1
    fi
}

# Function to verify restore
verify_restore() {
    print_step "Verifying restore..."
    
    # Get table count from local PostgreSQL
    local table_count=$(docker-compose -f ../deployment/docker-compose.postgres.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
    
    if [ "$table_count" -gt 0 ]; then
        print_info "Restore verification successful: $table_count tables found"
    else
        print_warning "Restore verification failed: no tables found or database inaccessible"
    fi
}

# Main function
main() {
    echo "========================================="
    echo "  Local PostgreSQL Docker Restore"
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
    
    # Find backup file
    local backup_file
    backup_file=$(find_backup_file "$@")
    
    echo
    print_info "Restore plan:"
    print_info "  Source: $backup_file"
    print_info "  Target: Local PostgreSQL ($DB_HOST:${DB_PORT:-5432}/$DB_NAME)"
    echo
    
    # Restore backup
    restore_backup "$backup_file"
    
    # Verify restore
    verify_restore
    
    echo
    print_info "Local PostgreSQL restore process completed!"
}

# Error handling
trap 'print_error "Restore failed at line $LINENO"' ERR

# Run main function
main "$@"