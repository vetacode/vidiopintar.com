#!/bin/bash

# Reset PostgreSQL 17 database (DANGER: Deletes all data)

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

print_error "⚠️  DANGER: This will DELETE ALL database data!"
print_warning "This action cannot be undone!"
echo
print_info "This will:"
print_info "1. Stop the PostgreSQL container"
print_info "2. Delete the ./postgres-data/ directory"
print_info "3. Remove all database data permanently"
echo

read -p "Are you absolutely sure you want to continue? Type 'DELETE' to confirm: " -r
echo

if [[ $REPLY == "DELETE" ]]; then
    print_warning "Stopping PostgreSQL container..."
    docker-compose -f docker-compose.postgres.yml down 2>/dev/null || true
    
    print_warning "Deleting database data directory..."
    rm -rf ./postgres-data
    
    print_info "Database reset completed!"
    print_info "Run './start-postgres.sh' to create a fresh database"
    
else
    print_info "Reset cancelled. Database data preserved."
fi