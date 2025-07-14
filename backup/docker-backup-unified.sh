#!/bin/bash

# Unified Docker-based backup script
# Usage: ./docker-backup-unified.sh [neon|docker]

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
    echo "Usage: $0 [neon|docker]"
    echo
    echo "Examples:"
    echo "  $0 neon    # Backup from Neon PostgreSQL"
    echo "  $0 docker  # Backup from local Docker PostgreSQL"
    echo "  $0         # Interactive selection"
}

# Function to select environment
select_environment() {
    if [ $# -eq 1 ]; then
        case "$1" in
            neon|docker) ENV="$1" ;;
            *) print_error "Invalid environment: $1"; show_usage; exit 1 ;;
        esac
    else
        echo "Select backup source:"
        echo "1) Neon PostgreSQL"
        echo "2) Local Docker PostgreSQL"
        read -p "Choose (1-2): " choice
        case $choice in
            1) ENV="neon" ;;
            2) ENV="docker" ;;
            *) print_error "Invalid choice"; exit 1 ;;
        esac
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
    
    print_info "Using $ENV PostgreSQL:"
    print_info "  Host: $DB_HOST"
    print_info "  User: $DB_USER"
    print_info "  Database: $DB_NAME"
}

# Function to check if Docker PostgreSQL is running (for docker env)
check_docker_postgres() {
    if [ "$ENV" = "docker" ]; then
        if ! docker-compose -f ../deployment/docker-compose.postgres.yml ps | grep -q "Up"; then
            print_error "Local PostgreSQL container is not running"
            print_info "Start it with: cd ../deployment && ./start-postgres.sh"
            exit 1
        fi
    fi
}

# Function to create backup
create_backup() {
    mkdir -p ./data
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="db_backup_${ENV}_$timestamp.dump"
    
    print_step "Creating backup from $ENV PostgreSQL..."
    print_info "Backup file: ./data/$backup_file"
    
    # Create temp env file for Docker
    local temp_env="./temp_$ENV.env"
    cat > "$temp_env" << EOF
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=${DB_PORT:-5432}
BACKUP_FILE=$backup_file
EOF
    
    # Run backup
    if docker-compose --env-file "$temp_env" -f docker-compose.backup.yml run --rm db-backup /bin/bash -c "
        echo 'Creating backup from $ENV PostgreSQL...'
        
        # For Docker env, wait for connection
        if [ '$ENV' = 'docker' ]; then
            until pg_isready -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME; do
                echo 'Waiting for PostgreSQL...'
                sleep 2
            done
        fi
        
        pg_dump postgresql://\$DB_USER:\$DB_PASSWORD@\$DB_HOST:\$DB_PORT/\$DB_NAME \
            --format=custom --verbose --no-owner --no-privileges \
            --file=/app/backup/data/\$BACKUP_FILE
        
        if [ \$? -eq 0 ]; then
            cd /app/backup/data
            ln -sf \$BACKUP_FILE latest_${ENV}_backup.dump
            echo 'Backup completed successfully!'
            du -h \$BACKUP_FILE
        else
            exit 1
        fi
    "; then
        print_info "Backup completed successfully!"
        rm -f "$temp_env"
        
        # Cleanup old backups (keep last 7 days)
        find ./data -name "db_backup_${ENV}_*.dump" -type f -mtime +7 -delete
    else
        print_error "Backup failed!"
        rm -f "$temp_env"
        exit 1
    fi
}

# Main function
main() {
    echo "========================================"
    echo "  Unified PostgreSQL Docker Backup"
    echo "========================================"
    echo
    
    # Check prerequisites
    command -v docker >/dev/null || { print_error "Docker required"; exit 1; }
    command -v docker-compose >/dev/null || { print_error "Docker Compose required"; exit 1; }
    
    # Select environment
    select_environment "$@"
    
    # Load environment
    load_environment
    
    # Check Docker PostgreSQL if needed
    check_docker_postgres
    
    # Confirm and create backup
    echo
    print_warning "This will create a backup from $ENV PostgreSQL"
    read -p "Proceed? (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]] || { print_info "Cancelled"; exit 0; }
    
    create_backup
    
    echo
    print_info "$ENV PostgreSQL backup completed!"
}

# Error handling
trap 'print_error "Backup failed at line $LINENO"' ERR

# Run main
main "$@"