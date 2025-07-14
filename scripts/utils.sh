#!/bin/bash

# Shared utilities for database scripts
# Source this file in other scripts: source scripts/utils.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Common output functions
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

# Function to load and validate environment variables
load_env() {
    local env_file="${1:-.env}"
    
    # Check if .env file exists
    if [ ! -f "$env_file" ]; then
        print_error "$env_file file not found!"
        return 1
    fi
    
    # Load environment variables
    set -a
    source "$env_file"
    set +a
    
    # Validate required environment variables
    local required_vars=("DB_USER" "DB_PASSWORD" "DB_HOST" "DB_PORT" "DB_NAME")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${missing_vars[*]}"
        print_error "Please check your $env_file file."
        return 1
    fi
    
    return 0
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    local host="${1:-localhost}"
    local port="${2:-5432}"
    local user="${3:-$DB_USER}"
    local database="${4:-$DB_NAME}"
    local timeout="${5:-30}"
    
    print_info "Waiting for PostgreSQL to be ready..."
    
    for i in $(seq 1 $timeout); do
        if pg_isready -h "$host" -p "$port" -U "$user" -d "$database" >/dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            return 0
        fi
        
        if [ $i -eq $timeout ]; then
            print_error "PostgreSQL failed to start within $timeout seconds"
            return 1
        fi
        
        echo -n "."
        sleep 1
    done
}

# Function to create backup directory
create_backup_dir() {
    local backup_dir="${1:-./backup/data}"
    mkdir -p "$backup_dir"
    print_info "Backup directory created: $backup_dir"
}

# Function to generate timestamp
generate_timestamp() {
    date +"%Y%m%d_%H%M%S"
}

# Function to build connection string
build_connection_string() {
    local user="${1:-$DB_USER}"
    local password="${2:-$DB_PASSWORD}"
    local host="${3:-$DB_HOST}"
    local port="${4:-$DB_PORT}"
    local database="${5:-$DB_NAME}"
    
    echo "postgresql://$user:$password@$host:$port/$database"
}

# Function to check Docker availability
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed or not in PATH"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running"
        return 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed or not in PATH"
        return 1
    fi
    
    return 0
}

# Function to cleanup old backups
cleanup_old_backups() {
    local backup_dir="${1:-./backup/data}"
    local days="${2:-7}"
    
    if [ -d "$backup_dir" ]; then
        print_info "Cleaning up backups older than $days days..."
        find "$backup_dir" -name "db_backup_*.dump" -type f -mtime +$days -delete
        print_info "Cleanup completed"
    fi
}

# Function to create symlink for latest backup
create_latest_backup_link() {
    local backup_file="$1"
    local backup_dir="$(dirname "$backup_file")"
    local latest_backup="$backup_dir/latest_backup.dump"
    
    ln -sf "$(basename "$backup_file")" "$latest_backup"
    print_info "Latest backup symlink created: $latest_backup"
}

# Function to get file size in human readable format
get_file_size() {
    local file="$1"
    if [ -f "$file" ]; then
        du -h "$file" | cut -f1
    else
        echo "0B"
    fi
}

# Function to validate backup file
validate_backup_file() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Check if file is not empty
    if [ ! -s "$backup_file" ]; then
        print_error "Backup file is empty: $backup_file"
        return 1
    fi
    
    # Check if file is a valid PostgreSQL dump (basic check)
    if ! file "$backup_file" | grep -q "PostgreSQL"; then
        print_warning "Backup file might not be a valid PostgreSQL dump"
    fi
    
    return 0
}

# Function to show script usage
show_usage() {
    local script_name="$1"
    local usage_text="$2"
    
    echo "Usage: $script_name $usage_text"
    echo
    echo "Environment variables required in .env file:"
    echo "  DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
    echo
}

# Function to log message with timestamp
log_message() {
    local message="$1"
    local log_file="${2:-/tmp/db_script.log}"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" >> "$log_file"
}

# Export all functions for use in other scripts
export -f print_info print_warning print_error print_step print_success
export -f command_exists confirm load_env wait_for_postgres
export -f create_backup_dir generate_timestamp build_connection_string
export -f check_docker cleanup_old_backups create_latest_backup_link
export -f get_file_size validate_backup_file show_usage log_message