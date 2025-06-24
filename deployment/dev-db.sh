#!/bin/bash

# Simple local PostgreSQL for development
# Alternative to docker-compose for local development

set -e

CONTAINER_NAME="vidiopintar-dev-db"
DB_NAME="vidiopintar"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT="5432"

echo "🚀 Starting local PostgreSQL for development..."

# Stop existing container if running
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Start PostgreSQL container
docker run -d \
    --name "$CONTAINER_NAME" \
    -e POSTGRES_DB="$DB_NAME" \
    -e POSTGRES_USER="$DB_USER" \
    -e POSTGRES_PASSWORD="$DB_PASSWORD" \
    -p "$DB_PORT:5432" \
    -v vidiopintar_dev_data:/var/lib/postgresql/data \
    postgres:15-alpine

echo "⏳ Waiting for PostgreSQL to start..."
sleep 5

# Wait for PostgreSQL to be ready
for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start"
        exit 1
    fi
    sleep 1
done

echo "📋 Database Connection Info:"
echo "  HOST: localhost"
echo "  PORT: $DB_PORT"
echo "  DATABASE: $DB_NAME"
echo "  USER: $DB_USER"
echo "  PASSWORD: $DB_PASSWORD"
echo ""
echo "🔗 Connection URL:"
echo "  DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
echo ""
echo "💡 To stop the database:"
echo "  docker stop $CONTAINER_NAME"
echo ""
echo "💡 To run migrations:"
echo "  npm run db:push"