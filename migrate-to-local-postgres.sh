#!/bin/bash

# Automated Migration Script: Neon to Local PostgreSQL
# This script automates the migration from Neon PostgreSQL to local Docker PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user confirmation
confirm() {
    local prompt="$1"
    local default="${2:-N}"
    
    while true; do
        read -p "$prompt (y/N): " -n 1 -r
        echo
        
        if [[ -z "$REPLY" ]]; then
            REPLY="$default"
        fi
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            return 0
        elif [[ $REPLY =~ ^[Nn]$ ]]; then
            return 1
        else
            echo "Please answer y or n."
        fi
    done
}

# Function to switch to Docker environment
switch_to_docker_env() {
    if [ ! -f .env.db.docker ]; then
        print_error ".env.db.docker file not found!"
        print_error "Please create .env.db.docker with local PostgreSQL credentials"
        exit 1
    fi
    
    # Copy Docker environment to main .env
    cp .env.db.docker .env
    print_info "Switched to Docker PostgreSQL environment"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    local missing_tools=()
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "Missing required tools: ${missing_tools[*]}"
        print_error "Please install the missing tools and try again."
        exit 1
    fi
    
    if [ ! -f .env.db.docker ]; then
        print_error ".env.db.docker file not found!"
        print_error "Please create .env.db.docker with local PostgreSQL credentials"
        exit 1
    fi
    
    if [ ! -f .env.db.neon ]; then
        print_error ".env.db.neon file not found!"
        print_error "Please create .env.db.neon with Neon credentials"
        exit 1
    fi
    
    if [ ! -d backup ]; then
        print_error "backup/ directory not found!"
        exit 1
    fi
    
    if [ ! -d deployment ]; then
        print_error "deployment/ directory not found!"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to validate backup exists
validate_backup() {
    print_step "Validating backup files..."
    
    if [ ! -d backup/data ]; then
        print_error "backup/data directory not found!"
        exit 1
    fi
    
    local backup_files=(backup/data/*.dump)
    if [ ! -f "${backup_files[0]}" ]; then
        print_error "No backup files found in backup/data/"
        print_info "Please run: cd backup && ./docker-backup-unified.sh neon"
        exit 1
    fi
    
    local latest_backup="backup/data/latest_backup.dump"
    if [ ! -f "$latest_backup" ]; then
        print_warning "latest_backup.dump not found, will use most recent backup"
    fi
    
    print_success "Backup files validated"
}

# Function to create backup from Neon (if needed)
create_backup_from_neon() {
    print_step "Checking if backup from Neon is needed..."
    
    # Check if we have recent backup (less than 1 day old)
    local latest_backup="backup/data/latest_backup.dump"
    if [ -f "$latest_backup" ]; then
        local backup_age=$(( ($(date +%s) - $(stat -f %m "$latest_backup")) / 86400 ))
        if [ $backup_age -lt 1 ]; then
            print_info "Recent backup found (${backup_age} days old), skipping Neon backup"
            return 0
        fi
    fi
    
    if confirm "Create fresh backup from Neon before migration?"; then
        print_info "Creating backup from Neon..."
        cd backup
        if ./docker-backup-unified.sh neon; then
            print_success "Neon backup created successfully"
        else
            print_error "Failed to create Neon backup"
            exit 1
        fi
        cd ..
    fi
}

# Function to start PostgreSQL container
start_postgres() {
    print_step "Starting PostgreSQL container..."
    
    cd deployment
    
    # Check if container is already running
    if docker-compose -f docker-compose.postgres.yml ps | grep -q "Up"; then
        print_info "PostgreSQL container already running"
        cd ..
        return 0
    fi
    
    if ./start-postgres.sh; then
        print_success "PostgreSQL container started successfully"
    else
        print_error "Failed to start PostgreSQL container"
        exit 1
    fi
    
    cd ..
}

# Function to restore data
restore_data() {
    print_step "Restoring data to local PostgreSQL..."
    
    cd backup
    
    # Use the docker restore script with auto-confirmation
    if echo "y" | ./docker-restore-unified.sh docker; then
        print_success "Data restored successfully"
    else
        print_error "Failed to restore data"
        exit 1
    fi
    
    cd ..
}

# Function to verify migration
verify_migration() {
    print_step "Verifying migration..."
    
    cd deployment
    
    # Check if database is accessible
    if docker-compose -f docker-compose.postgres.yml exec postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        print_success "Database is accessible"
    else
        print_error "Database is not accessible"
        exit 1
    fi
    
    # Get table count
    local table_count=$(docker-compose -f docker-compose.postgres.yml exec postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' \n' || echo "0")
    
    if [ "$table_count" -gt 0 ]; then
        print_success "Database contains $table_count tables"
    else
        print_warning "Database appears to be empty or inaccessible"
    fi
    
    cd ..
}

# Function to test application connection
test_application() {
    print_step "Testing application database connection..."
    
    # Check if npm is available and package.json exists
    if command_exists npm && [ -f package.json ]; then
        print_info "Running database connection test..."
        
        # Try to run migration check (this will test the connection)
        if npm run db:push --dry-run >/dev/null 2>&1; then
            print_success "Application can connect to database"
        else
            print_warning "Application connection test failed, but database is running"
            print_info "You may need to restart your application"
        fi
    else
        print_info "Skipping application test (npm or package.json not found)"
    fi
}

# Function to show connection details
show_connection_details() {
    print_step "Migration completed successfully!"
    echo
    print_info "Database connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo
    print_info "Useful commands:"
    echo "  Connect to database: cd deployment && ./connect-postgres.sh"
    echo "  View logs: cd deployment && ./postgres-logs.sh"
    echo "  Stop database: cd deployment && ./stop-postgres.sh"
    echo "  Create backup: cd backup && ./docker-backup-unified.sh docker"
    echo
    print_info "Your .env now uses local PostgreSQL from .env.db.docker"
}

# Function to show rollback instructions
show_rollback_instructions() {
    echo
    print_info "Rollback instructions (if needed):"
    echo "  1. Run the rollback script: ./rollback-to-neon.sh"
    echo "  2. Or manually: cp .env.db.neon .env"
    echo "  3. Stop local PostgreSQL: cd deployment && ./stop-postgres.sh"
    echo "  4. Restart your application"
}

# Main migration function
main() {
    echo "========================================="
    echo "  Neon to Local PostgreSQL Migration"
    echo "========================================="
    echo
    
    # Load environment variables
    if [ -f .env ]; then
        set -a
        source .env
        set +a
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Validate backup
    validate_backup
    
    # Show migration plan
    echo
    print_info "Migration Plan:"
    echo "  1. Switch to Docker PostgreSQL environment"
    echo "  2. Create backup from Neon (if needed)"
    echo "  3. Start local PostgreSQL container"
    echo "  4. Restore data from backup"
    echo "  5. Verify migration"
    echo "  6. Test application connection"
    echo
    
    if ! confirm "Proceed with migration?"; then
        print_info "Migration cancelled"
        exit 0
    fi
    
    # Start migration process
    echo
    print_info "Starting migration process..."
    
    # Switch to Docker environment
    switch_to_docker_env
    
    # Create backup from Neon if needed
    create_backup_from_neon
    
    # Start PostgreSQL container
    start_postgres
    
    # Restore data
    restore_data
    
    # Verify migration
    verify_migration
    
    # Test application connection
    test_application
    
    # Show connection details
    show_connection_details
    
    # Show rollback instructions
    show_rollback_instructions
    
    echo
    print_success "Migration completed successfully!"
    print_info "Your application is now using local PostgreSQL"
}

# Error handling
trap 'print_error "Migration failed at line $LINENO"' ERR

# Run main function
main "$@"