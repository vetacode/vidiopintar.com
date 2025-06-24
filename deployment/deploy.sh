#!/bin/bash

# Simple VPS Deployment Script for Vidiopintar.com
# No Docker Compose - Just pure Docker commands

set -e

# Configuration
PROJECT_NAME="vidiopintar"
IMAGE_NAME="ghcr.io/${GITHUB_REPOSITORY:-ahmadrosid/vidiopintar.com}:latest"
CONTAINER_NAME="vidiopintar-app"
PORT="3000"
LOG_FILE="/var/log/vidiopintar-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    error ".env file not found!"
    exit 1
fi

log "Starting deployment process..."

# Pull latest image
log "Pulling latest Docker image: $IMAGE_NAME"
docker pull "$IMAGE_NAME"

# Stop and remove existing container
log "Stopping existing container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Start new container
log "Starting new container..."
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$PORT:3000" \
    --env-file .env \
    "$IMAGE_NAME"

# Wait for container to start
log "Waiting for container to start..."
sleep 10

# Health check
log "Performing health check..."
for i in {1..10}; do
    if curl -f "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
        log "Application is healthy"
        break
    fi
    if [ $i -eq 10 ]; then
        error "Health check failed after 10 attempts"
        log "Rolling back..."
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        exit 1
    fi
    log "Health check attempt $i failed, retrying in 5 seconds..."
    sleep 5
done

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f > /dev/null 2>&1 || true

# Show container status
log "Container status:"
docker ps | grep "$CONTAINER_NAME"

log "Deployment completed successfully!"
log "Application is running at http://localhost:$PORT"

# Optional: Send notification
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"Vidiopintar.com deployed successfully!"}' \
#     "$SLACK_WEBHOOK_URL" 2>/dev/null || true