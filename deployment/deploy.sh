#!/bin/bash

# Blue-Green Deployment Script for Vidiopintar.com
# Works with nginx upstream configuration on ports 5000 and 5001

set -e

# Configuration
PROJECT_NAME="vidiopintar"
IMAGE_NAME="ghcr.io/ahmadrosid/vidiopintar.com:latest"
CONTAINER_NAME="vidiopintar-app"
PORT_A="5000"
PORT_B="5001"
INTERNAL_PORT="3000"
LOG_FILE="/var/log/vidiopintar-deploy.log"
MAX_HEALTH_RETRIES=10
HEALTH_CHECK_INTERVAL=3

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

# Determine which port is currently active and which is the target
get_active_port() {
    # Check which port has a running container
    if docker ps --filter "publish=$PORT_A" --filter "name=${CONTAINER_NAME}" -q | grep -q "."; then
        echo "$PORT_A"
    elif docker ps --filter "publish=$PORT_B" --filter "name=${CONTAINER_NAME}" -q | grep -q "."; then
        echo "$PORT_B"
    else
        echo "none"
    fi
}

get_target_port() {
    local active_port=$1
    if [ "$active_port" = "$PORT_A" ]; then
        echo "$PORT_B"
    else
        echo "$PORT_A"
    fi
}

# Health check function
health_check() {
    local port=$1
    local url="http://localhost:${port}/api/health"
    
    log "Performing health check on port $port..."
    
    for i in $(seq 1 $MAX_HEALTH_RETRIES); do
        if curl -f "$url" > /dev/null 2>&1; then
            log "Health check passed on port $port"
            return 0
        fi
        log "Health check attempt $i/$MAX_HEALTH_RETRIES failed, retrying in ${HEALTH_CHECK_INTERVAL} seconds..."
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    error "Health check failed after $MAX_HEALTH_RETRIES attempts on port $port"
    return 1
}

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    error ".env file not found!"
    exit 1
fi

log "Starting blue-green deployment process..."

# Pull latest image
log "Pulling latest Docker image: $IMAGE_NAME"
docker pull "$IMAGE_NAME"

# Determine active and target ports
ACTIVE_PORT=$(get_active_port)
log "Currently active port: $ACTIVE_PORT"

if [ "$ACTIVE_PORT" = "none" ]; then
    log "No active container found, deploying to port $PORT_A"
    TARGET_PORT="$PORT_A"
else
    TARGET_PORT=$(get_target_port "$ACTIVE_PORT")
    log "Target deployment port: $TARGET_PORT"
fi

# Container names for each port
CONTAINER_A="${CONTAINER_NAME}-${PORT_A}"
CONTAINER_B="${CONTAINER_NAME}-${PORT_B}"

if [ "$TARGET_PORT" = "$PORT_A" ]; then
    TARGET_CONTAINER="$CONTAINER_A"
else
    TARGET_CONTAINER="$CONTAINER_B"
fi

# Stop and remove any existing container on target port
if docker ps -a --filter "name=${TARGET_CONTAINER}" -q | grep -q "."; then
    log "Stopping existing container on target port..."
    docker stop "$TARGET_CONTAINER" 2>/dev/null || true
    docker rm "$TARGET_CONTAINER" 2>/dev/null || true
fi

# Start new container on target port
log "Starting new container on port $TARGET_PORT..."
docker run -d \
    --name "$TARGET_CONTAINER" \
    --restart unless-stopped \
    -p "$TARGET_PORT:$INTERNAL_PORT" \
    --env-file .env \
    "$IMAGE_NAME"

# Health check on new container
if health_check "$TARGET_PORT"; then
    log "New container is healthy on port $TARGET_PORT"
    
    # Deployment successful
    log "Deployment completed successfully!"
    log "New version is running on port $TARGET_PORT"
    
    # Optional: Clean up old container after some time
    if [ "$ACTIVE_PORT" != "none" ] && [ "$ACTIVE_PORT" != "$TARGET_PORT" ]; then
        log "Previous version is still running on port $ACTIVE_PORT as fallback"
        log "To remove the old container after nginx switches traffic, run:"
        if [ "$ACTIVE_PORT" = "$PORT_A" ]; then
            log "  docker stop $CONTAINER_A && docker rm $CONTAINER_A"
        else
            log "  docker stop $CONTAINER_B && docker rm $CONTAINER_B"
        fi
    fi
    
    # Show container status
    log "Container status:"
    docker ps --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
else
    # Health check failed, clean up
    error "Deployment failed! Removing failed container..."
    docker stop "$TARGET_CONTAINER" 2>/dev/null || true
    docker rm "$TARGET_CONTAINER" 2>/dev/null || true
    
    if [ "$ACTIVE_PORT" != "none" ]; then
        log "Previous version is still running on port $ACTIVE_PORT"
    fi
    
    exit 1
fi

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker image prune -f > /dev/null 2>&1 || true

log "Deployment process completed."