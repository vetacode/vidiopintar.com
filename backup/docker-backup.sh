#!/bin/bash

# Docker-based database backup script for Neon PostgreSQL
# This script creates backups from the Neon database using a Docker container

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

# Function to load Neon credentials from .env.db.neon
load_neon_credentials() {
    local neon_env_file="../.env.db.neon"
    
    if [ ! -f "$neon_env_file" ]; then
        print_error "Neon environment file not found: $neon_env_file"
        print_error "Please create .env.db.neon with your Neon credentials"
        exit 1
    fi
    
    # Load Neon credentials
    set -a
    source "$neon_env_file"
    set +a
    
    # Validate credentials
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        print_error "Missing required Neon credentials in $neon_env_file"
        print_error "Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
        exit 1
    fi
    
    print_info "Using Neon credentials:"
    print_info "  Host: $DB_HOST"
    print_info "  User: $DB_USER"
    print_info "  Database: $DB_NAME"
}

# Function to create backup using Docker
create_backup() {
    print_step "Creating backup from Neon PostgreSQL..."
    
    # Create backup directory if it doesn't exist
    mkdir -p ./data
    
    # Generate timestamp for backup filename
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="db_backup_$TIMESTAMP.dump"
    
    print_info "Backup file: ./data/$BACKUP_FILE"
    
    # Create temporary environment file for Docker
    local temp_env_file="./temp_neon.env"
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
        echo 'Creating backup from Neon...'
        pg_dump postgresql://\$DB_USER:\$DB_PASSWORD@\$DB_HOST:\$DB_PORT/\$DB_NAME \
            --format=custom \
            --verbose \
            --file=/app/backup/data/\$BACKUP_FILE \
            --no-owner \
            --no-privileges
        
        if [ \$? -eq 0 ]; then
            echo 'Backup completed successfully!'
            
            # Create latest backup symlink
            cd /app/backup/data
            ln -sf \$BACKUP_FILE latest_backup.dump
            echo 'Latest backup symlink created'
            
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
        
        # Clean up old backups (keep last 7 days)
        print_info "Cleaning up old backups (keeping last 7 days)..."
        find ./data -name "db_backup_*.dump" -type f -mtime +7 -delete
        
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
    echo "  Neon PostgreSQL Docker Backup"
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
    
    # Load Neon credentials
    load_neon_credentials
    
    # Confirm backup
    echo
    print_warning "This will create a backup from your Neon PostgreSQL database"
    if ! confirm "Proceed with backup from Neon?"; then
        print_info "Backup cancelled"
        exit 0
    fi
    
    # Create backup
    create_backup
    
    echo
    print_info "Neon backup process completed!"
}

# Error handling
trap 'print_error "Backup failed at line $LINENO"' ERR

# Run main function
main "$@"