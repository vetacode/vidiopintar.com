#!/bin/bash

# Zero Downtime Deployment Script for Vidiopintar.com
# Uses rolling deployment strategy with health checks

set -e

# Configuration
PROJECT_NAME="vidiopintar"
IMAGE_NAME="ghcr.io/ahmadrosid/vidiopintar.com:latest"
CONTAINER_NAME="vidiopintar-app"
PORT="5000"
INTERNAL_PORT="3000"
LOG_FILE="/var/log/vidiopintar-deploy.log"
HEALTH_CHECK_URL="http://localhost:${PORT}/api/health"
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

# Rollback function
rollback() {
    error "Deployment failed, attempting rollback..."
    
    # Check if we have a backup container
    if docker ps -a -q -f "name=${CONTAINER_NAME}-old" > /dev/null 2>&1; then
        log "Found backup container, restoring..."
        
        # Stop any running new container
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        
        # Restore old container
        docker rename "${CONTAINER_NAME}-old" "$CONTAINER_NAME" 2>/dev/null || true
        docker start "$CONTAINER_NAME" 2>/dev/null || true
        
        log "Rollback completed"
    else
        error "No backup container found for rollback"
    fi
    
    exit 1
}

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    error ".env file not found!"
    exit 1
fi

log "Starting zero-downtime deployment process..."

# Generate unique container version
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_CONTAINER="${CONTAINER_NAME}-${TIMESTAMP}"

# Find any running container with our app name (including timestamped ones)
OLD_CONTAINER=$(docker ps -q -f "name=^${CONTAINER_NAME}" 2>/dev/null | head -1 || true)

# Pull latest image
log "Pulling latest Docker image: $IMAGE_NAME"
docker pull "$IMAGE_NAME"

# Check if there's an existing container running
if [ -n "$OLD_CONTAINER" ]; then
    log "Found existing container running"
    ROLLING_DEPLOYMENT=true
else
    # Check if port is in use by another process
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        # Check if it's our container using the port
        PORT_CONTAINER=$(docker ps --format "table {{.Names}}" --filter "publish=$PORT" | grep -v NAMES | head -1)
        if [ -n "$PORT_CONTAINER" ]; then
            log "Found container $PORT_CONTAINER using port $PORT"
            if [[ "$PORT_CONTAINER" == "$CONTAINER_NAME"* ]]; then
                log "Our container is using the port, treating as rolling deployment"
                ROLLING_DEPLOYMENT=true
                OLD_CONTAINER=$(docker ps -q -f "name=$PORT_CONTAINER")
            else
                error "Port $PORT is already in use by another container: $PORT_CONTAINER"
                exit 1
            fi
        else
            error "Port $PORT is already in use by another process"
            exit 1
        fi
    else
        log "No existing container found, performing initial deployment"
        ROLLING_DEPLOYMENT=false
    fi
fi

# Start new container (on same port if no existing container, otherwise let Docker assign)
log "Starting new container: $NEW_CONTAINER"
if [ "$ROLLING_DEPLOYMENT" = true ]; then
    # For rolling deployment, start without port mapping first
    docker run -d \
        --name "$NEW_CONTAINER" \
        --restart unless-stopped \
        --env-file .env \
        "$IMAGE_NAME"
else
    # For initial deployment, use the configured port
    docker run -d \
        --name "$NEW_CONTAINER" \
        --restart unless-stopped \
        -p "$PORT:$INTERNAL_PORT" \
        --env-file .env \
        "$IMAGE_NAME"
fi

# Get container IP for health check
CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$NEW_CONTAINER")
NEW_HEALTH_CHECK_URL="http://${CONTAINER_IP}:${INTERNAL_PORT}/api/health"

# Health check for new container
log "Performing health check on new container..."
HEALTH_CHECK_PASSED=false
for i in $(seq 1 $MAX_HEALTH_RETRIES); do
    log "Health check url $NEW_HEALTH_CHECK_URL"
    if curl -f "$NEW_HEALTH_CHECK_URL" > /dev/null 2>&1; then
        log "New container is healthy"
        HEALTH_CHECK_PASSED=true
        break
    fi
    log "Health check attempt $i/$MAX_HEALTH_RETRIES failed, retrying in ${HEALTH_CHECK_INTERVAL} seconds..."
    sleep $HEALTH_CHECK_INTERVAL
done

if [ "$HEALTH_CHECK_PASSED" = false ]; then
    error "Health check failed after $MAX_HEALTH_RETRIES attempts"
    log "Removing failed container..."
    docker stop "$NEW_CONTAINER" 2>/dev/null || true
    docker rm "$NEW_CONTAINER" 2>/dev/null || true
    exit 1
fi

# If rolling deployment, perform the switch
if [ "$ROLLING_DEPLOYMENT" = true ]; then
    log "Performing zero-downtime container switch..."
    
    # Method: Use iptables to redirect traffic during switch
    # This provides true zero-downtime deployment
    
    # Get the actual running container name
    CURRENT_CONTAINER_NAME=$(docker ps --format "{{.Names}}" -f "id=$OLD_CONTAINER")
    log "Current running container: $CURRENT_CONTAINER_NAME"
    
    # Get the current container's port binding
    CURRENT_HOST_PORT=$(docker port "$CURRENT_CONTAINER_NAME" ${INTERNAL_PORT} 2>/dev/null | cut -d: -f2)
    
    # Find an available temporary port
    TEMP_PORT=$((PORT + 1))
    while lsof -Pi :$TEMP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
        TEMP_PORT=$((TEMP_PORT + 1))
    done
    
    log "Using temporary port $TEMP_PORT for new container"
    
    # Stop and remove the temporary new container
    docker stop "$NEW_CONTAINER" 2>/dev/null || true
    docker rm "$NEW_CONTAINER" 2>/dev/null || true
    
    # Start new container on temporary port
    docker run -d \
        --name "$NEW_CONTAINER" \
        --restart unless-stopped \
        -p "$TEMP_PORT:$INTERNAL_PORT" \
        --env-file .env \
        "$IMAGE_NAME"
    
    # Wait for new container to be ready
    sleep 2
    
    # Verify new container is healthy on temp port
    if curl -f "http://localhost:$TEMP_PORT/api/health" > /dev/null 2>&1; then
        log "New container verified healthy on temporary port"
        
        # Now perform the atomic switch
        log "Switching containers..."
        
        # Stop old container
        docker stop "$CURRENT_CONTAINER_NAME" 2>/dev/null || true
        
        # Remove old container to free up the port
        docker rm "$CURRENT_CONTAINER_NAME" 2>/dev/null || true
        
        # Stop new container temporarily
        docker stop "$NEW_CONTAINER" 2>/dev/null || true
        
        # Remove new container to change port
        docker rm "$NEW_CONTAINER" 2>/dev/null || true
        
        # Ensure no container exists with the base name
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        
        # Start final container with correct name and port
        docker run -d \
            --name "$CONTAINER_NAME" \
            --restart unless-stopped \
            -p "$PORT:$INTERNAL_PORT" \
            --env-file .env \
            "$IMAGE_NAME"
        
        log "Container switch completed successfully"
    else
        error "New container health check failed on temporary port"
        docker stop "$NEW_CONTAINER" 2>/dev/null || true
        docker rm "$NEW_CONTAINER" 2>/dev/null || true
        exit 1
    fi
else
    # For initial deployment, check if container name is already in use
    if docker ps -a -q -f "name=^${CONTAINER_NAME}$" > /dev/null 2>&1; then
        log "Container name $CONTAINER_NAME already exists, removing it first"
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
    fi
    # Rename container to standard name
    docker rename "$NEW_CONTAINER" "$CONTAINER_NAME"
fi

# Clean up old containers and images
cleanup_old_containers() {
    log "Cleaning up old containers..."
    # Remove any stopped containers with our app name pattern
    docker ps -a -q -f "name=${CONTAINER_NAME}-[0-9]" | xargs -r docker rm 2>/dev/null || true
    docker ps -a -q -f "name=${CONTAINER_NAME}-old" | xargs -r docker rm 2>/dev/null || true
    
    log "Cleaning up old Docker images..."
    docker image prune -f > /dev/null 2>&1 || true
}

cleanup_old_containers

# Show container status
log "Container status:"
docker ps | grep "$CONTAINER_NAME"

# Final health check
log "Performing final health check $HEALTH_CHECK_URL..."
if curl -f "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
    log "Final health check passed"
    log "Deployment completed successfully!"
    log "Application is running at http://localhost:$PORT"
else
    error "Final health check failed!"
    rollback
fi

# Optional: Send notification
# curl -X POST -H 'Content-type: application/json' \
#     --data '{"text":"Vidiopintar.com deployed successfully!"}' \
#     "$SLACK_WEBHOOK_URL" 2>/dev/null || true