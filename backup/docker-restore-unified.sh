#!/bin/bash

# Unified Docker-based restore script
# Usage: ./docker-restore-unified.sh [docker] [backup_file]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# Function to show usage
show_usage() {
    echo "Usage: $0 [docker] [backup_file]"
    echo
    echo "Examples:"
    echo "  $0 docker                           # Restore latest backup to Docker PostgreSQL"
    echo "  $0 docker backup_file.dump         # Restore specific backup to Docker PostgreSQL"
    echo "  $0                                  # Interactive mode"
    echo
    echo "Note: Only Docker PostgreSQL restore is supported (you don't restore to Neon)"
}

# Function to select target environment
select_environment() {
    if [ $# -ge 1 ]; then
        case "$1" in
            docker) ENV="docker" ;;
            *) print_error "Invalid environment: $1. Only 'docker' is supported."; show_usage; exit 1 ;;
        esac
    else
        print_info "Restore target: Docker PostgreSQL (only option)"
        ENV="docker"
    fi
}

# Function to load environment
load_environment() {
    local env_file="../.env.db.$ENV"
    
    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        exit 1
    fi
    
    set -a; source "$env_file"; set +a
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        print_error "Missing required credentials in $env_file"
        exit 1
    fi
    
    print_info "Restore target - Docker PostgreSQL:"
    print_info "  Host: $DB_HOST"
    print_info "  User: $DB_USER"
    print_info "  Database: $DB_NAME"
}

# Function to check if Docker PostgreSQL is running
check_docker_postgres() {
    if ! docker-compose -f ../deployment/docker-compose.postgres.yml ps | grep -q "Up"; then
        print_error "Local PostgreSQL container is not running"
        print_info "Start it with: cd ../deployment && ./start-postgres.sh"
        exit 1
    fi
}

# Function to find backup file
find_backup_file() {
    local backup_file=""
    
    if [ $# -ge 2 ] && [ -n "$2" ]; then
        backup_file="$2"
        if [ ! -f "$backup_file" ]; then
            # Try relative to data directory
            if [ -f "./data/$backup_file" ]; then
                backup_file="./data/$backup_file"
            else
                print_error "Backup file not found: $backup_file"
                exit 1
            fi
        fi
    else
        # Look for latest backups in priority order
        for latest in "./data/latest_backup.dump" "./data/latest_neon_backup.dump" "./data/latest_docker_backup.dump"; do
            if [ -f "$latest" ]; then
                backup_file="$latest"
                print_info "Using latest backup: $(basename "$(readlink "$latest" || echo "$latest")")"
                break
            fi
        done
        
        if [ -z "$backup_file" ]; then
            print_error "No backup file found"
            print_info "Available backups:"
            ls -la ./data/*.dump 2>/dev/null || print_warning "No backup files in ./data/"
            exit 1
        fi
    fi
    
    echo "$backup_file"
}

# Function to restore backup
restore_backup() {
    local backup_file="$1"
    local backup_filename=$(basename "$backup_file")
    
    print_step "Restoring backup to Docker PostgreSQL..."
    print_info "Source: $backup_filename"
    
    # Create temp env file
    local temp_env="./temp_restore.env"
    cat > "$temp_env" << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=${DB_PORT:-5432}
BACKUP_FILE=$backup_filename
EOF
    
    # Warning about destructive operation
    print_warning "This will restore the database and may overwrite existing data"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || { print_info "Cancelled"; rm -f "$temp_env"; exit 0; }
    
    # Run restore
    if docker-compose --env-file "$temp_env" -f docker-compose.backup.yml run --rm db-backup /bin/bash -c "
        echo 'Restoring backup to Docker PostgreSQL...'
        
        # Wait for PostgreSQL
        until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME; do
            echo 'Waiting for PostgreSQL...'
            sleep 2
        done
        
        # Restore
        pg_restore \
            --host=\$DB_HOST --port=\$DB_PORT --username=\$DB_USER --dbname=\$DB_NAME \
            --verbose --clean --if-exists --no-owner --no-privileges \
            /app/backup/data/\$BACKUP_FILE
        
        if [ \$? -eq 0 ]; then
            echo 'Restore completed!'
            psql postgresql://\$DB_USER:\$DB_PASSWORD@\$DB_HOST:\$DB_PORT/\$DB_NAME \
                -c \"SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';\"
        else
            exit 1
        fi
    "; then
        print_info "Restore completed successfully!"
        rm -f "$temp_env"
    else
        print_error "Restore failed!"
        rm -f "$temp_env"
        exit 1
    fi
}

# Main function
main() {
    echo "========================================"
    echo "  Unified PostgreSQL Docker Restore"
    echo "========================================"
    echo
    
    # Check prerequisites
    command -v docker >/dev/null || { print_error "Docker required"; exit 1; }
    command -v docker-compose >/dev/null || { print_error "Docker Compose required"; exit 1; }
    
    # Select environment (only docker supported)
    select_environment "$@"
    
    # Load environment
    load_environment
    
    # Check Docker PostgreSQL
    check_docker_postgres
    
    # Find backup file
    local backup_file
    backup_file=$(find_backup_file "$@")
    
    # Show restore plan
    echo
    print_info "Restore plan:"
    print_info "  Source: $(basename "$backup_file")"
    print_info "  Target: Docker PostgreSQL ($DB_HOST:${DB_PORT:-5432}/$DB_NAME)"
    echo
    
    # Restore backup
    restore_backup "$backup_file"
    
    echo
    print_info "Docker PostgreSQL restore completed!"
}

# Error handling
trap 'print_error "Restore failed at line $LINENO"' ERR

# Run main
main "$@"