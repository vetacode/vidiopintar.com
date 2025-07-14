#!/bin/bash

# Stop PostgreSQL 17 production container

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

print_info "Stopping PostgreSQL 17 production container..."

# Stop the container
if docker-compose -f docker-compose.postgres.yml down; then
    print_info "PostgreSQL container stopped successfully!"
else
    print_error "Failed to stop PostgreSQL container"
    exit 1
fi

print_info "Database data preserved in ./postgres-data/"
print_info "To completely reset the database, manually delete the ./postgres-data/ folder"