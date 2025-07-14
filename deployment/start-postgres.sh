#!/bin/bash

# Start PostgreSQL 17 production container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if .env file exists
if [ ! -f ../.env ]; then
    print_error ".env file not found in parent directory!"
    exit 1
fi

# Load and export environment variables
set -a  # automatically export all variables
source ../.env
set +a  # stop automatically exporting

print_info "Starting PostgreSQL 17 production container..."
print_info "Database: $DB_NAME"
print_info "User: $DB_USER"
print_info "Port: ${DB_PORT:-5432}"

# Create postgres directories if they don't exist
mkdir -p ./postgres-init ./postgres-data

# Start the container
if docker-compose -f docker-compose.postgres.yml up -d; then
    print_info "PostgreSQL container started successfully!"
    
    # Wait for database to be ready
    print_info "Waiting for database to be ready..."
    
    # Check health status
    for i in {1..30}; do
        if docker-compose -f docker-compose.postgres.yml exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
            print_info "Database is ready!"
            break
        fi
        
        if [ $i -eq 30 ]; then
            print_error "Database failed to start within 30 seconds"
            docker-compose -f docker-compose.postgres.yml logs postgres
            exit 1
        fi
        
        echo -n "."
        sleep 1
    done
    
    print_info "PostgreSQL 17 is running at localhost:${DB_PORT:-5432}"
    print_info "Connection string: postgresql://$DB_USER:***@localhost:${DB_PORT:-5432}/$DB_NAME"
    
else
    print_error "Failed to start PostgreSQL container"
    exit 1
fi

print_info "Use './stop-postgres.sh' to stop the container"
print_info "Use './backup/docker-restore.sh' to restore your data"