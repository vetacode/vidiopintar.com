#!/bin/bash

# View PostgreSQL 17 container logs

echo "Viewing PostgreSQL container logs (Ctrl+C to exit)..."
docker-compose -f docker-compose.postgres.yml logs -f postgres