#!/bin/bash

# Rollback Script: Local PostgreSQL to Neon
# This script automates the rollback from local PostgreSQL to Neon

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

# Function to switch to Neon environment
switch_to_neon_env() {
    if [ ! -f .env.db.neon ]; then
        print_error ".env.db.neon file not found!"
        print_error "Please create .env.db.neon with your Neon credentials"
        exit 1
    fi
    
    # Copy Neon environment to main .env
    cp .env.db.neon .env
    print_info "Switched to Neon PostgreSQL environment"
}

# Function to create backup before rollback
create_local_backup() {
    print_step "Creating backup of local PostgreSQL data..."
    
    # Check if PostgreSQL is running
    if ! docker-compose -f deployment/docker-compose.postgres.yml ps | grep -q "Up"; then
        print_warning "PostgreSQL container is not running, skipping backup"
        return 0
    fi
    
    if confirm "Create backup of local PostgreSQL data before rollback?"; then
        cd backup
        if ./docker-backup-unified.sh docker; then
            print_success "Local PostgreSQL backup created"
        else
            print_warning "Failed to create local backup, continuing with rollback"
        fi
        cd ..
    fi
}

# Function to stop PostgreSQL container
stop_postgres() {
    print_step "Stopping PostgreSQL container..."
    
    cd deployment
    
    if docker-compose -f docker-compose.postgres.yml ps | grep -q "Up"; then
        if confirm "Stop PostgreSQL container?"; then
            if echo "N" | ./stop-postgres.sh; then
                print_success "PostgreSQL container stopped"
            else
                print_warning "Failed to stop PostgreSQL container gracefully"
            fi
        fi
    else
        print_info "PostgreSQL container is not running"
    fi
    
    cd ..
}

# Function to restore .env configuration
restore_env() {
    print_step "Restoring .env configuration..."
    
    if confirm "Switch .env to use Neon PostgreSQL?"; then
        switch_to_neon_env
        print_success ".env switched to Neon configuration"
    else
        print_info "Manual .env restoration required"
        show_manual_env_instructions
    fi
}

# Function to show manual .env instructions
show_manual_env_instructions() {
    print_info "Manual .env configuration required:"
    echo
    echo "  Copy Neon environment to main .env:"
    echo "  cp .env.db.neon .env"
    echo
    echo "  Or copy Docker environment to main .env:"
    echo "  cp .env.db.docker .env"
    echo
}

# Function to test Neon connection
test_neon_connection() {
    print_step "Testing Neon database connection..."
    
    # Load environment variables
    if [ -f .env ]; then
        set -a
        source .env
        set +a
    fi
    
    # Create a simple connection test
    if command -v psql >/dev/null 2>&1; then
        local connection_string="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
        
        if timeout 10 psql "$connection_string" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "Neon database connection successful"
        else
            print_warning "Neon database connection failed"
            print_info "Please verify your Neon credentials in .env"
        fi
    else
        print_info "psql not found, skipping connection test"
    fi
}

# Function to show rollback completion
show_rollback_completion() {
    print_step "Rollback completed!"
    echo
    print_info "Your application is now configured to use Neon PostgreSQL"
    echo
    print_info "Next steps:"
    echo "  1. Restart your application"
    echo "  2. Verify application functionality"
    echo "  3. Test database operations"
    echo
    print_info "If you need to migrate back to local PostgreSQL:"
    echo "  ./migrate-to-local-postgres.sh"
    echo
    print_info "To remove local PostgreSQL data completely:"
    echo "  cd deployment && ./stop-postgres.sh (answer 'y' to remove volumes)"
}

# Main rollback function
main() {
    echo "========================================="
    echo "  Local PostgreSQL to Neon Rollback"
    echo "========================================="
    echo
    
    print_warning "This will rollback your database configuration to use Neon PostgreSQL"
    print_info "Your local PostgreSQL data will be preserved unless you choose to remove it"
    echo
    
    if ! confirm "Proceed with rollback to Neon?"; then
        print_info "Rollback cancelled"
        exit 0
    fi
    
    # Show rollback plan
    echo
    print_info "Rollback Plan:"
    echo "  1. Create backup of local PostgreSQL (optional)"
    echo "  2. Stop PostgreSQL container"
    echo "  3. Switch .env to Neon configuration"
    echo "  4. Test Neon connection"
    echo
    
    if ! confirm "Continue with rollback?"; then
        print_info "Rollback cancelled"
        exit 0
    fi
    
    # Start rollback process
    echo
    print_info "Starting rollback process..."
    
    # Create local backup
    create_local_backup
    
    # Stop PostgreSQL container
    stop_postgres
    
    # Switch .env to Neon configuration
    restore_env
    
    # Test Neon connection
    test_neon_connection
    
    # Show completion message
    show_rollback_completion
    
    echo
    print_success "Rollback completed successfully!"
}

# Error handling
trap 'print_error "Rollback failed at line $LINENO"' ERR

# Run main function
main "$@"