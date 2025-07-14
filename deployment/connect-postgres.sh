#!/bin/bash

# Connect to PostgreSQL 17 container via psql

set -e

# Check if .env file exists
if [ ! -f ../.env ]; then
    echo "ERROR: .env file not found in parent directory!"
    exit 1
fi

# Load environment variables
source ../.env

echo "Connecting to PostgreSQL database..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Connect using psql inside the container
docker-compose -f docker-compose.postgres.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME"