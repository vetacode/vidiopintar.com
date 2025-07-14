#!/bin/bash

# Database backup script
# Reads environment variables and creates a PostgreSQL dump

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Validate required environment variables
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ]; then
    print_error "Missing required environment variables. Please check your .env file."
    print_error "Required: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
    exit 1
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="./backup/data"
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.dump"

# Build connection string
CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

print_info "Starting database backup..."
print_info "Database: $DB_NAME"
print_info "Host: $DB_HOST:$DB_PORT"
print_info "User: $DB_USER"
print_info "Backup file: $BACKUP_FILE"

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    print_error "pg_dump could not be found. Please install PostgreSQL client tools."
    exit 1
fi

# Perform the backup
if pg_dump "$CONNECTION_STRING" \
    --format=custom \
    --verbose \
    --file="$BACKUP_FILE" \
    --no-owner \
    --no-privileges; then
    
    print_info "Backup completed successfully!"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    print_info "Backup size: $BACKUP_SIZE"
    
    # Create a latest backup symlink
    LATEST_BACKUP="$BACKUP_DIR/latest_backup.dump"
    ln -sf "$(basename "$BACKUP_FILE")" "$LATEST_BACKUP"
    print_info "Latest backup symlink created: $LATEST_BACKUP"
    
else
    print_error "Backup failed!"
    exit 1
fi

# Optional: Clean up old backups (keep last 7 days)
print_info "Cleaning up old backups (keeping last 7 days)..."
find "$BACKUP_DIR" -name "db_backup_*.dump" -type f -mtime +7 -delete

print_info "Backup process completed!"